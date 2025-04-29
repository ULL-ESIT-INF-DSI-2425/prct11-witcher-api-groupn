import express from 'express';
import { Good } from '../models/goods.js';

export const goodRouter = express.Router();

//post
goodRouter.post('/goods', (req, res) => {
    const bien = new Good(req.body);

    bien.save().then((bien) => {
        res.status(201).send(bien);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

//get
goodRouter.get('/goods', (req, res) => {

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

    Good.find(filters).then((bienes) => {
        if(bienes.length !== 0) {
            res.send(bienes);   //todos los bienes (sin query: http://localhost:3000/goods)
        } else {
            res.status(404).send(); //bien no encontrado
        }
    }).catch(() => {
        res.status(500).send(); //error interno
    });
});

goodRouter.get('/goods/:id', (req, res) => {
    Good.findById(req.params.id).then((bien) => {
        if (!bien) {
            res.status(404).send();
        } else {
            res.send(bien);
        }
    }).catch(() => {
        res.status(500).send();
    });
});


//patch
goodRouter.patch('/goods', (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided in the query string',});
    } else if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'descripcion', 'material', 'peso', 'valor'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permitted',});
        } else {
            Good.findOneAndUpdate({id: req.query.id}, req.body, {
                new: true,
                runValidators: true,
            }).then((good) => {
                if (!good) {
                    res.status(404).send();
                } else {
                    res.send(good);
                }
            }).catch((error) => {
                res.status(400).send(error);
            });
        }
    }
});

goodRouter.patch('/goods/:id', (req, res) => {
    if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'descripcion', 'material', 'peso', 'valor'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permited',});
        } else {
            Good.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }).then((good) => {
                if (!good) {
                    res.status(404).send();
                } else {
                    res.send(good);
                }
            }).catch((error) => {
                res.status(400).send(error);
            });
        }
    }
});

//delete
goodRouter.delete('/goods', (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided',});
    } else {
        Good.findOneAndDelete({id: req.query.id}).then((good) => {
            if (!good) {
                res.status(404).send();
            } else {
                res.send(good);
            }
        }).catch(() => {
            res.status(400).send();
        });
    }
});

goodRouter.delete('/goods/:id', (req, res) => {
    Good.findByIdAndDelete(req.params.id).then((good) => {
        if (!good) {
            res.status(404).send();
        } else {
            res.send(good);
        }
    }).catch(() => {
        res.status(400).send();
    });
});
