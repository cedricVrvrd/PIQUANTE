
//--------------------------------------------------
// Recupération des requires necessaires
//--------------------------------------------------
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

//--------------------------------------------------
// Middleware afinde sécuriser les routes
// Nous extrayons le token du header Authorization de la requête entrante. 
// qui contiendra également le mot-clé Bearer. 
// Nous utilisons donc la fonction split pour tout récupérer après l'espace dans le header. 
// on utilise verify pour decoder le token
//--------------------------------------------------
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       console.log(token);
       const decodedToken = jwt.verify(token, process.env.CLE_TOKEN);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};