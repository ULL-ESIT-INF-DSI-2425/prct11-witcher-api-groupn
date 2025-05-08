import express from 'express';
import { Good } from '../models/goods.js';


/**
 * Enrutador para operaciones CRUD sobre bienes.
 */
export const goodRouter = express.Router();

/**
 * Crea un nuevo bien.
 * @returns 201 Created con el bien creado o 500 Internal Server Error
 */
goodRouter.post('/goods', async (req, res) => {
    const bien = new Good(req.body);

    try{
        await bien.save();
        res.status(201).send(bien);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * Obtiene todos los bienes o filtra por parámetros de búsqueda.
 * @returns 200 OK con los bienes o 400/404/500 según el caso
 */
goodRouter.get('/goods', async (req, res) => {

    const allowedFilters = ['nombre', 'descripcion', 'material', 'peso', 'valor'];
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
        const bienes = await Good.find(filters);
        if (bienes.length !== 0) {
            res.send(bienes);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * Obtiene un bien por su ID.
 * @param id - ID del bien
 * @returns 200 OK con el bien o 404/500 según el caso
 */
goodRouter.get('/goods/:id', async (req, res) => {
    try {
        const bien = await Good.findById(req.params.id);
        if (!bien) {
            res.status(404).send();
        } else {
            res.send(bien);
        }
    } catch (error) {
        res.status(500).send();
    }
});

/**
 * Modifica un bien usando su ID como query string.
 * @returns 200 OK con el bien actualizado o error
 */
goodRouter.patch('/goods', async (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided in the query string',});
    } else if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'descripcion', 'material', 'peso', 'valor', 'stock'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permitted',});
        } else {
            try {

                const bienUpdate = await Good.findOneAndUpdate({id: req.query.id}, req.body, {
                    new: true,
                    runValidators: true,
                },);

                if (bienUpdate) {
                    res.send(bienUpdate);
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
 * Modifica un bien usando su ID como parámetro de ruta.
 * @param id - ID del bien a actualizar
 * @returns 200 OK con el bien actualizado o error
 */
goodRouter.patch('/goods/:id', async (req, res) => {
    if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'descripcion', 'material', 'peso', 'valor', 'stock'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permited',});
        } else {

            try {
                const bien = await Good.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true,
                });

                if (!bien) {
                    res.status(404).send();
                } else {
                    res.send(bien);
                }
            } catch (error) {
                res.status(500).send(error);
            }

        }
    }
});

/**
 * Elimina un bien usando su ID como query string.
 * @returns 200 OK con el bien eliminado o error
 */
goodRouter.delete('/goods', async (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided',});
    } else {
        try {
            const bienDeleted = await Good.findOneAndDelete({id: req.query.id});
            if (!bienDeleted) {
                res.status(404).send();
            } else {
                res.send(bienDeleted);
            }
        } catch (error) {
            res.status(500).send(error);
        }

    }
});

/**
 * Elimina un bien usando su ID como parámetro de ruta.
 * @param id - ID del bien a eliminar
 * @returns 200 OK con el bien eliminado o error
 */
goodRouter.delete('/goods/:id', async (req, res) => {
    try {
        const bien = await Good.findByIdAndDelete(req.params.id);
        if (!bien) {
            res.status(404).send();
        } else {
            res.send(bien);
        }
    } catch (error) {
        res.status(500).send(error);
    }

});
