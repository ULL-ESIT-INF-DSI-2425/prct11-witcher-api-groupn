import { describe, test, beforeEach } from "vitest";
import request from "supertest";
import {app} from "../src/index.js"

import { Good } from "../src/models/goods.js";

beforeEach(async () => {
    await Good.deleteMany();
});


describe("POST /goods", () => {
  test("Should successfully create a new good", async () => {
    await request(app)
      .post("/goods")
      .send({
        id: 1111,
        nombre: "test bien",
        descripcion: "armadura de hierro",
        material: "hierro",
        peso: 20,
        valor: 50,
        stock: 20
      })
      .expect(201);
  });

  /*test("GOOD NOT UNIQUE", async () => {
    await request(app)
      .post("/goods")
      .send({
        id: 1111,
        nombre: "test bien",
        descripcion: "armadura de hierro",
        material: "hierro",
        peso: 20,
        valor: 50,
        stock: 20
      })
      .expect(201);

      await request(app)
      .post("/goods")
      .send({
        id: 1111,
        nombre: "test bien",
        descripcion: "armadura de hierro",
        material: "hierro",
        peso: 20,
        valor: 50,
        stock: 20
      })
      .expect(500);
  });*/
});
