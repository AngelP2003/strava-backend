require("dotenv").config();

const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../app");
const User = require("../models/User");

describe("Integración de autenticación con MongoDB", () => {
  beforeAll(async () => {
    if (!process.env.MONGODB_TEST_URI) {
      throw new Error("Falta MONGODB_TEST_URI");
    }

    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "secreto-de-pruebas";

    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterEach(async () => {
    await User.deleteMany({
      email: /@prueba\.com$/
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test("registra y después autentica un usuario", async () => {
    const uniqueEmail =
      `usuario-${Date.now()}@prueba.com`;

    const registerResponse = await request(app)
      .post("/register")
      .send({
        name: "Usuario Prueba",
        email: uniqueEmail,
        password: "Password123"
      });

    expect(registerResponse.statusCode).toBe(201);
    expect(registerResponse.body.message)
      .toBe("Usuario registrado");

    const loginResponse = await request(app)
      .post("/login")
      .send({
        email: uniqueEmail,
        password: "Password123"
      });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.user.email)
      .toBe(uniqueEmail);
    expect(loginResponse.body.user.password)
      .toBeUndefined();
  });
});