const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

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
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const eachListing = await listing.findById(id).populate("reviews");
    if(!eachListing){
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { eachListing });
}));

//create route
router.post("/", wrapAsync(async (req, res, next) => {
    const newListing = new listing(req.body.listing);
    await newListing.save();
    req.flash("success" , "New Listing Created!");
    res.redirect("/listings");

}));

//edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const eachListing = await listing.findById(id);
    res.render("listings/edit.ejs", { eachListing });
}));

//update route
router.put("/:id",validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndUpdate(id, { ...req.body.listing });
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