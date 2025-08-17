import seedTours from "./seedToursOnly.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAllSeeds() {
  // Seed tours
  await seedTours();
  // Seed destinations
  const seedDestPath = path.join(__dirname, "../data/seedAllDestinations.js");
  const { default: seedDestinations } = await import(seedDestPath);
  await seedDestinations();
}

runAllSeeds();
