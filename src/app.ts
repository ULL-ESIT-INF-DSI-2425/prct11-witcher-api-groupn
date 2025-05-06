import express from 'express';
import './db/mongoose.js';
import { goodRouter } from './routers/good.js';
import { hunterRouter } from './routers/hunters.js';
import { merchantRouter } from './routers/merchants.js';
import { transactionRouter } from './routers/transactions.js';
import { defaultRouter } from './routers/default.js';

/**
 * Aplicación principal de Express.
 * Se configura la aplicación con middlewares y routers específicos para cada recurso.
 */
export const app = express();

/**
 * Desactiva el encabezado "X-Powered-By" por motivos de seguridad.
 */
app.disable('x-powered-by');

/**
 * Middleware para parsear cuerpos JSON en las peticiones entrantes.
 */
app.use(express.json());

/**
 * Enrutador para operaciones relacionadas con bienes.
 */
app.use(goodRouter);

/**
 * Enrutador para operaciones relacionadas con cazadores.
 */
app.use(hunterRouter);

/**
 * Enrutador para operaciones relacionadas con mercaderes.
 */
app.use(merchantRouter);

/**
 * Enrutador para operaciones relacionadas con transacciones.
 */
app.use(transactionRouter);

/**
 * Enrutador por defecto para rutas no reconocidas.
 */
app.use(defaultRouter);
/*
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
*/