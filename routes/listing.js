const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }),
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

router.post(
  "/",
  isLoggedIn,
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
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  }),
);

router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingInfo = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listingInfo) {
      req.flash("error", "Property not exist!");
      res.redirect("/listings");
      return;
    }
    res.render("listings/show.ejs", { listingInfo });
  }),
);

router.get(
  "/:id/edit",
  isLoggedIn,
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
  isOwner,
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    let { title, description, image, price, location, country } = req.body;
    await Listing.findByIdAndUpdate(
      id,
      {
        title,
        description,
        image: image ? { url: image } : undefined,
        price,
        location,
        country,
      },
      { new: true },
    );
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  }),
);

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  }),
);

module.exports = router;
