/**
 * Database Seeding Script
 * Seeds the database with tour data from JSON file
 */

import mongoose from "mongoose"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from 'url';
import Tour from "../models/Tour.js"

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()

// Slug generator utility
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^a-z0-9\-]/g, '')    // Remove all non-alphanumeric except -
    .replace(/-+/g, '-')             // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');        // Trim - from start/end
}

// Read and transform tours.json
const toursPath = path.join(__dirname, "../data/tours.json")
const rawTours = JSON.parse(fs.readFileSync(toursPath, "utf-8"))

// Helper to ensure unique slugs in this batch
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

// Transform tours to match model and add slug
const sampleTours = rawTours.map(tour => {
  const name = tour.name || tour.title;
  const baseSlug = slugify(name);
  const slug = getUniqueSlug(baseSlug);
  // Preserve _id if present and convert to ObjectId if valid
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
    // Ensure all tours are active
    availability: { isActive: true },
  };
  if (tour._id && /^[a-fA-F0-9]{24}$/.test(tour._id)) {
    doc._id = new mongoose.Types.ObjectId(tour._id);
  }
  return doc;
})

async function seedDatabase() {
  try {
    console.log("Starting database seeding process...")
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tourguide", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(" Connected to MongoDB")
    await Tour.deleteMany({})
    console.log("Cleared existing tours")
    const tours = await Tour.insertMany(sampleTours)
    console.log(`Successfully added ${tours.length} sample tours to database`)
    console.log("\n Seeded Tours:")
    tours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.title} (${tour.category}) - $${tour.price} - slug: ${tour.slug}`)
    })
    console.log("\n Database seeding completed successfully!")
    console.log(" You can now start your server with: npm start")
  } catch (error) {
    console.error(" Error seeding database:", error.message)
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.log(`  - ${key}: ${error.errors[key].message}`)
      })
    }
    console.log("\n🔧 Troubleshooting:")
    console.log("1. Make sure MongoDB is running")
    console.log("2. Check your MongoDB connection string")
    console.log("3. Verify MongoDB service is started")
    console.log("4. Check if all required fields are provided")
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
    process.exit(0)
  }
}

seedDatabase()
