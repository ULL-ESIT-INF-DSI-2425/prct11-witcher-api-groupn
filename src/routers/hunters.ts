import express from 'express';
import { Hunter } from '../models/hunters.js';

export const hunterRouter = express.Router();

//post
hunterRouter.post('/hunters', (req, res) => {
    const hunter = new Hunter(req.body);

    hunter.save().then((hunter) => {
        res.status(201).send(hunter);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

//get
hunterRouter.get('/hunters', (req, res) => {

    const allowedFilters = ['nombre', 'raza', 'ubicacion'];
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

    Hunter.find(filters).then((hunters) => {
        if(hunters.length !== 0) {
            res.send(hunters);   //todos los cazadores (sin query: http://localhost:3000/hunters)
        } else {
            res.status(404).send(); //no encontrado
        }
    }).catch(() => {
        res.status(500).send(); //error interno
    });
});

hunterRouter.get('/hunters/:id', (req, res) => {
    Hunter.findById(req.params.id).then((hunter) => {
        if (!hunter) {
            res.status(404).send();
        } else {
            res.send(hunter);
        }
    }).catch(() => {
        res.status(500).send();
    });
});

//patch

//delete
hunterRouter.delete('/hunters', (req, res) => {
    if (!req.query.id) {
        res.status(400).send({error: 'An id must be provided',});
    } else {
        Hunter.findOneAndDelete({id: req.query.id}).then((hunter) => {
            if (!hunter) {
                res.status(404).send();
            } else {
                res.send(hunter);
            }
        }).catch(() => {
            res.status(400).send();
        });
    }
});

hunterRouter.delete('/hunters/:id', (req, res) => {
    Hunter.findByIdAndDelete(req.params.id).then((hunter) => {
        if (!hunter) {
            res.status(404).send();
        } else {
            res.send(hunter);
        }
    }).catch(() => {
        res.status(400).send();
    });
});