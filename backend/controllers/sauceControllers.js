const Sauce = require('../models/Sauce');
const fs = require('fs')

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}


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
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
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
            return res.status(200).json({ message: 'Objet modifié!' })

          })
          .catch(error => res.status(401).json({ error }));

      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non authorise' });
      } else {
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

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

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
        // change d'avis ou reclique involontairement, on verifie presence dans tableaux, puis on ajuste les like
        // et on le retire du tableau
        case 0:
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