// require
const passwordValidator = require('password-validator');

// Création d'un schema et definition des attributs necssaires
const passwordSchema = new passwordValidator();
passwordSchema
.is().min(8)                                    // 8 caractères min
.is().max(50)                                  // max 50 caracteres
.has().uppercase(2)                             // 2 minuscules min
.has().lowercase(2)                             // 2 majuscules min
.has().digits(2)                                // 2 chiffres minimum
.has().symbols(2)                               // 2 symbols mini
.has().not().spaces()                          // pas d'espaces


// verification du password par rapport au schema définit, si ok, next
module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        console.log("mot de passe valide")
        next();
    }else{
        console.log("erreur mot de passe");
        return res.status(400).json({error : "le mot de passe doit contenir des au moins 2 majuscules, 2 minuscules, 2 lettres et 2 symboles et ne pas contenir d'espaces"})
    }
}