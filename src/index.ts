/*import express from 'express';
import './db/mongoose.js';
import { goodRouter } from './routers/good.js';
import { hunterRouter } from './routers/hunters.js';
import { merchantRouter } from './routers/merchants.js';
import { transactionRouter } from './routers/transactions.js';
import { defaultRouter } from './routers/default.js';

export const app = express();
app.disable('x-powered-by');

app.use(express.json());
app.use(goodRouter);
app.use(hunterRouter);
app.use(merchantRouter);
app.use(transactionRouter);

app.use(defaultRouter);*/
import {app} from "./app.js";

/**
 * Puerto en el que se ejecutará el servidor.
 * Se utiliza la variable de entorno PORT si está definida, o el puerto 3000 por defecto.
 */
const port = process.env.PORT || 3000;

/**
 * Inicia el servidor y escucha en el puerto especificado.
 * Muestra un mensaje en consola indicando que el servidor está activo.
 */
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
