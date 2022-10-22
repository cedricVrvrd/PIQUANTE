//--------------------------------------------------
// Requires necessaires
// cryptoJs et Bcrypt pour crypter/hasher mdp et email
// jwt pour attribuer un token à l'utilisateur
// recuperation model user
//  recupération variables environnements
//--------------------------------------------------
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

//--------------------------------------------------
// sauvegarde d'un nouvel utilisateur
// on crypte son emaile t mdp via cryptojs et bcript
//--------------------------------------------------
exports.signup = (req, res, next) => {
    const emailCryptoJs = CryptoJS.HmacSHA256(req.body.email, `${process.env.CLE_EMAIL}`).toString();
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: emailCryptoJs,
          password: hash
        });
        // sauvegarde et envoie reponse
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };


  //--------------------------------------------------
  // Login
  //--------------------------------------------------
  exports.login = (req, res, next) => {
    const emailCryptoJs = CryptoJS.HmacSHA256(req.body.email, `${process.env.CLE_EMAIL}`).toString();
//    recherche de l'utilisateur
    User.findOne({email: emailCryptoJs })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // compare les mots de passe
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.CLE_TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };