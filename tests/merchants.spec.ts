import { describe, test, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

//import { Good } from "../src/models/goods.js";

//import { Hunter } from "../src/models/hunters.js";
import { Merchant } from "../src/models/merchants.js";

// TAMBIEN DEBE COMPROBAR EL CONTENIDO DE LOS CUERPOS DE LAS RESPUESTAS Y EL ESTADO DE LAS COLECCIONES EN LA BASE DE DATOS


let insertedMerchant;

const firstMerchant = {
    id: 1,
    nombre: "testmerchant",
    tipo: "herrero",
    ubicacion: "arbol caido"
}


/*const firstGood = {
    id: 1,
    nombre: "espada",
    descripcion: "espada de acero", 
    material: "acero",
    peso: 10,
    valor: 80,
    stock: 200
}*/

beforeEach(async () => {
    await Merchant.deleteMany();
    insertedMerchant = await new Merchant(firstMerchant).save();
});


describe("POST /mencharts", () => {
  test("Should successfully create a new merchant", async () => {
    await request(app)
      .post("/merchants")
      .send({
        id: 2,
        nombre: "test merchant2",
        tipo: "herrero",
        ubicacion: "arbol"
      })
      .expect(201);
  });

  test("Should get an error", async () => {
    await request(app).post("/merchants").send(firstMerchant).expect(500);
  });
});

describe("GET /hunters", () => {
    test("Should get a hunter by nombre", async () => {
      await request(app).get("/merchants?nombre=testmerchant").expect(200);
    });
  
    test("Should not find a hunter by name", async () => {
      await request(app).get("/merchants?nombre=NOEXISTE").expect(404);
    });

    test("Should be a BAD REQUEST", async () => {
        await request(app).get("/merchants?NOEXISTE=espada").expect(400);
      });
});

describe("GET /hunters/:id", () => {
    test("Should get a hunter by _id", async () => {
      await request(app).get(`/merchants/${insertedMerchant._id}`).expect(200);
    });
  
    test("Should not find a hunter by _id", async () => {
      await request(app).get("/merchants/aaaaaaaaaaaaaaaaaaaaaaaa").expect(404);
    });

    test("Should get an error", async () => {
        await request(app).get("/merchants/00000000000").expect(500);
      });
});

describe("patch /hunters", () => {
    test("ID not provided", async () => {
      await request(app).patch(`/merchants`).send({
        nombre: "testhunter",
        tipo: "herrero",
        ubicacion: "lago norte"
      }).expect(400);
    });

    test("BODY not provided", async () => {
        await request(app).patch(`/merchants?id=1`).expect(400);
    });
  
    test("Should modify a hunter", async () => {
        await request(app).patch(`/merchants?id=1`).send({
            nombre: "testhunter",
            tipo: "herrero",
            ubicacion: "lago norte"
        }).expect(200);
    });

    test("Invalid update body", async () => {
        await request(app).patch(`/merchants?id=1`).send({
          id: 10,
          nombre: "testhunter",
          tipo: "herrero",
          ubicacion: "lago norte"
        }).expect(400);
    });

    test("hunter not found", async () => {
        await request(app).patch(`/merchants?id=999`).send({
            nombre: "testhunter",
            tipo: "herrero",
            ubicacion: "lago norte"
        }).expect(404);
    });
});

  
describe("patch /merchants/:id", () => {
    /*test("ID not provided", async () => {
      await request(app).patch(`/goods`).send({
        nombre: "espada",
        descripcion: "espada de acero", 
        material: "acero",
        peso: 999,
        valor: 80,
        stock: 200
      }).expect(400);
    });*/

    test("BODY not provided", async () => {
        await request(app).patch(`/merchants/${insertedMerchant._id}`).expect(400);
    });
  
    test("Should modify a hunter", async () => {
        await request(app).patch(`/merchants/${insertedMerchant._id}`).send({
            nombre: "testhunter",
        tipo: "herrero",
        ubicacion: "lago norte"
        }).expect(200);
    });

    test("Invalid update body", async () => {
        await request(app).patch(`/merchants/${insertedMerchant._id}`).send({
            id: 20,
            nombre: "testhunter",
        tipo: "herrero",
        ubicacion: "lago norte"
        }).expect(400);
    });

    test("hunter not found", async () => {
        await request(app).patch(`/merchants/aaaaaaaaaaaaaaaaaaaaaaaa`).send({
            nombre: "testhunter",
        tipo: "herrero",
        ubicacion: "lago norte"
        }).expect(404);
    });

    test("error hunter", async () => {
        await request(app).patch(`/merchants/0000000`).send({
            nombre: "testhunter",
        tipo: "herrero",
        ubicacion: "lago norte"
        }).expect(500);
    });
});

describe("DELETE /hunters", () => {
    test("Should delete a hunter by id", async () => {
      await request(app).delete("/merchants?id=1").expect(200);
    });

    test("delete hunter no querystring", async () => {
        await request(app).delete("/merchants").expect(400);
    });

    test("hunter not found", async () => {
        await request(app).delete("/merchants?id=998").expect(404);
    });
});

describe("DELETE /hunters/:id", () => {
    test("Should get a hunter by _id", async () => {
      await request(app).delete(`/merchants/${insertedMerchant._id}`).expect(200);
    });
  
    test("Should not find a hunter by _id", async () => {
      await request(app).delete("/merchants/aaaaaaaaaaaaaaaaaaaaaaaa").expect(404);
    });

    test("Should get an error", async () => {
        await request(app).delete("/merchants/00000000000").expect(500);
      });
    });