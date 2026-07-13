const request = require("supertest");
const app = require("../app");

describe("Pruebas básicas del backend", () => {
  test("GET / debe indicar que el backend funciona", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Backend funcionando");
  });

  test("POST /register sin datos debe responder 400", async () => {
    const response = await request(app)
      .post("/register")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Faltan datos"
    });
  });

  test("POST /login sin datos debe responder 400", async () => {
    const response = await request(app)
      .post("/login")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Correo y contraseña son obligatorios"
    });
  });
});