// Récupération des élémentq necessaires
// models/sauce
// module fs (file system) pour la gestion des telechargements et images
const Sauce = require('../models/Sauce');
const fs = require('fs')


//--------------------------------------------------
// Création d'une sauce
//--------------------------------------------------
exports.createSauce = (req, res, next) => {
  // recupération des données du front-end sous form-data pour en faire un objet
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  // nous supprimons le champ _userId de la requête client pour le remplacer par le token d'identification
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    // récuprértion de l'url complete de l'image
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  // on sauvegarde la sauce
  sauce.save()
    // reponse au front sous forme 201 objet enregistré, catch en cas de problème
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
};

// --------------------------------------------------
// --------------------------------------------------
exports.getOneSauce = (req, res, next) => {
   // methode findOne pour trouver la sauce ayant le même _id que le paramètre de la requête
  Sauce.findOne({ _id: req.params.id })
  // si trouvé, réponse au front ou message erreur
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

//--------------------------------------------------
// Modification de la sauce.
// Si image => on change les données et images et on efface l'image
// Si pas immage, on change juste les données
//--------------------------------------------------
exports.modifySauce = (req, res, next) => {
  let sauceObject = "";
  if (req.file) {
    sauceObject = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
  }
  else {
    sauceObject = { ...req.body }
  }

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // si pas le même utilisateur, requête unauthorized
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: 'unauthorized request' });
      } else {
        // mise à jour de la sauce
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(function () {
            console.log("51")
            if (req.file) {
              console.log("53")
              const filename = sauce.imageUrl.split('/images/')[1];
              console.log(filename)
              fs.unlink(`images/${filename}`, function () { console.log("fich supp") })
            }
            console.log("58")
            // retourne un message de confirmation
            return res.status(200).json({ message: 'Objet modifié!' })

          })
          .catch(error => res.status(401).json({ error }));

      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};


//--------------------------------------------------
// SUPPRESSION D'UNE SAUCE
//--------------------------------------------------
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // verification de l'utilisateur
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: 'unauthorized request' });
      } else {
        // on récupére l'url de la sauce et on supprime l'image gràce a la fonction unlink
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

//--------------------------------------------------
// Recupération de toutes les sauces
//--------------------------------------------------
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};


//--------------------------------------------------
// Like ou dislike
//--------------------------------------------------
exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  const likes = req.body.like;
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      switch (likes) {
        // utilisateur clique sur like, on ajoute un like on le push dans le tableau
        case 1:
          Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: +1 }, $push: { usersLiked: userId }, _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Like ajouté !" });
            })
            .catch(error => res.status(400).json({ error }));
          break;
        // change d'avis ou re-clique involontairement, on verifie presence dans tableaux, puis on ajuste les likes/dislikes
        // et on le retire du tableau
        case 0:
          // si dans tablleaux, déjà présent ou pas
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: userId }, _id: req.params.id })
              .then(() => {
                res.status(200).json({ message: "Vous ne pouvez liker qu'une seule fois !" });
              })
              .catch(error => res.status(400).json({ error }));
          }
          else if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId }, _id: req.params.id })
              .then(() => {
                res.status(200).json({ message: "Vous ne pouvez liker qu'une seule fois !" });
              })
              .catch(error => res.status(400).json({ error }));
          }
          break;
        // si utilisateur dislike
        case -1:
          Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: +1 }, $push: { usersDisliked: userId }, _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Dislike ajouté !" });
            })
            .catch(error => res.status(400).json({ error }));
          break;
        default:
          console.log("error");
      }
    })
    .catch(error => {
      res.status(404).json({ error })
    });
};