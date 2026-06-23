# SWAPI Planets Explorer

A React + TypeScript web app for exploring Star Wars planets with a MongoDB-backed backend.

## Features

- Planet list page with name, diameter, terrain, and population
- Search planets by name
- Planet details page
- Full page reload button
- Responsive UI
- Express + MongoDB API with SWAPI seeding on first launch

## Development

Create a `.env` file in the project root with your MongoDB connection string:

```bash
PORT=4000
```

Install dependencies once:

```bash
npm install
```

Start the backend in one terminal:

```bash
npm run server
End poiint= http://localhost:4000/api/planets
```

Start the frontend in another terminal:

```bash
npm run dev
```

## Build

```bash
npm run build
```
