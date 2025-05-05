import { describe, test, beforeEach } from "vitest";
import request from "supertest";
import {app} from "../src/index.js"

import { Good } from "../src/models/goods.js";

// TAMBIEN DEBE COMPROBAR EL CONTENIDO DE LOS CUERPOS DE LAS RESPUESTAS Y EL ESTADO DE LAS COLECCIONES EN LA BASE DE DATOS

let insertedGood;

const firstGood = {
    id: 1,
    nombre: "espada",
    descripcion: "espada de acero", 
    material: "acero",
    peso: 10,
    valor: 80,
    stock: 200
}

beforeEach(async () => {
    await Good.deleteMany();
    insertedGood = await new Good(firstGood).save();
});


describe("POST /goods", () => {
  test("Should successfully create a new good", async () => {
    await request(app)
      .post("/goods")
      .send({
        id: 2,
        nombre: "armadura",
        descripcion: "armadura de hierro",
        material: "hierro",
        peso: 20,
        valor: 50,
        stock: 20
      })
      .expect(201);
  });

  test("Should get an error", async () => {
    await request(app).post("/goods").send(firstGood).expect(500);
  });
});

describe("GET /goods", () => {
    test("Should get a good by nombre", async () => {
      await request(app).get("/goods?nombre=espada").expect(200);
    });
  
    test("Should not find a user by username", async () => {
      await request(app).get("/goods?nombre=NOEXISTE").expect(404);
    });

    test("Should be a BAD REQUEST", async () => {
        await request(app).get("/goods?NOEXISTE=espada").expect(400);
      });
});

describe("GET /goods/:id", () => {
    test("Should get a good by _id", async () => {
      await request(app).get(`/goods/${insertedGood._id}`).expect(200);
    });
  
    test("Should not find a good by _id", async () => {
      await request(app).get("/goods/aaaaaaaaaaaaaaaaaaaaaaaa").expect(404);
    });

    test("Should get an error", async () => {
        await request(app).get("/goods/00000000000").expect(500);
      });
});

describe("patch /goods", () => {
    test("ID not provided", async () => {
      await request(app).patch(`/goods`).send({
        nombre: "espada",
        descripcion: "espada de acero", 
        material: "acero",
        peso: 999,
        valor: 80,
        stock: 200
      }).expect(400);
    });

    test("BODY not provided", async () => {
        await request(app).patch(`/goods?id=1`).expect(400);
    });
  
    test("Should modify a good", async () => {
        await request(app).patch(`/goods?id=1`).send({
          nombre: "espada",
          descripcion: "espada de acero", 
          material: "acero",
          peso: 999,
          valor: 80,
          stock: 200
        }).expect(200);
    });

    test("Invalid update body", async () => {
        await request(app).patch(`/goods?id=1`).send({
          id: 10,
          nombre: "espada",
          descripcion: "espada de acero", 
          material: "acero",
          peso: 999,
          valor: 80,
          stock: 200
        }).expect(400);
    });

    test("good not found", async () => {
        await request(app).patch(`/goods?id=999`).send({
          nombre: "espada",
          descripcion: "espada de acero", 
          material: "acero",
          peso: 999,
          valor: 80,
          stock: 200
        }).expect(404);
    });
});

  
describe("patch /goods/:id", () => {
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
        await request(app).patch(`/goods/${insertedGood._id}`).expect(400);
    });
  
    test("Should modify a good", async () => {
        await request(app).patch(`/goods/${insertedGood._id}`).send({
          nombre: "espada",
          descripcion: "espada de acero", 
          material: "acero",
          peso: 990,
          valor: 80,
          stock: 200
        }).expect(200);
    });

    test("Invalid update body", async () => {
        await request(app).patch(`/goods/${insertedGood._id}`).send({
          id: 20,
          nombre: "espada",
          descripcion: "espada de acero", 
          material: "acero",
          peso: 999,
          valor: 80,
          stock: 200
        }).expect(400);
    });

    test("good not found", async () => {
        await request(app).patch(`/goods/aaaaaaaaaaaaaaaaaaaaaaaa`).send({
          nombre: "espada",
          descripcion: "espada de acero", 
          material: "acero",
          peso: 999,
          valor: 80,
          stock: 200
        }).expect(404);
    });

    test("error good", async () => {
        await request(app).patch(`/goods/0000000`).send({
          nombre: "espada",
          descripcion: "espada de acero", 
          material: "acero",
          peso: 999,
          valor: 80,
          stock: 200
        }).expect(500);
    });
});

describe("DELETE /goods", () => {
    test("Should delete a good by id", async () => {
      await request(app).delete("/goods?id=1").expect(200);
    });

    test("delete good no querystring", async () => {
        await request(app).delete("/goods").expect(400);
    });

    test("good not found", async () => {
        await request(app).delete("/goods?id=998").expect(404);
    });
});

describe("DELETE /goods/:id", () => {
    test("Should get a good by _id", async () => {
      await request(app).delete(`/goods/${insertedGood._id}`).expect(200);
    });
  
    test("Should not find a good by _id", async () => {
      await request(app).delete("/goods/aaaaaaaaaaaaaaaaaaaaaaaa").expect(404);
    });

    test("Should get an error", async () => {
        await request(app).delete("/goods/00000000000").expect(500);
      });
});



