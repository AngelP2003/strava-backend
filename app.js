const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("./models/User");
const Activity = require("./models/Activity");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcionando 🔥");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Faltan datos"
      });
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
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("ERROR LOGIN:", error);

    return res.status(500).json({
      error: "Error del servidor"
    });
  }
});
app.post("/activities", async (req, res) => {
  try {
    console.log("ACTIVIDAD RECIBIDA:", req.body);

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
      error: "Error al guardar actividad",
      detail: error.message
    });
  }
});
module.exports = app;