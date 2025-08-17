import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Tour from "../models/Tour.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Slug generator utility
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Read and transform tours.json
const toursPath = path.join(__dirname, "../data/tours.json");
const rawTours = JSON.parse(fs.readFileSync(toursPath, "utf-8"));
const usedSlugs = new Set();
function getUniqueSlug(base) {
  let slug = base;
  let i = 1;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${i++}`;
  }
  usedSlugs.add(slug);
  return slug;
}
const sampleTours = rawTours.map(tour => {
  const name = tour.name || tour.title;
  const baseSlug = slugify(name);
  const slug = getUniqueSlug(baseSlug);
  let doc = {
    name,
    title: tour.title,
    description: tour.description,
    category: tour.category,
    price: tour.price,
    duration: (typeof tour.duration === "object" && tour.duration.days)
      ? tour.duration
      : { days: Number(tour.duration) || 1 },
    destinations: Array.isArray(tour.destinations)
      ? tour.destinations
      : [{ location: tour.location }],
    maxGroupSize: tour.maxGroupSize,
    difficulty: tour.difficulty,
    images: tour.images,
    highlights: tour.highlights,
    included: tour.included,
    itinerary: tour.itinerary,
    rating: tour.rating,
    reviewCount: tour.reviewCount || tour.numReviews,
    createdAt: tour.createdAt,
    slug,
    availability: { isActive: true },
  };
  if (tour._id && /^[a-fA-F0-9]{24}$/.test(tour._id)) {
    doc._id = new mongoose.Types.ObjectId(tour._id);
  }
  return doc;
});

async function seedTours() {
  try {
    console.log("Starting tour database seeding...");
  await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    await Tour.deleteMany({});
    console.log("Cleared existing tours");
    const tours = await Tour.insertMany(sampleTours);
    console.log(`Seeded ${tours.length} tours.`);
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding tours:", error);
    await mongoose.disconnect();
  }
}

export default seedTours;
