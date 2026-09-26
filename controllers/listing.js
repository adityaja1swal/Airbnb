const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
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
};

module.exports.createListing = async (req, res) => {
  let { path, filename } = req.file || {};
  let { title, description, price, location, country } = req.body;
  let newListing = new Listing({
    title,
    description,
    image: req.file ? { url: path, filename } : undefined,
    price,
    location,
    country,
  });
  newListing.owner = req.user._id;
  let response = await geocodingClient
    .forwardGeocode({
      query: location + " , " + country,
      limit: 1,
    })
    .send();

  newListing.geometry = response.body.features[0].geometry;

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listingInfo = await Listing.findById(id);
  if (!listingInfo) {
    req.flash("error", "Property not exist!");
    res.redirect("/listings");
    return;
  }

  let originalImageUrl = listingInfo.image.url;
  if(originalImageUrl){
    originalImageUrl.replace("/upload", "/upload/h_300,w_250,e_blur");
  }
  res.render("listings/edit.ejs", { listingInfo, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let { location , country} = req.body;
  let { path, filename } = req.file || {};

  let response = await geocodingClient
    .forwardGeocode({
      query: location + " , " + country,
      limit: 1,
    })
    .send();

  let listing = await Listing.findByIdAndUpdate(
    id,
    {
      ...req.body,
      geometry: response.body.features[0].geometry,
    },
    { new: true, runValidators: true },
  );

  if (req.file) {
    listing.image = { url: path, filename };
    await listing.save();
  }
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};
