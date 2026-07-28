const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const dotenv = require("dotenv");
const path = require("node:path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

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

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body ? req.body : {});
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

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

app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }),
);

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

app.post(
  "/listings",
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
    res.redirect("/listings");
  }),
);

app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingInfo = await Listing.findById(id);
    res.render("listings/show.ejs", { listingInfo });
  }),
);

app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingInfo = await Listing.findById(id);
    res.render("listings/edit.ejs", { listingInfo });
  }),
);

app.put(
  "/listings/:id",
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
    res.redirect(`/listings/${id}`);
  }),
);

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  }),
);

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
