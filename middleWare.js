// for access listing from db
const Listing = require("./models/listing");
const Review = require("./models/review.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

// direct home page se login krne pr this middleware doesn't login

module.exports.isloggedIn  = (req, res , next) =>{
        // authenticate user before allowing to create new listing on website
   if (!req.isAuthenticated()) {

    // when user not logged 
//     redirectUrl save
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listing");
    
   return  res.redirect("/login");
    
   } 
//    if user authenticate h
next();
}

// for originalUrl save krane ke liye

module.exports.saveRedirectUrl = (req, res, next) =>{
        if (req.session.redirectUrl) {
           res.locals.redirectUrl = req.session.redirectUrl;     
                
        }
        next();

}

// middleware for authorization