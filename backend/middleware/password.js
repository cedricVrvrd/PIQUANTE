var passwordValidator = require('password-validator');

// Create a schema
var passwordSchema = new passwordValidator();

// Add properties to it
passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(50)                                  // Maximum length 50
.has().uppercase()                             // Must have  2uppercase letters
.has().lowercase()                             // Must have 2 lowercase letters
.has().digits()                                // Must have at least 2 digits
.has().symbols()                               // Must have at least 2 symbols
.has().not().spaces()                           // Should not have spaces


// verification du password par rapoort au schema définit
module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        console.log("mot de passe valide")
        next();
    }else{
        console.log("erreur mot de passe");
        return res.status(400).json({error : "le mot de passe doit contenir des majuscules, minuscules, lettres et symboles et ne pas contenir d'espaces"})
    }
}