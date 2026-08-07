const { ref } = require("joi");
const mongoose = require("mongoose");

const schema = mongoose.Schema;
const defaultImageUrl =
  "https://images.unsplash.com/photo-1517840901100-8179e982acb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170";

const listingSchema = new schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: Object,
    default: { url: defaultImageUrl },
    set: (v) => {
      if (v === "" || v == null) {
        return { url: defaultImageUrl };
      }
      if (typeof v === "string") {
        return { url: v };
      }
      if (typeof v === "object" && v.url === "") {
        return { url: defaultImageUrl };
      }
      return v;
    },
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  reviews : [
    {
      type: schema.Types.ObjectId,
      ref: "Review",
    }
  ]
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
