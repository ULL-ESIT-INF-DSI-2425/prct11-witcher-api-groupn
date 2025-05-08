import express from 'express';
import { Merchant } from '../models/merchants.js';

/**
 * Enrutador para operaciones CRUD sobre cazadores.
 */
export const merchantRouter = express.Router();

/**
 * Crea un nuevo cazador.
 * @returns 201 Created o 500 Internal Server Error
 */
merchantRouter.post('/merchants', async (req, res) => {
    const merchant = new Merchant(req.body);

    try {
        await merchant.save();
        res.status(201).send(merchant);
    } catch (error) {
        res.status(500).send(error);
    }

});

/**
 * Obtiene todos los cazadores o filtra por nombre.
 * @returns 200 OK o 400/404/500 según el caso
 */
merchantRouter.get('/merchants', async (req, res) => {



    const allowedFilters = ['nombre'];
    const actualFilters = Object.keys(req.query);
    const isValidFilter = actualFilters.every((filter) => allowedFilters.includes(filter));

    let filters = {};

    if (!isValidFilter) {
       res.status(400).send();  //query no valido
       return;
    } else {
        actualFilters.forEach((key) => {
            filters[key] = req.query[key];
        });
    }

    try {
        const merchants = await Merchant.find(filters);
        if (merchants.length !== 0) {
            res.send(merchants);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).send(error);
    }
    
    

});

/**
 * Obtiene un cazador por su ID.
 * @param id - ID del cazador
 * @returns 200 OK o 404/500 según el caso
 */
merchantRouter.get('/merchants/:id', async (req, res) => {


    try {
        const merchant = await Merchant.findById(req.params.id);
        if(!merchant) {
            res.status(404).send();
        } else {
            res.send(merchant);
        }
    } catch (error) {
        res.status(500).send();
    }

});

/**
 * Modifica un cazador usando su ID como query string.
 * @returns 200 OK o error
 */
merchantRouter.patch('/merchants', async (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided in the query string',});
    } else if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'tipo', 'ubicacion'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permitted',});
        } else {

            try {
                const merchantUpdate = await Merchant.findOneAndUpdate({id: req.query.id}, req.body, {
                    new: true,
                    runValidators: true,
                },);
            
                if (merchantUpdate) {
                    res.send(merchantUpdate);
                } else {
                    res.status(404).send();
                }
            } catch (error) {
                res.status(500).send(error);
            }


        }
    }
});

/**
 * Modifica un cazador usando su ID como parámetro de ruta.
 * @param id - ID del cazador a actualizar
 * @returns 200 OK o error
 */
merchantRouter.patch('/merchants/:id', async (req, res) => {
    if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'tipo', 'ubicacion'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permited',});
        } else {

            try {
                const merchant = await Merchant.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true,
                });
            
                if (!merchant) {
                    res.status(404).send();
                } else {
                    res.send(merchant);
                }
            } catch (error) {
                res.status(500).send(error);
            }


        }
    }
});

/**
 * Elimina un cazador usando su ID como query string.
 * @returns 200 OK o error
 */
merchantRouter.delete('/merchants', async (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided',});
    } else {

        try {
            const merchantDeleted = await Merchant.findOneAndDelete({id: req.query.id});
            if (!merchantDeleted) {
                res.status(404).send();
            } else {
                res.send(merchantDeleted);
            }
        } catch (error) {
            res.status(500).send(error);
        }

    }
});

/**
 * Elimina un cazador usando su ID como parámetro de ruta.
 * @param id - ID del cazador a eliminar
 * @returns 200 OK o error
 */
merchantRouter.delete('/merchants/:id', async (req, res) => {

    try {
        const merchant = await Merchant.findByIdAndDelete(req.params.id);
        if (!merchant) {
            res.status(404).send();
        } else {
            res.send(merchant);
        }
    } catch (error) {
        res.status(500).send(error);
    }

});