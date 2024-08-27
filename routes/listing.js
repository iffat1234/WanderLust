const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const {isloggedIn} = require("../middleWare.js");
const {storage} = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage});
//server side validation middleware
const validateListing = (req , res , next)=> {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");//el means element
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};


//index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index.ejs", { allListings });
})
);

// new route
router.get("/new",isloggedIn , (req, res) => {
   // console.log(req.user);
    
    res.render("listings/new.ejs");
});

//show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const eachListing = await listing.findById(id).populate("reviews").populate("owner");
    if(!eachListing){
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(eachListing);
    res.render("listings/show.ejs", { eachListing });
}));

//create route
router.post("/",isloggedIn, upload.single("listing[image]"), validateListing, wrapAsync(async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new listing(req.body.listing);
   newListing.owner = req.user._id;

   newListing.image = { url, filename };

    await newListing.save();
    req.flash("success" , "New Listing Created!");
    res.redirect("/listings");

}));

//edit route
router.get("/:id/edit",isloggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const eachListing = await listing.findById(id);
    res.render("listings/edit.ejs", { eachListing });
}));

//update route
router.put("/:id",isloggedIn, upload.single("listing[image]"), validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let Listing = await listing.findByIdAndUpdate(id, { ...req.body.listing });
    if (typeof req.file !== "undefined") {
        //  upload  image ko listing m show krna cloudinary se
        let url = req.file.path;
        let filename = req.file.filename;
        // then listing m new image add ki 
        Listing.image = { url, filename };
        await Listing.save();
    }
    req.flash("success" , " Listing Updated!");
    res.redirect(`/listings/${id}`);//redirect to the show route
}));

//delete route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" , " Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;