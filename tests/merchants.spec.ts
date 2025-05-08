import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

import { Merchant } from "../src/models/merchants.js";


let insertedMerchant;

const firstMerchant = {
    id: 1,
    nombre: "testmerchant",
    tipo: "herrero",
    ubicacion: "arbol caido"
}


beforeEach(async () => {
    await Merchant.deleteMany({nombre: {$in: ["testmerchant", "test merchant2", "testupdatedmerchant"]}});
    insertedMerchant = await new Merchant(firstMerchant).save();
});



describe("POST /merchants", () => {
  test("Should successfully create a new merchant", async () => {
    const response = await request(app)
      .post("/merchants")
      .send({
        id: 2,
        nombre: "test merchant2",
        tipo: "herrero",
        ubicacion: "arbol"
      })
      .expect(201);

      expect(response.body).to.include({
        id: 2,
        nombre: "test merchant2",
        tipo: "herrero",
        ubicacion: "arbol"
      });
      
      const secondMerchant = await Merchant.findById(response.body._id);
      expect(secondMerchant).not.toBe(null);
      expect(secondMerchant!.nombre).to.equal("test merchant2");
  });

  test("Should get an error", async () => {
    await request(app).post("/merchants").send(firstMerchant).expect(500);
  });
});

describe("GET /merchants", () => {
    test("Should get a merchant by nombre", async () => {
      await request(app).get("/merchants?nombre=testmerchant").expect(200);
    });
  
    test("Should not find a merchant by name", async () => {
      await request(app).get("/merchants?nombre=NOEXISTE").expect(404);
    });

    test("Should be a BAD REQUEST", async () => {
        await request(app).get("/merchants?NOEXISTE=espada").expect(400);
      });
});

describe("GET /merchants/:id", () => {
    test("Should get a merchant by _id", async () => {
      const response = await request(app).get(`/merchants/${insertedMerchant._id}`).expect(200);

      expect(response.body).to.include({
        id: 1,
        nombre: "testmerchant",
        tipo: "herrero",
        ubicacion: "arbol caido"
      });

    });
  
    test("Should not find a merchants by _id", async () => {
      await request(app).get("/merchants/aaaaaaaaaaaaaaaaaaaaaaaa").expect(404);
    });

    test("Should get an error", async () => {
        await request(app).get("/merchants/00000000000").expect(500);
      });
});

describe("patch /merchants", () => {
    test("ID not provided", async () => {
      await request(app).patch(`/merchants`).send({
        nombre: "testupdatedmerchant",
        tipo: "herrero",
        ubicacion: "lago norte"
      }).expect(400);
    });

    test("BODY not provided", async () => {
        await request(app).patch(`/merchants?id=1`).expect(400);
    });
  
    test("Should modify a merchant", async () => {
        const response = await request(app).patch(`/merchants?id=1`).send({
            nombre: "testupdatedmerchant",
            tipo: "herrero",
            ubicacion: "lago norte"
        }).expect(200);

        expect(response.body).to.include({
            id: 1,
            nombre: "testupdatedmerchant",
            tipo: "herrero",
            ubicacion: "lago norte"
        });
        
        const updatedMerchant = await Merchant.findById(response.body._id);
        expect(updatedMerchant).not.toBe(null);
        expect(updatedMerchant!.nombre).to.equal("testupdatedmerchant");
    });

    test("Invalid update body", async () => {
        await request(app).patch(`/merchants?id=1`).send({
          id: 10,
          nombre: "testupdatedmerchant",
          tipo: "herrero",
          ubicacion: "lago norte"
        }).expect(400);
    });

    test("merchant not found", async () => {
        await request(app).patch(`/merchants?id=999`).send({
            nombre: "testupdatedmerchant",
            tipo: "herrero",
            ubicacion: "lago norte"
        }).expect(404);
    });
});

  
describe("patch /merchants/:id", () => {

    test("BODY not provided", async () => {
        await request(app).patch(`/merchants/${insertedMerchant._id}`).expect(400);
    });
  
    test("Should modify a merchant", async () => {
        const response = await request(app).patch(`/merchants/${insertedMerchant._id}`).send({
            nombre: "testupdatedmerchant",
        tipo: "herrero",
        ubicacion: "lago norte"
        }).expect(200);

        expect(response.body).to.include({
          id: 1,
          nombre: "testupdatedmerchant",
          tipo: "herrero",
          ubicacion: "lago norte"
        });

        const updatedMerchant = await Merchant.findById(response.body._id);
        expect(updatedMerchant).not.toBe(null);
        expect(updatedMerchant!.nombre).to.equal("testupdatedmerchant");
    });

    test("Invalid update body", async () => {
        await request(app).patch(`/merchants/${insertedMerchant._id}`).send({
            id: 20,
            nombre: "testupdatedmerchant",
        tipo: "herrero",
        ubicacion: "lago norte"
        }).expect(400);
    });

    test("merchant not found", async () => {
        await request(app).patch(`/merchants/aaaaaaaaaaaaaaaaaaaaaaaa`).send({
            nombre: "testupdatedmerchant",
        tipo: "herrero",
        ubicacion: "lago norte"
        }).expect(404);
    });

    test("error merchant", async () => {
        await request(app).patch(`/merchants/0000000`).send({
            nombre: "testupdatedmerchant",
        tipo: "herrero",
        ubicacion: "lago norte"
        }).expect(500);
    });
});

describe("DELETE /merchants", () => {
    test("Should delete a merchant by id", async () => {
      const response = await request(app).delete("/merchants?id=1").expect(200);

      expect(response.body).to.include({
        id: 1,
        nombre: "testmerchant",
        tipo: "herrero",
        ubicacion: "arbol caido"
      });

      const deletedMerchant = await Merchant.findById(response.body._id);
      expect(deletedMerchant).toBe(null);
    });

    test("delete merchant no querystring", async () => {
        await request(app).delete("/merchants").expect(400);
    });

    test("merchant not found", async () => {
        await request(app).delete("/merchants?id=998").expect(404);
    });
});

describe("DELETE /merchants/:id", () => {
    test("Should get a merchant by _id", async () => {
      const response = await request(app).delete(`/merchants/${insertedMerchant._id}`).expect(200);

      expect(response.body).to.include({
        id: 1,
        nombre: "testmerchant",
        tipo: "herrero",
        ubicacion: "arbol caido"
      });

      const deletedMerchant = await Merchant.findById(response.body._id);
      expect(deletedMerchant).toBe(null);
    });
  
    test("Should not find a merchant by _id", async () => {
      await request(app).delete("/merchants/aaaaaaaaaaaaaaaaaaaaaaaa").expect(404);
    });

    test("Should get an error", async () => {
        await request(app).delete("/merchants/00000000000").expect(500);
      });
    });