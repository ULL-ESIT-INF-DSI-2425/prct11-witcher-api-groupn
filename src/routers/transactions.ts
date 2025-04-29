import express from 'express';
import { Transaction } from '../models/transactions.js';

export const transactionRouter = express.Router();

/*
    CONSIDERACIONES A RESOLVER: 

    - Hunter o Mercader o bien no existe en la base de datos al especificar una transaccion ->

    - ¿Que ocurre con las transacciones de un Hunter o Mercader cuando este se elimina de la base de datos? -> 

    - ¿Debería borrar las transacciones relacionadas con un bien que deseo borrar de la base de datos? -> 

*/




//post
/*
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

    (agrupar el codigo del manejador en diferentes funciones para que sea más legible.)

    

*/

//get
/*
    3 maneras diferentes:
    - query string con nombre del hunter/mercader
    - query string con fecha de inicio y fin además del tipo de transacciones (venta a cazadores, compras a mercaderes o ambas)
    - identificador unico de la transaccion (parametro dinamico /transaction/:id)

*/

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