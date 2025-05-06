import { describe, test, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

import { Hunter } from "../src/models/hunters.js";

let insertedHunter;

const firstHunter = {
    id: 1,
    nombre: "testhunter",
    raza: "humano",
    ubicacion: "lago sur"
}

beforeEach(async () => {
    await Hunter.deleteMany({nombre: {$in: ["testhunter", "test hunter2"]}});
    insertedHunter = await new Hunter(firstHunter).save();
});


describe("POST /hunters", () => {
  test("Should successfully create a new hunter", async () => {
    const response = await request(app)
      .post("/hunters")
      .send({
        id: 2,
        nombre: "test hunter2",
        raza: "humano",
        ubicacion: "arbol"
      })
      .expect(201);

      expect(response.body).to.include({
        id: 2,
        nombre: "test hunter2",
        raza: "humano",
        ubicacion: "arbol"
      });
      
      const secondHunter = await Hunter.findById(response.body._id);
      expect(secondHunter).not.toBe(null);
      expect(secondHunter!.nombre).to.equal("test hunter2");
  });

  test("Should get an error", async () => {
    await request(app).post("/hunters").send(firstHunter).expect(500);
  });
});

describe("GET /hunters", () => {
    test("Should get a hunter by nombre", async () => {
      await request(app).get("/hunters?nombre=testhunter").expect(200);
    });
  
    test("Should not find a hunter by name", async () => {
      await request(app).get("/hunters?nombre=NOEXISTE").expect(404);
    });

    test("Should be a BAD REQUEST", async () => {
        await request(app).get("/hunters?NOEXISTE=espada").expect(400);
      });
});

describe("GET /hunters/:id", () => {
    test("Should get a hunter by _id", async () => {
      const response = await request(app).get(`/hunters/${insertedHunter._id}`).expect(200);

      expect(response.body).to.include({
        id: 1,
        nombre: "testhunter",
        raza: "humano",
        ubicacion: "lago sur"
      });

    });
  
    test("Should not find a hunter by _id", async () => {
      await request(app).get("/hunters/aaaaaaaaaaaaaaaaaaaaaaaa").expect(404);
    });

    test("Should get an error", async () => {
        await request(app).get("/hunters/00000000000").expect(500);
      });
});

describe("patch /hunters", () => {
    test("ID not provided", async () => {
      await request(app).patch(`/hunters`).send({
        nombre: "testhunter",
        raza: "humano",
        ubicacion: "lago norte"
      }).expect(400);
    });

    test("BODY not provided", async () => {
        await request(app).patch(`/hunters?id=1`).expect(400);
    });
  
    test("Should modify a hunter", async () => {
        const response = await request(app).patch(`/hunters?id=1`).send({
            nombre: "testhunter",
            raza: "humano",
            ubicacion: "lago norte"
        }).expect(200);

        expect(response.body).to.include({
          id: 1,
          nombre: "testhunter",
          raza: "humano",
          ubicacion: "lago norte"
        });

        const updatedHunter = await Hunter.findById(response.body._id);
        expect(updatedHunter).not.toBe(null);
        expect(updatedHunter!.ubicacion).to.equal("lago norte");


    });

    test("Invalid update body", async () => {
        await request(app).patch(`/hunters?id=1`).send({
          id: 10,
          nombre: "testhunter",
          raza: "humano",
          ubicacion: "lago norte"
        }).expect(400);
    });

    test("hunter not found", async () => {
        await request(app).patch(`/hunters?id=999`).send({
            nombre: "testhunter",
            raza: "humano",
            ubicacion: "lago norte"
        }).expect(404);
    });
});

  
describe("patch /hunters/:id", () => {

    test("BODY not provided", async () => {
        await request(app).patch(`/hunters/${insertedHunter._id}`).expect(400);
    });
  
    test("Should modify a hunter", async () => {
        const response = await request(app).patch(`/hunters/${insertedHunter._id}`).send({
            nombre: "testhunter",
            raza: "humano",
            ubicacion: "lago norte"
        }).expect(200);

        expect(response.body).to.include({
          id: 1,
          nombre: "testhunter",
          raza: "humano",
          ubicacion: "lago norte"
        });

        const updatedHunter = await Hunter.findById(response.body._id);
        expect(updatedHunter).not.toBe(null);
        expect(updatedHunter!.ubicacion).to.equal("lago norte");
    });

    test("Invalid update body", async () => {
        await request(app).patch(`/hunters/${insertedHunter._id}`).send({
            id: 20,
            nombre: "testhunter",
            raza: "humano",
            ubicacion: "lago norte"
        }).expect(400);
    });

    test("hunter not found", async () => {
        await request(app).patch(`/hunters/aaaaaaaaaaaaaaaaaaaaaaaa`).send({
            nombre: "testhunter",
            raza: "humano",
            ubicacion: "lago norte"
        }).expect(404);
    });

    test("error hunter", async () => {
        await request(app).patch(`/hunters/0000000`).send({
            nombre: "testhunter",
            raza: "humano",
            ubicacion: "lago norte"
        }).expect(500);
    });
});

describe("DELETE /hunters", () => {
    test("Should delete a hunter by id", async () => {
      const response = await request(app).delete("/hunters?id=1").expect(200);

      expect(response.body).to.include({
        id: 1,
        nombre: "testhunter",
        raza: "humano",
        ubicacion: "lago sur"
      });

      const deletedHunter = await Hunter.findById(response.body._id);
      expect(deletedHunter).toBe(null);
      //expect(updatedHunter!.ubicacion).to.equal("lago norte");
    });

    test("delete hunter no querystring", async () => {
        await request(app).delete("/hunters").expect(400);
    });

    test("hunter not found", async () => {
        await request(app).delete("/hunters?id=998").expect(404);
    });
});

describe("DELETE /hunters/:id", () => {
    test("Should get a hunter by _id", async () => {
      const response = await request(app).delete(`/hunters/${insertedHunter._id}`).expect(200);

      expect(response.body).to.include({
        id: 1,
        nombre: "testhunter",
        raza: "humano",
        ubicacion: "lago sur"
      });

      const deletedHunter = await Hunter.findById(response.body._id);
      expect(deletedHunter).toBe(null);
    });
  
    test("Should not find a hunter by _id", async () => {
      await request(app).delete("/hunters/aaaaaaaaaaaaaaaaaaaaaaaa").expect(404);
    });

    test("Should get an error", async () => {
        await request(app).delete("/hunters/00000000000").expect(500);
      });
});



