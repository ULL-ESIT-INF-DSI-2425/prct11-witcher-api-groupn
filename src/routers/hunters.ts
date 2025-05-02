import express from 'express';
import { Hunter } from '../models/hunters.js';

export const hunterRouter = express.Router();

//post
hunterRouter.post('/hunters', async (req, res) => {
    const hunter = new Hunter(req.body);

    try {
        await hunter.save();
        res.status(201).send(hunter);
    } catch (error) {
        res.status(500).send(error);
    }

/*
POST http://localhost:3000/hunters
EJEMPLO BODY POSTMAN
{
    "id": 2,
    "nombre": "nombre2",
    "raza": "elfo",
    "ubicacion": "casa seta"
}

*/


    /*hunter.save().then((hunter) => {
        res.status(201).send(hunter);
    }).catch((error) => {
        res.status(400).send(error);
    });*/
});

//get
hunterRouter.get('/hunters', async (req, res) => {

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

/*
    Hunter.find(filters).then((hunters) => {
        if(hunters.length !== 0) {
            res.send(hunters);   //todos los cazadores (sin query: http://localhost:3000/hunters)
        } else {
            res.status(404).send(); //no encontrado
        }
    }).catch(() => {
        res.status(500).send(); //error interno
    });*/
});

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

/*
    Hunter.findById(req.params.id).then((hunter) => {
        if (!hunter) {
            res.status(404).send();
        } else {
            res.send(hunter);
        }
    }).catch(() => {
        res.status(500).send();
    });*/
});

//patch
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


           /* Hunter.findOneAndUpdate({id: req.query.id}, req.body, {
                new: true,
                runValidators: true,
            }).then((hunter) => {
                if (!hunter) {
                    res.status(404).send();
                } else {
                    res.send(hunter);
                }
            }).catch((error) => {
                res.status(400).send(error);
            });*/
        }
    }
});

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


            /*Hunter.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }).then((hunter) => {
                if (!hunter) {
                    res.status(404).send();
                } else {
                    res.send(hunter);
                }
            }).catch((error) => {
                res.status(400).send(error);
            });*/
        }
    }
});

//delete
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

        /*Hunter.findOneAndDelete({id: req.query.id}).then((hunter) => {
            if (!hunter) {
                res.status(404).send();
            } else {
                res.send(hunter);
            }
        }).catch(() => {
            res.status(400).send();
        });*/
    }
});

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

    /*Hunter.findByIdAndDelete(req.params.id).then((hunter) => {
        if (!hunter) {
            res.status(404).send();
        } else {
            res.send(hunter);
        }
    }).catch(() => {
        res.status(400).send();
    });*/
});