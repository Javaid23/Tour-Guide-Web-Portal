import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from 'dotenv';

// Use dynamic import for Destination model to avoid module resolution issues
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const jsonFiles = [
  "destinations-punjab.json",
  "destinations-sindh.json",
  "destinations-kp.json",
  "destinations-gilgit-baltistan.json",
  "destinations-ajk.json",
  "destinations-islamabad.json",
  "destinations-balochistan.json"
];

async function loadDestinations() {
  let allDestinations = [];
  for (const file of jsonFiles) {
    const filePath = path.join(__dirname, file);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const destinations = JSON.parse(data);
      if (Array.isArray(destinations)) {
        allDestinations = allDestinations.concat(destinations);
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }
  return allDestinations;
}

async function findLocalImage(province, name) {
  if (!province || !name) return null;
  const prov = province.toLowerCase().replace(/ /g, '-');
  // Remove special chars, normalize spaces/dashes
  const baseName = name.replace(/[^a-zA-Z0-9\- ]/g, '').replace(/ /g, '-').toLowerCase();
  const exts = ['.jpeg', '.jpg', '.png'];
  for (const ext of exts) {
    const relPath = `/images/destinations/${prov}/${baseName}${ext}`;
    const absPath = path.resolve(__dirname, '../../frontend/public' + relPath);
    try {
      await fs.access(absPath);
      return relPath;
    } catch {}
  }
  return null;
}

async function attachImages(destinations) {
  let missingImages = [];
  for (const dest of destinations) {
    // Try to get province/state
    let province = '';
    if (dest.location && dest.location.state) province = dest.location.state;
    else if (dest.province) province = dest.province;
    // Try to get name
    const name = dest.name || dest.title;
    const localImg = await findLocalImage(province, name);
    if (localImg) {
      dest.images = [{ url: localImg, caption: name, isPrimary: true }];
    } else {
      missingImages.push(`[${province}] ${name}`);
    }
  }
  if (missingImages.length > 0) {
    console.log(`\nDestinations missing images (${missingImages.length}):`);
    missingImages.forEach(d => console.log(' - ' + d));
  } else {
    console.log('All destinations have images!');
  }
}

async function seed() {
  // Dynamically import the Destination model
  const { default: Destination } = await import(pathToFileURL(path.resolve(__dirname, '../models/Destination.js')));
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to MongoDB");
  try {
    await Destination.deleteMany({});
    console.log("Cleared existing destinations");
    const destinations = await loadDestinations();
    if (destinations.length === 0) {
      console.error("No destinations found in JSON files.");
      process.exit(1);
    }
    await attachImages(destinations);
    await Destination.insertMany(destinations);
    console.log(`Inserted ${destinations.length} destinations.`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
