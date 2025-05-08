import express from 'express';
import { Hunter } from '../models/hunters.js';

/**
 * Enrutador para operaciones CRUD sobre cazadores.
 */
export const hunterRouter = express.Router();

/**
 * Crea un nuevo cazador.
 * @returns 201 Created o 500 Internal Server Error
 */
hunterRouter.post('/hunters', async (req, res) => {
    const hunter = new Hunter(req.body);

    try {
        await hunter.save();
        res.status(201).send(hunter);
    } catch (error) {
        res.status(500).send(error);
    }


});

/**
 * Obtiene todos los cazadores o filtra por nombre.
 * @returns 200 OK o 400/404/500 según el caso
 */
hunterRouter.get('/hunters', async (req, res) => {


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
        const hunters = await Hunter.find(filters);
        if (hunters.length !== 0) {
            res.send(hunters);
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
hunterRouter.get('/hunters/:id', async (req, res) => {

    try {
        const hunter = await Hunter.findById(req.params.id);
        if(!hunter) {
            res.status(404).send();
        } else {
            res.send(hunter);
        }
    } catch (error) {
        res.status(500).send();
    }


});

/**
 * Modifica un cazador usando su ID como query string.
 * @returns 200 OK o error
 */
hunterRouter.patch('/hunters', async (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided in the query string',});
    } else if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'raza', 'ubicacion'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permitted',});
        } else {
            try {
                const hunterUpdate = await Hunter.findOneAndUpdate({id: req.query.id}, req.body, {
                    new: true,
                    runValidators: true,
                },);

                if (hunterUpdate) {
                    res.send(hunterUpdate);
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
hunterRouter.patch('/hunters/:id', async (req, res) => {
    if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'raza', 'ubicacion'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permited',});
        } else {
            try {
                const hunter = await Hunter.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true,
                });

                if (!hunter) {
                    res.status(404).send();
                } else {
                    res.send(hunter);
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
hunterRouter.delete('/hunters', async (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided',});
    } else {

        try {
            const hunterDeleted = await Hunter.findOneAndDelete({id: req.query.id});
            if (!hunterDeleted) {
                res.status(404).send();
            } else {
                res.send(hunterDeleted);
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
hunterRouter.delete('/hunters/:id', async (req, res) => {
    try {
        const hunter = await Hunter.findByIdAndDelete(req.params.id);
        if (!hunter) {
            res.status(404).send();
        } else {
            res.send(hunter);
        }
    } catch (error) {
        res.status(500).send(error);
    }

});