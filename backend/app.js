// on importe express
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const sauceRoutes = require('./routes/sauceRoutes');
const userRoutes = require('./routes/user');
//  création d'une constante ou on appelle la methode express() pour cree l'app
const app = express();

const dotenv = require("dotenv").config();



mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(express.json());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Trop de requêtes venant de cette adresse IP"
});

app.use(limiter);


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


  
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use(helmet());
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
  
  
// on export pour y avoir acces depuis d'autre fichier
module.exports = app;

