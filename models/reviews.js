const { string } = require("joi");
const mongoose = require("mongoose");

const schema = mongoose.Schema;

const reviewSchema = new schema({
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min : 1,
    max : 5
  },
  createdAt: {
    type: date,
    default : Date.now()
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Listing;
