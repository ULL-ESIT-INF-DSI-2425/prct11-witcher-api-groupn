import express from 'express';
import { Merchant } from '../models/merchants.js';

export const merchantRouter = express.Router();

//post
merchantRouter.post('/merchants', (req, res) => {
    const merchant = new Merchant(req.body);

    merchant.save().then((merchant) => {
        res.status(201).send(merchant);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

//get
merchantRouter.get('/merchants', (req, res) => {

    //const filter = req.query.nombre?{nombre: req.query.nombre.toString()}:{};

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

    Merchant.find(filters).then((merchants) => {
        if(merchants.length !== 0) {
            res.send(merchants);   //todos los mercaderes (sin query: http://localhost:3000/merchants)
        } else {
            res.status(404).send(); //no encontrado
        }
    }).catch(() => {
        res.status(500).send(); //error interno
    });
});

merchantRouter.get('/merchants/:id', (req, res) => {
    Merchant.findById(req.params.id).then((merchant) => {
        if (!merchant) {
            res.status(404).send();
        } else {
            res.send(merchant);
        }
    }).catch(() => {
        res.status(500).send();
    });
});

//patch
merchantRouter.patch('/merchants', (req, res) => {
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
            Merchant.findOneAndUpdate({id: req.query.id}, req.body, {
                new: true,
                runValidators: true,
            }).then((merchant) => {
                if (!merchant) {
                    res.status(404).send();
                } else {
                    res.send(merchant);
                }
            }).catch((error) => {
                res.status(400).send(error);
            });
        }
    }
});

merchantRouter.patch('/merchants/:id', (req, res) => {
    if (!req.body) {
        res.status(400).send({error: 'Fields to be modified have to be provided in the request body',});
    } else {
        const allowedUpdates = ['nombre', 'tipo', 'ubicacion'];
        const actualUpdates = Object.keys(req.body);
        const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            res.status(400).send({error: 'Update is not permited',});
        } else {
            Merchant.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }).then((merchant) => {
                if (!merchant) {
                    res.status(404).send();
                } else {
                    res.send(merchant);
                }
            }).catch((error) => {
                res.status(400).send(error);
            });
        }
    }
});

//delete
merchantRouter.delete('/merchants', (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided',});
    } else {
        Merchant.findOneAndDelete({id: req.query.id}).then((merchant) => {
            if (!merchant) {
                res.status(404).send();
            } else {
                res.send(merchant);
            }
        }).catch(() => {
            res.status(400).send();
        });
    }
});

merchantRouter.delete('/merchants/:id', (req, res) => {
    Merchant.findByIdAndDelete(req.params.id).then((merchant) => {
        if (!merchant) {
            res.status(404).send();
        } else {
            res.send(merchant);
        }
    }).catch(() => {
        res.status(400).send();
    });
});