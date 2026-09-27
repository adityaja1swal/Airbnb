const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Review = require("../models/review.js");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

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

const fakeUsers = [
  { username: "demo", email: "demo@example.com" },
  { username: "maya_rose", email: "maya.rose@example.com" },
  { username: "liam_stays", email: "liam.stays@example.com" },
  { username: "sofia.nova", email: "sofia.nova@example.com" },
  { username: "noah.atlas", email: "noah.atlas@example.com" },
  { username: "ava.haven", email: "ava.haven@example.com" },
  { username: "ethan.wild", email: "ethan.wild@example.com" },
  { username: "emma.vacays", email: "emma.vacays@example.com" },
  { username: "olivercoast", email: "oliver.coast@example.com" },
];

const reviewTemplates = [
  {
    rating: 5,
    comment:
      "The place felt even better than the photos. It was spotless, peaceful, and incredibly comfortable for a long weekend.",
  },
  {
    rating: 4,
    comment:
      "Beautiful surroundings and a really smooth check-in experience. The host was responsive and the space had everything we needed.",
  },
  {
    rating: 5,
    comment:
      "One of the best stays we’ve had. The neighborhood was great, the view was amazing, and the overall vibe was relaxing.",
  },
  {
    rating: 3,
    comment:
      "A lovely property with a few small quirks, but overall a comfortable and well-located place to stay.",
  },
];

const initDB = async () => {
  await User.deleteMany({});
  await Listing.deleteMany({});
  await Review.deleteMany({});

  const createdUsers = await User.insertMany(fakeUsers);

  const listings = initData.data.map((obj) => ({
    ...obj,
    owner: createdUsers[0]._id,
  }));

  const savedListings = await Listing.insertMany(listings);

  for (let i = 0; i < savedListings.length; i++) {
    const listing = savedListings[i];
    const reviewBatch = reviewTemplates.map((template, index) => ({
      ...template,
      author: createdUsers[(i + index) % createdUsers.length]._id,
    }));

    const insertedReviews = await Review.insertMany(reviewBatch);
    listing.reviews = insertedReviews.map((review) => review._id);
    await listing.save();
  }

  console.log(
    `Data was saved with ${savedListings.length} listings and reviews across all listings.`,
  );
};

initDB();
