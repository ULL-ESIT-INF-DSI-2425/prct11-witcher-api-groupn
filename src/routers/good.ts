import express from 'express';
import { Good } from '../models/goods.js';
import { notEqual } from 'assert';

export const goodRouter = express.Router();

goodRouter.post('/goods', (req, res) => {
    const bien = new Good(req.body);

    bien.save().then((bien) => {
        res.status(201).send(bien);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

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

