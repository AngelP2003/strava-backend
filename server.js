require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Falta MONGODB_URI");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Falta JWT_SECRET");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Atlas conectado");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();