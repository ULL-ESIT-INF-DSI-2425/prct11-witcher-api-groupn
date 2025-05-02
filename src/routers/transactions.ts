import express from 'express';
import { Transaction } from '../models/transactions.js';

import { Good } from '../models/goods.js';
import { Hunter } from '../models/hunters.js';
import { Merchant } from '../models/merchants.js';

import { goodsDocumentInterface } from '../models/goods.js';

import { Document, Schema, Types, model } from 'mongoose';

export const transactionRouter = express.Router();

/*
    CONSIDERACIONES A RESOLVER: 

    - Hunter o Mercader o bien no existe en la base de datos al especificar una transaccion ->

    - ¿Que ocurre con las transacciones de un Hunter o Mercader cuando este se elimina de la base de datos? -> 

    - ¿Debería borrar las transacciones relacionadas con un bien que deseo borrar de la base de datos? -> 

*/




//post
/*

    compra cazador / venta mercader

    COMPRA cazador:
        BIENES SOLICITADOS EXISTEN Y CON STOCK SUFICIENTE

    COMPRA mercader:
        Actualizar el stock de los bienes que ya existieran 
        Y crear los nuevos que no existan.

    Establecer la fecha y hora de la transaccion
    Valor

    Body de la peticion recibe la transaccion (compra de un hunter o venta de un mercader),
    en el body debe de encontrarse: 
    - nombre hunter/mercader.
    - lista de nombres de bienes y las cantidades de cada uno de ellos.


    La logica debe incorporar todo lo necesario para comprobar
    que el hunter/mercader existe previamente.

    En el caso de una compra de un Hunter se comprobará que 
    los bienes solicitados existen y que hay stock suficiente para cada uno.

    En el caso de una compra de un mercader se actualizará el stock de los bienes
    que ya existieran en la base de datos y crear los nuevos que no existieran.

    En ambos casos: establecer la fecha y hora de la transaccion, asi como 
    calcular el importe asociado a traves del numero de unidades
    especificado para cada bien involucrado en la transaccion.

    (agrupar el codigo del manejador en diferentes funciones para que sea más legible.) <<<< FALTA

    

*/


transactionRouter.post('/transactions', async (req, res) => {

try {
    const {id, tipo, nombre, bienes} = req.body;

    const idUnique = await Transaction.findOne({id});

    if(idUnique) {
        res.status(400).send();
        return;
    }

    //validar tipo
    if (tipo !== 'compra' && tipo !== 'venta') {
        res.status(400).send();
        return;
    }

    //console.log(tipo, nombre, bienes);
    const persona = tipo === 'compra'
    ? await Hunter.findOne({nombre})
    : await Merchant.findOne({nombre});

    //console.log(persona);
    // comprobar si cazador/mercader existe
    if (!persona) {
        res.status(404).send();
        return;
    }

    let valorTotal = 0;
    const bienesProcesados: {bien: Types.ObjectId; cantidad: number}[] = [];

    //comprobar cada bien individualmente
    for (const item of bienes) {
        const {nombre, cantidad} = item;
        //console.log(nombre);

        let bien = await Good.findOne({nombre: nombre});
        //para tipo compra
        if (tipo === 'compra') {
            if (!bien) {
                res.status(404).send();
                return;
            }

            //comprobar que hay más stock que la compra
            if (bien.stock < cantidad) {
                res.status(400).send();
                return;
            }

            
            bien.stock -= cantidad;

            //si el stock se queda a 0 se borra, si es mayor que 0 se actualiza el stock del bien
            if (bien.stock <= 0) {
                await Good.deleteOne({_id: bien._id});
            } else {
                await bien.save();
            }
        } else if (tipo === 'venta'){
            // si no se encontró el bien en la base de datos se crea un bien
            if (!bien) {
                //if (!item.id || !item.nombre || !item.valor) {
                //    res.status(400).send();
                //    return;
                //}
                bien = new Good({
                    id: item.id,
                    nombre: nombre,
                    descripcion: item.descripcion || 'Sin descripcion',
                    material: item.material || 'Desconocido',
                    peso: item.peso || 1,
                    valor: item.valor,
                    stock: cantidad
                });
            } else {
                // si el bien se encuentra en la base de datos se suma la cantidad de la compra al stock del bien
                bien.stock += cantidad;
            }
            await bien.save();
        }
        valorTotal += bien!.valor * cantidad;

        bienesProcesados.push({bien: bien!._id as Types.ObjectId, cantidad});
    }

    const transactionADD = new Transaction({
        id: id,
        tipo,
        cazador: tipo === 'compra' ? persona._id : undefined,
        mercader: tipo === 'venta' ? persona._id : undefined,
        bienes: bienesProcesados,
        fecha: new Date(),
        valor: valorTotal
    });

    await transactionADD.save();
    res.status(201).send(transactionADD);


} catch (error) {
    res.status(500).send(error);
}

});

//get
/*
    3 maneras diferentes:
    - query string con nombre del hunter/mercader
    - query string con fecha de inicio y fin además del tipo de transacciones (venta a cazadores, compras a mercaderes o ambas)
    - identificador unico de la transaccion (parametro dinamico /transaction/:id)

*/

// query string con nombre hunter/merchant
transactionRouter.get('/transactions/nombre', async (req, res) => {
    const filter = req.query.nombre?{nombre: req.query.nombre.toString()}:{};
    
    try {

        const cazador = await Hunter.findOne(filter);
        const mercader = await Merchant.findOne(filter);

        if (!cazador && !mercader) {
            res.status(404).send();
            return;
        }

        let transaccionesHunter = [];
        let transaccionesMerchant = [];

        if (cazador) {
            transaccionesHunter = await Transaction.find({cazador: cazador._id});
        }
        if (mercader) {
            transaccionesMerchant = await Transaction.find({mercader: mercader._id});
        }
         
        res.status(200).send([...transaccionesHunter, ...transaccionesMerchant]);

    } catch (error) {
        res.status(500).send(error);
    }
});

//query string con fecha de inicio y fin además del tipo de transacciones (venta a cazadores, compras a mercaderes o ambas)
transactionRouter.get('/transactions/fecha', async (req, res) => {
    try {
        
        const {fechaInicio, fechaFin, tipo} = req.query;
        const filtro: any = {};
        
        
        if (fechaInicio) {
            const fechaInicioDate = new Date(fechaInicio as string);
            filtro.fecha = {...filtro.fecha, $gte: fechaInicioDate};
        }

        if (fechaFin) {
            const fechaFinDate = new Date(fechaFin as string);
            filtro.fecha = {...filtro.fecha, $lte: fechaFinDate};
        }

        if (tipo === 'compra' || tipo === 'venta' || tipo === 'devolucion') {
            filtro.tipo = tipo;
        }

        const transacciones = await Transaction.find(filtro);
        
        res.status(200).send(transacciones);
    }catch (error) {
        res.status(500).send(error);
    }
});

//identificador unico de la transaccion (parametro dinamico /transaction/:id)
transactionRouter.get('/transactions/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            res.status(404).send();
        } else {
            res.send(transaction);
        }
    } catch (error) {
        res.status(500).send();
    }
});


//patch
/*
    SOLO a través del identificador unico de la transaccion (parametro dinamico /transaction/:id)
    Actualizar la informacion referente a los bienes involucrado en la transaccion.
*/ 

//delete
/*
    SOLO a través del identificador unico de la transaccion (parametro dinamico /transaction/:id)
    Al borrar una transaccion de una compra de un hunter (una devolucion), se deberá actualizar el stock de los bienes involucrados en la misma
*/