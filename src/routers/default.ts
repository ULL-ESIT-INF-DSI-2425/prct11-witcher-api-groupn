import express from 'express';

/**
 * Enrutador por defecto para manejar rutas no reconocidas.
 * Responde con un estado 501 (Not Implemented) para cualquier método HTTP.
 */
export const defaultRouter = express.Router();

/**
 * Middleware que captura todas las rutas no definidas en la API.
 * @returns 501 Not Implemented
 */
defaultRouter.all('/{*splat}', (_, res) => {
    res.status(501).send();
});