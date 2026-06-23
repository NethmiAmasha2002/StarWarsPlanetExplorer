import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

const PORT = Number(process.env.PORT ?? 4000);
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/rightmo_planets';
const SWAPI_BASE = 'https://swapi.info/api';

const app = express();

app.use(cors());

const planetSchema = new mongoose.Schema(
  {
    swapiId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    diameter: { type: String, required: true },
    terrain: { type: String, required: true },
    population: { type: String, required: true },
    rotation_period: { type: String, required: true },
    orbital_period: { type: String, required: true },
    climate: { type: String, required: true },
    gravity: { type: String, required: true },
    surface_water: { type: String, required: true },
    residents: { type: [String], default: [] },
    films: { type: [String], default: [] },
  },
  {
    versionKey: false,
  },
);

const Planet = mongoose.model('Planet', planetSchema);
let isMongoAvailable = false;
let fallbackPlanets = [];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractPlanetId(planetUrl) {
  const match = planetUrl.match(/\/planets\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function toPlanetSummary(planet) {
  const swapiId = typeof planet.swapiId === 'number' ? planet.swapiId : extractPlanetId(planet.url ?? '');

  return {
    name: planet.name,
    diameter: planet.diameter,
    terrain: planet.terrain,
    population: planet.population,
    rotation_period: planet.rotation_period,
    orbital_period: planet.orbital_period,
    climate: planet.climate,
    gravity: planet.gravity,
    surface_water: planet.surface_water,
    residents: Array.isArray(planet.residents) ? planet.residents : [],
    films: Array.isArray(planet.films) ? planet.films : [],
    url: swapiId ? `https://swapi.info/api/planets/${swapiId}` : planet.url,
  };
}

async function fetchAllSwapiPlanets() {
  // swapi.info can return either an array or a paginated object depending on endpoint/version.
  const response = await fetch(`${SWAPI_BASE}/planets`);
  if (!response.ok) {
    throw new Error('Failed to load planets from SWAPI.');
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

async function seedPlanets() {
  const count = await Planet.countDocuments();
  if (count > 0) {
    return;
  }

  const swapiPlanets = await fetchAllSwapiPlanets();
  const operations = swapiPlanets
    .map((planet) => {
      const swapiId = extractPlanetId(planet.url);
      if (!swapiId) {
        return null;
      }

      return {
        updateOne: {
          filter: { swapiId },
          update: {
            $setOnInsert: {
              swapiId,
              name: planet.name,
              diameter: planet.diameter,
              terrain: planet.terrain,
              population: planet.population,
              rotation_period: planet.rotation_period,
              orbital_period: planet.orbital_period,
              climate: planet.climate,
              gravity: planet.gravity,
              surface_water: planet.surface_water,
              residents: planet.residents,
              films: planet.films,
            },
          },
          upsert: true,
        },
      };
    })
    .filter(Boolean);

  if (operations.length > 0) {
    await Planet.bulkWrite(operations);
  }
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true });
});

app.get('/api/planets', async (request, response) => {
  try {
    const searchTerm = typeof request.query.search === 'string' ? request.query.search.trim() : '';
    if (isMongoAvailable) {
      const filter = searchTerm ? { name: new RegExp(escapeRegExp(searchTerm), 'i') } : {};
      const planets = await Planet.find(filter).sort({ swapiId: 1 }).lean();
      response.json({ results: planets.map(toPlanetSummary) });
      return;
    }

    // When Mongo is down, reuse SWAPI snapshot loaded at startup.
    const nameMatcher = searchTerm ? new RegExp(escapeRegExp(searchTerm), 'i') : null;
    const planets = fallbackPlanets
      .filter((planet) => (nameMatcher ? nameMatcher.test(planet.name) : true))
      .sort((a, b) => {
        const aId = extractPlanetId(a.url ?? '') ?? Number.MAX_SAFE_INTEGER;
        const bId = extractPlanetId(b.url ?? '') ?? Number.MAX_SAFE_INTEGER;
        return aId - bId;
      });

    response.json({ results: planets.map(toPlanetSummary) });
  } catch (error) {
    response.status(500).json({ message: error instanceof Error ? error.message : 'Failed to load planets.' });
  }
});

app.get('/api/planets/:planetId', async (request, response) => {
  try {
    const planetId = Number(request.params.planetId);
    if (!Number.isInteger(planetId)) {
      response.status(400).json({ message: 'Invalid planet id.' });
      return;
    }

    const planet = isMongoAvailable
      ? await Planet.findOne({ swapiId: planetId }).lean()
      : fallbackPlanets.find((item) => extractPlanetId(item.url ?? '') === planetId);

    if (!planet) {
      response.status(404).json({ message: 'Planet not found.' });
      return;
    }

    response.json(toPlanetSummary(planet));
  } catch (error) {
    response.status(500).json({ message: error instanceof Error ? error.message : 'Failed to load planet details.' });
  }
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Not found.' });
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    await seedPlanets();
    isMongoAvailable = true;
  } catch (error) {
    // Keep the API alive even without local MongoDB.
    isMongoAvailable = false;
    fallbackPlanets = await fetchAllSwapiPlanets();
    console.warn('MongoDB unavailable. Serving planet data directly from SWAPI.');
    if (error instanceof Error) {
      console.warn(error.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});