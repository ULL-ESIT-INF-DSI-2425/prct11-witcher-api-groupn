import { describe, test, beforeEach, afterEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

import { Transaction } from "../src/models/transactions.js";
import { Hunter } from "../src/models/hunters.js";
import { Merchant } from "../src/models/merchants.js";
import { Good } from "../src/models/goods.js";

let insertedHunter;
let insertedMerchant;
let insertedGood;
let fecha_actual;

const firstHunter = {
    id: 3,
    nombre: "testhunter3",
    raza: "humano",
    ubicacion: "lago sur"
};

const firstMerchant = {
    id: 3,
    nombre: "testmerchant3",
    tipo: "herrero",
    ubicacion: "arbol caido"
};

const firstGood = {
    id: 3, 
    nombre: "Espada de Plata", 
    descripcion: "Arma de plata para monstruos", 
    material: "Acero de Mahakam", 
    peso: 3,
    valor: 800,
    stock: 100
}


beforeEach(async () => {
    await Hunter.deleteMany({ nombre: "testhunter3" });
    await Merchant.deleteMany({ nombre: "testmerchant3" });
    await Good.deleteMany({ nombre: "Espada de Plata" });
    await Transaction.deleteMany();
    
    insertedHunter = await new Hunter(firstHunter).save();
    insertedMerchant = await new Merchant(firstMerchant).save();
    insertedGood = await new Good(firstGood).save();
    fecha_actual = new Date();

});


describe("POST /transactions", () => {
    test("Should successfully create a new transaction (compra)", async () => {
        const response = await request(app)
            .post("/transactions")
            .send({
                id: 3,
                tipo: "compra",
                nombre: "testhunter3",
                bienes: [
                    {
                        nombre: "Espada de Plata",
                        cantidad: 5
                    }
                ]
            })
            .expect(201);

        expect(response.body).toMatchObject({
            id: 3,
            tipo: "compra",
            valor: 4000,
        });

        const transaction = await Transaction.findOne({ id: 3 });
        expect(transaction).not.toBeNull();
    },
        10000
    );

    test("Should successfully create a new transaction (venta)", async () => {
        const response = await request(app)
            .post("/transactions")
            .send({
                id: 4,
                tipo: "venta",
                nombre: "testmerchant3",
                bienes: [
                    {
                        nombre: "Espada de Plata",
                        cantidad: 5
                    }
                ]
            })
            .expect(201);

        expect(response.body).toMatchObject({
            id: 4,
            tipo: "venta",
            valor: 4000,
        });

        const transaction = await Transaction.findOne({ id: 4 });
        expect(transaction).not.toBeNull();
    },
        10000
    );

    test("Should create a good if it doesn't exist", async () => {
        const response = await request(app)
            .post("/transactions")
            .send({
                id: 5,
                tipo: "venta",
                nombre: "testmerchant3",
                bienes: [
                    {
                        id: 5,
                        nombre: "Espada de Oro",
                        cantidad: 5,
                        valor: 1000
                    }
                ]
            })
            .expect(201);

        expect(response.body).toMatchObject({
            id: 5,
            tipo: "venta",
            valor: 5000,
        });

        const transaction = await Transaction.findOne({ id: 5 });
        expect(transaction).not.toBeNull();
    },
        10000
    );
});

describe("GET /transactions/nombre", () => {
    test("Should retrieve transactions by hunter/merchant name", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .get(`/transactions/nombre?nombre=${insertedHunter.nombre}`)
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].id).toBe(1);
    });

    test("Should return 404 if no transactions found for hunter/merchant", async () => {
        await request(app)
            .get("/transactions/nombre?nombre=nonexistent")
            .expect(404);
    });
});

describe("GET /transactions/fecha", () => {
    test("Should retrieve transactions by the date", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: fecha_actual,
            valor: 400
        });
        await transaction.save();
        const response = await request(app)
            .get(`/transactions/fecha?fecha=${fecha_actual}&tipo=compra`)
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].id).toBe(1);
    });

});

describe("PATCH /transactions/:id", () => {
    test("Should update transaction bienes", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .patch(`/transactions/${transaction._id}`)
            .send({
                bienes: [
                    {
                        nombre: insertedGood.nombre,
                        cantidad: 10
                    }
                ]
            })
            .expect(200);

        expect(response.body.valor).toBe(8000); // 10 * 80
    });

    test("Should update transaction bienes", async () => {
        const transaction = new Transaction({
            id: 2,
            tipo: "venta",
            mercader: insertedMerchant._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .patch(`/transactions/${transaction._id}`)
            .send({
                bienes: [
                    {
                        nombre: insertedGood.nombre,
                        cantidad: 10
                    }
                ]
            })
            .expect(200);

        expect(response.body.valor).toBe(8000); // 10 * 80
    });



    test("Should return 404 if transaction not found", async () => {
        await request(app)
            .patch("/transactions/000000000000000000000000")
            .send({
                bienes: [
                    {
                        nombre: insertedGood.nombre,
                        cantidad: 10
                    }
                ]
            })
            .expect(404);
    });

    test("Should return 400 if there is no stock left", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .patch(`/transactions/${transaction._id}`)
            .send({
                bienes: [
                    {
                        nombre: insertedGood.nombre,
                        cantidad: 500
                    }
                ]
            })
            .expect(400);
    });

    test("Should return 400 if there is no good to be updated", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .patch(`/transactions/${transaction._id}`)
            .send({
                bienes: [
                ]
            })
            .expect(400);
    });

    test("Should return 404 if there is no new good to be updated", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .patch(`/transactions/${transaction._id}`)
            .send({
                bienes: [
                    {
                        nombre: "NonExistentGood",
                        cantidad: 10
                    }
                ]
            })
            .expect(404);
    });

    test("Should return 404 if there is no old good to be updated", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();
        await Good.deleteMany({ nombre: insertedGood.nombre });

        const response = await request(app)
            .patch(`/transactions/${transaction._id}`)
            .send({
                bienes: [
                    {
                        nombre: insertedGood.nombre,
                        cantidad: 10
                    }
                ]
            })
            .expect(404);
    });

    test("Should return 404 if there is no old good to be updated", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();
        await Hunter.deleteMany({ nombre: insertedHunter.nombre });

        const response = await request(app)
            .patch(`/transactions/${transaction._id}`)
            .send({
                bienes: [
                    {
                        nombre: insertedGood.nombre,
                        cantidad: 10
                    }
                ]
            })
            .expect(404);
    });


});

