const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const dotenv = require("dotenv");
const path = require("node:path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
    inflate: true,
    limit: "1mb",
    parameterLimit: 5000,
    type: "application/x-www-form-urlencoded",
  }),
);
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("I am root");
});

app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.post("/listings", async (req, res) => {
  let { title, description, image, price, country } = req.body;
  let newListing = new Listing({ title, description, image, price, country });
  await newListing.save();
  res.redirect("/listings");
});

app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listingInfo = await Listing.findById(id);
  res.render("listings/show.ejs", { listingInfo });
});

app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listingInfo = await Listing.findById(id);
  res.render("listings/edit.ejs", { listingInfo });
});

app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;
  let { title, description, image, price, location, country } = req.body;
  await Listing.findOneAndReplace(
    { _id: id },
    { title, description, image: { url: image }, price, location, country },
  );
  res.redirect(`/listings/${id}`);
});

app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
