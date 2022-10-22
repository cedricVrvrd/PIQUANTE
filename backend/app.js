// on importe express et mongoose pour se connecter bdd et path pour "gerer" repertoire et chemin de fichier
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// require elements du "package securité"
// helmet securise requête http, en-tête, protection xss, click-jacking
// cookie-session pour sécuriser les cookies
//  xss contre cross site scripting
// rate limiter, limiter nombre reqûete
const helmet = require('helmet');
var cookieSession = require('cookie-session')
const rateLimit = require('express-rate-limit');
const { xss } = require('express-xss-sanitizer');


// declaration et importation des routes
const sauceRoutes = require('./routes/sauceRoutes');
const userRoutes = require('./routes/user');

//  création d'une constante ou on appelle la methode express() pour cree l'app
const app = express();

// imporation des vaiables d'environnements
const dotenv = require("dotenv").config();


// configuration securisation des cookies
app.use(cookieSession({
  name: process.env.NOM_COOKIE,
  keys: [process.env.CLE_COOKIE],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 heures
}))

// connection a la BDD
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(express.json());


// configuration pour limiter le nombre de requête d'un même adresse IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Trop de requêtes venant de cette adresse IP"
});



//  header permettant d'acceder à notre API depuis n'importe quelle origine
// d'ajouter les header mentionnés aux requêtes envoyées vers notre API
// Envoyer requêtes avce methode get...
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use('/images', express.static(path.join(__dirname, 'images')));

  // securité
  app.use(limiter);
  app.use(xss());
  app.use(helmet());

  // routes
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
  
  
// on export pour y avoir acces depuis d'autre fichier
module.exports = app;

