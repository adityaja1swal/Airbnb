const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body ? req.body : {});
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }),
);

router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let { title, description, image, price, location, country } = req.body;
    let newListing = new Listing({
      title,
      description,
      image: image ? { url: image } : undefined,
      price,
      location,
      country,
    });
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  }),
);

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingInfo = await Listing.findById(id).populate("reviews");
    console.log(listingInfo);
    if(!listingInfo){
      req.flash("error", "Property not exist!");
      res.redirect("/listings");
      return;
    }
    res.render("listings/show.ejs", { listingInfo });
  }),
);

router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingInfo = await Listing.findById(id);
    if (!listingInfo) {
      req.flash("error", "Property not exist!");
      res.redirect("/listings");
      return;
    }
    res.render("listings/edit.ejs", { listingInfo });
  }),
);

router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let { title, description, image, price, location, country } = req.body;
    await Listing.findOneAndReplace(
      { _id: id },
      {
        title,
        description,
        image: image ? { url: image } : undefined,
        price,
        location,
        country,
      },
    );
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  }),
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;
