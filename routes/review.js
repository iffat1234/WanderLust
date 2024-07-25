const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const listing = require("../models/listing.js");

//server side validation using joi
const validateReview = (req , res , next)=> {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");//el means element
       throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
}


//review post route
router.post("/" ,validateReview, wrapAsync(async(req , res) => {
    const Listing = await listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    
    Listing.reviews.push(newReview);

    await newReview.save();
    await Listing.save();

    console.log("new review saved");
    req.flash("success" , "New Review Created!");
  res.redirect(`/listings/${Listing._id}`);

}));

//review delete route
router.delete("/:reviewId" , wrapAsync(async(req , res) => {
    let {id , reviewId} = req.params;
     await listing.findByIdAndUpdate(id, {$pull : { reviews : reviewId}});
     await Review.findByIdAndDelete(reviewId);
     req.flash("success" , "Review Deleted!");
     res.redirect(`/listings/${id}`);
}));

module.exports = router;