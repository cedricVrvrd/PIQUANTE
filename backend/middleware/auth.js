
//--------------------------------------------------
// Recupération des requires necessaires
//--------------------------------------------------
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

//--------------------------------------------------
// Middleware afinde sécuriser les routes
// Nous extrayons le token du header Authorization de la requête entrante. 
// qui contiendra également le mot-clé Bearer. 
// Nous utilisons donc la fonction split pour divider la chaîne de caractere en deux
// et en faire un tableau autour de l'espace
// puis récupérer le token après l'espace [1]. 
//--------------------------------------------------
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       console.log(token);
        // on decode le token grâce à la methode verify, on passe le token récupéré + clé secrète 
       const decodedToken = jwt.verify(token, process.env.CLE_TOKEN);
    //    Nous extrayons l'ID utilisateur de notre token et le rajoutons à 
    // l’objet Request afin que nos différentes routes puissent l’exploiter.
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};