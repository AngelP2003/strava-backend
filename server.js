require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Activity = require("./models/Activity");
const User = require("./models/User");

const app = express();

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend funcionando 🔥");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Usuario ya existe"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    await user.save();

    return res.status(201).json({
      message: "Usuario registrado"
    });
  } catch (error) {
    console.error("ERROR REGISTER:", error);

    return res.status(500).json({
      error: "Error del servidor"
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Correo y contraseña son obligatorios"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Correo o contraseña incorrectos"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      SECRET,
      { expiresIn: "7d" }
    );

    // No enviamos el hash de la contraseña al frontend
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    return res.json({
      token,
      user: safeUser
    });
  } catch (error) {
    console.error("ERROR LOGIN:", error);

    return res.status(500).json({
      error: "Error del servidor"
    });
  }
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Falta MONGODB_URI en el archivo .env");
    }

    if (!SECRET) {
      throw new Error("Falta JWT_SECRET en el archivo .env");
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
// GUARDAR ACTIVIDAD
app.post("/activities", async (req, res) => {
  try {
    const {
      userId,
      title,
      date,
      distance,
      duration,
      pace,
      notes,
      bpm,
      steps,
      cadence,
      acceleration,
      iaClass,
      iaLabel,
      iaConfidence,
      iaRecommendation
    } = req.body;

    if (!userId || !title || !date) {
      return res.status(400).json({
        error: "Faltan datos obligatorios"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "ID de usuario inválido"
      });
    }

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    const activity = await Activity.create({
      userId,
      title,
      date,
      distance,
      duration,
      pace,
      notes,
      bpm,
      steps,
      cadence,
      acceleration,
      iaClass,
      iaLabel,
      iaConfidence,
      iaRecommendation
    });

    return res.status(201).json({
      message: "Actividad guardada",
      activity
    });
  } catch (error) {
    console.error("ERROR SAVE ACTIVITY:", error);

    return res.status(500).json({
      error: "Error al guardar actividad"
    });
  }
});

// OBTENER ACTIVIDADES DEL USUARIO
app.get("/activities/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "ID de usuario inválido"
      });
    }

    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(activities);
  } catch (error) {
    console.error("ERROR GET ACTIVITIES:", error);

    return res.status(500).json({
      error: "Error al obtener actividades"
    });
  }
});

// ELIMINAR ACTIVIDAD
app.delete("/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "ID de actividad inválido"
      });
    }

    const activity = await Activity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({
        error: "Actividad no encontrada"
      });
    }

    return res.json({
      message: "Entrenamiento eliminado correctamente"
    });
  } catch (error) {
    console.error("ERROR DELETE ACTIVITY:", error);

    return res.status(500).json({
      error: "Error al eliminar actividad"
    });
  }
});
startServer();