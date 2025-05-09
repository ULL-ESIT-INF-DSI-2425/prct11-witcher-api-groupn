import express from 'express';
import { Transaction } from '../models/transactions.js';

import { Good } from '../models/goods.js';
import { Hunter } from '../models/hunters.js';
import { Merchant } from '../models/merchants.js';

import { goodsDocumentInterface } from '../models/goods.js';

import { Document, Schema, Types, model } from 'mongoose';

/**
 * Enrutador para operaciones CRUD sobre transacciones.
 */
export const transactionRouter = express.Router();






//post
/**
 * Crea una nueva transacción (compra o venta).
 * @returns 201 Created o errores 400/404/500
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

    let persona;
    if (tipo === "compra") {
        persona = await Hunter.findOne({nombre});
    } else {
        persona = await Merchant.findOne({nombre});
    };
    
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
        

        let bien = await Good.findOne({nombre: nombre});
        if (nombre === "Espada de Oro") {
            console.log("\n\n\nBien: ", bien);
        }
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

/**
 * Obtiene transacciones asociadas al nombre de un hunter o merchant.
 * @returns 200 OK con las transacciones o errores 404/500
 */
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

/**
 * Filtra transacciones por rango de fechas y tipo.
 * @returns 200 OK con las transacciones o error 500
 */
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

/**
 * Obtiene una transacción por su ID.
 * @param id - ID de la transacción
 * @returns 200 OK o errores 404/500
 */
transactionRouter.get('/transactions/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            res.status(404).send();
        } else {
            res.send(transaction);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * Modifica los bienes de una transacción existente.
 * @param id - ID de la transacción
 * @returns 200 OK o errores 400/404/500
 */
transactionRouter.patch('/transactions/:id', async (req, res) => {

    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            res.status(404).send();
            return;
        }

        const persona = transaction.tipo === 'compra'
        ? await Hunter.findById(transaction.cazador?._id)
        : await Merchant.findById(transaction.mercader?._id);

        if (!persona) {
            res.status(404).send();
            return;
        }

        const allowedUpdates = ['bienes'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send();
        } else {


            const nuevosBienes = req.body.bienes;

            if (!Array.isArray(nuevosBienes) || nuevosBienes.length === 0) {
                res.status(400).send();
                return;
            }

            for (const item of transaction.bienes) {
                const bien = await Good.findById(item.bien);
                if (!bien) {
                    res.status(404).send();
                    return;
                }

                if (transaction.tipo === 'compra') {
                    bien.stock += item.cantidad;
                } else if (transaction.tipo === 'venta') {
                    bien.stock -= item.cantidad;
                }

                if (bien.stock <= 0) {
                    await Good.deleteOne({_id: bien._id});
                } else {
                    await bien.save();
                }

            }

            let valorFinal = 0;
            const bienesActualizados: {bien: Types.ObjectId; cantidad: number}[] = [];

            for (const item of nuevosBienes) {
                const bien = await Good.findOne({nombre: item.nombre});
                if (!bien) {
                    res.status(404).send();
                    return;
                }

                if (transaction.tipo === 'compra') {
                    if (bien.stock < item.cantidad) {
                        res.status(400).send();
                        return;
                    }
                    bien.stock -= item.cantidad;
                    if (bien.stock <= 0) {
                        await Good.deleteOne({_id: bien._id});
                    } else {
                        await bien.save();
                    }
                } else if (transaction.tipo === 'venta') {
                    bien.stock += item.cantidad;
                }
                valorFinal += bien.valor * item.cantidad;
                bienesActualizados.push({bien: bien._id as Types.ObjectId, cantidad: item.cantidad});
                await bien.save();
            }

            transaction.bienes = bienesActualizados;
            transaction.valor = valorFinal;
            await transaction.save();
            res.send(transaction);
        }

    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * Elimina una transacción y genera una de devolución automáticamente.
 * @param id - ID de la transacción
 * @returns 200 OK con la transacción de devolución o errores 400/404/500
 */
transactionRouter.delete('/transactions/:id', async (req, res) => {

    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            res.status(404).send();
            return;
        }

        const persona = transaction.tipo === 'compra'
        ? await Hunter.findById(transaction.cazador?._id)
        : await Merchant.findById(transaction.mercader?._id);

        if (!persona) {
            res.status(404).send();
            return;
        }
        
        const ultimaTransaction = await Transaction.findOne().sort({id: -1}).exec();
        const newId = ultimaTransaction ? ultimaTransaction.id + 1 : 1;


        // AÑADIR BIENES Y ACTUALIZAR valor
        const devolucionTransaction = new Transaction({
            id: newId,
            tipo: 'devolucion',
            cazador: transaction.tipo === 'compra' ? persona._id : undefined,
            mercader: transaction.tipo === 'venta' ? persona._id : undefined,
            bienes: [],
            fecha: new Date(),
            valor: 1,
        });

        let valorDevolucion = 0;

        for (const item of transaction.bienes) {
            const bien = await Good.findById(item.bien);

            // si el bien no existe en la base de datos no se puede llevar a cabo la devolucion
            if (!bien) {
                res.status(404).send();
                return;
            }

            if (transaction.tipo === 'compra') {
                // compra, la devolucion agrega al stock
                bien.stock += item.cantidad;
                valorDevolucion += bien.valor * item.cantidad;
            } else if (transaction.tipo === 'venta') {
                // venta, la devolucion resta el stock
                if (bien.stock < item.cantidad) {
                    res.status(400).send();
                    return;
                }

                bien.stock -= item.cantidad;
                valorDevolucion += bien.valor * item.cantidad;
            }

            devolucionTransaction.bienes.push({bien: bien._id as Types.ObjectId, cantidad: item.cantidad});
            if (bien.stock <= 0) {
                await Good.deleteOne({_id: bien._id});
            } else {
                await bien.save();
            }
            
        }

        devolucionTransaction.valor = valorDevolucion;

        await devolucionTransaction.save();

        await transaction.deleteOne({_id: transaction._id});

        res.send(devolucionTransaction);


    } catch (error) {
        res.status(500).send(error);
    }
});