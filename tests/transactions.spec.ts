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


    //insertedHunter = await Hunter.insertMany([firstHunter]);
    //insertedMerchant = await Merchant.insertMany([firstMerchant]);
    //insertedGood = await Good.insertMany([firstGood]);
    // Asegura que los datos están en la base
    //const h = await Hunter.findOne({ nombre: "testhunter3" }).lean();
    //console.log("Inserted Hunter:", insertedHunter);
    //const m = await Merchant.findOne({ nombre: "testmerchant3" }).lean();
    //const g = await Good.findOne({ nombre: "Espada de Plata" }).lean();
    //expect(h).not.toBeNull();
    //expect(m).not.toBeNull();
    //expect(g).not.toBeNull();
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

    test("Should return 404 if transaction not found", async () => {
        await request(app)
            .delete("/transactions/000000000000000000000000")
            .expect(404);
    });
}); 