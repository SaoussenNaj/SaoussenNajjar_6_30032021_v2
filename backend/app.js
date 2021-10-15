// importer express par require
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");
const path = require("path");
const helmet = require("helmet");

//
// creation variable app pour notre application et appeler express()ce qui permet de créer une application express
const app = express();

// Etablir la connexion avec la BD
mongoose
  .connect(
    "mongodb+srv://Saoussen_28:iris2801@cluster0.dw0rm.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log(error));

// middelware general appliqué a toutes les routes du serveur
// pour passer d'un middelware à un autre on utilise next()
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(bodyParser.json());
app.use(helmet());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

// exporter cette const app pour qu'on puisse y acceder depuis les autres fichiers
module.exports = app;