describe("DELETE /transactions/:id", () => {
    test("Should delete a transaction and create a devolucion", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "compra",
            cazador: insertedHunter._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .delete(`/transactions/${transaction._id}`)
            .expect(200);

        expect(response.body.tipo).toBe("devolucion");
        expect(response.body.valor).toBe(4000);

        const deletedTransaction = await Transaction.findById(transaction._id);
        expect(deletedTransaction).toBeNull();
    });

    test("Should delete a transaction and create a devolucion", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "venta",
            mercader: insertedMerchant._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 5
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .delete(`/transactions/${transaction._id}`)
            .expect(200);

        expect(response.body.tipo).toBe("devolucion");
        expect(response.body.valor).toBe(4000);

        const deletedTransaction = await Transaction.findById(transaction._id);
        expect(deletedTransaction).toBeNull();
    });

    test("Should return 404 if transaction not found", async () => {
        await request(app)
            .delete("/transactions/000000000000000000000000")
            .expect(404);
    });

    test("Should return 404 if there is not enough stock to delete a devolucion", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "venta",
            mercader: insertedMerchant._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 101
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();

        const response = await request(app)
            .delete(`/transactions/${transaction._id}`)
            .expect(400);

    });

    test("Should return 404 if there is no merchant associated with the transaction", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "venta",
            mercader: insertedMerchant._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 101
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();
        await Merchant.deleteMany({ nombre: "testmerchant3" });

        const response = await request(app)
            .delete(`/transactions/${transaction._id}`)
            .expect(404);

    });

    test("Should return 404 because the good to be returned does not exist", async () => {
        const transaction = new Transaction({
            id: 1,
            tipo: "venta",
            mercader: insertedMerchant._id,
            bienes: [
                {
                    bien: insertedGood._id,
                    cantidad: 101
                }
            ],
            fecha: new Date(),
            valor: 400
        });
        await transaction.save();
        await Good.deleteMany({ nombre: "Espada de Plata" });

        const response = await request(app)
            .delete(`/transactions/${transaction._id}`)
            .expect(404);

    });
    
}); 


describe("POST /transactions - error cases", () => {
    test("Should return 400 if transaction id already exists", async () => {
      await new Transaction({ id: 3, tipo: "compra", cazador: insertedHunter._id, bienes: [], valor: 0, fecha: new Date() }).save();
  
      await request(app)
        .post("/transactions")
        .send({ id: 3, tipo: "compra", nombre: "testhunter3", bienes: [] })
        .expect(400);
    });
  
    test("Should return 400 if tipo is invalid", async () => {
      await request(app)
        .post("/transactions")
        .send({ id: 4, tipo: "invalid", nombre: "testhunter3", bienes: [] })
        .expect(400);
    });
  
    test("Should return 404 if hunter/merchant not found", async () => {
      await request(app)
        .post("/transactions")
        .send({ id: 4, tipo: "compra", nombre: "nonexistent", bienes: [] })
        .expect(404);
    });
  
    test("Should return 404 if good not found in compra", async () => {
      await request(app)
        .post("/transactions")
        .send({ id: 4, tipo: "compra", nombre: "testhunter3", bienes: [{ nombre: "NoExiste", cantidad: 1 }] })
        .expect(404);
    });
  
    test("Should return 400 if not enough stock in compra", async () => {
      await request(app)
        .post("/transactions")
        .send({ id: 4, tipo: "compra", nombre: "testhunter3", bienes: [{ nombre: "Espada de Plata", cantidad: 1000 }] })
        .expect(400);
    });
  });
  
  describe("GET /transactions/fecha", () => {
    test("Should return empty list if no transactions in date range", async () => {
      const response = await request(app)
        .get("/transactions/fecha?fechaInicio=1990-01-01&fechaFin=1990-12-31")
        .expect(200);
  
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
  
  describe("GET /transactions/:id", () => {
    test("Should return 404 if transaction not found", async () => {
      await request(app).get("/transactions/000000000000000000000000").expect(404);
    });
  });
  