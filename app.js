const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("node:path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");

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

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res) => {
  res.send("I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

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
