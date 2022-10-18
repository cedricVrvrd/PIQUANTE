var passwordValidator = require('password-validator');

// Create a schema
var passwordSchema = new passwordValidator();

// Add properties to it
passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(50)                                  // Maximum length 50
.has().uppercase(2)                             // Must have  2uppercase letters
.has().lowercase(2)                             // Must have 2 lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().symbols(2)                               // Must have at least 2 symbols
.has().not().spaces()                          // Should not have spaces


// verification du password par rapoort au schema définit
module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        console.log("mot de passe valide")
        next();
    }else{
        console.log("erreur mot de passe");
        return res.status(400).json({error : "le mot de passe doit contenir des au moins 2 majuscules, 2 minuscules, 2 lettres et 2 symboles et ne pas contenir d'espaces"})
    }
}