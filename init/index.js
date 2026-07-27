const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("Data was saved");
};

initDB();