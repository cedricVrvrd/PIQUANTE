//  requires 
const multer = require('multer');

// dictionnaire pour definir le format des images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// On crée un objet de configuration pour préciser à multer 
// où enregistrer les fichiers images et les renommer
const storage = multer.diskStorage({
  // destination enregistrement images, donc fichier images
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // indique a multer d'utiliser le nom d'origine, de remplacer les espaces par 
  // des underscores et ajouter un timestamp
  //  et l'extension du fichier (jpg...)
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');