import fs from "fs";
import fetch from "node-fetch";
import {
  loadExcelData,
  geoJSONData,
  excelCityWebsitesAccessibility,
  WIKIPEDIA_API_URL,
} from "./utils.js";

const getWikidataId = async (city) => {
  const queryParams = new URLSearchParams({
    action: "query",
    titles: city,
    prop: "pageprops",
    format: "json",
  });

  const url = `${WIKIPEDIA_API_URL}?${queryParams.toString()}`;

  const res = await fetch(url);
  const data = await res.json();

  const page = Object.values(data.query.pages)[0];
  return page?.pageprops?.wikibase_item ?? null;
};

// Step 2: Get coordinates from Wikidata
const getCoordinates = async (wikidataId) => {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;

  const res = await fetch(url);
  const data = await res.json();

  const entity = data.entities[wikidataId];
  const coords = entity.claims.P625[0].mainsnak.datavalue.value;

  return {
    lat: coords.latitude,
    lon: coords.longitude,
  };
};

const createGeoJSON = (coords, outputPath) => {
  const geojson = {
    type: "FeatureCollection",
    features: coords.map(({ name, accessibility, lat, lon }) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lon, lat], // GeoJSON uses [lon, lat]
      },
      properties: {
        name,
        accessibility,
      },
    })),
  };

  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
  console.log(`GeoJSON file created at ${outputPath}`);
};

const processCities = async (data) => {
  const coordinates = [];
  const bosniaSuffix = ", Bosnia and Herzegovina";
  for (const row of data) {
    try {
      let city = row.city;

      console.log(`Processing city: ${city}`);

      const wikidataId = await getWikidataId(city);
      console.log(`Wikidata ID for ${city}: ${wikidataId}`);

      const coords = await getCoordinates(wikidataId);
      console.log(`${city} coordinates:`, coords);

      // Clean up city name for Bosnia and Herzegovina
      if (city.endsWith(bosniaSuffix)) {
        city = city.slice(0, -bosniaSuffix.length);
      }

      coordinates.push({
        name: city,
        accessibility: Math.round(row.accessibility),
        lat: coords.lat,
        lon: coords.lon,
      });
    } catch (error) {
      console.error(`Error processing city ${row.city}:`, error);
    }
  }

  return coordinates;
};

// Main execution
async function main() {
  const data = loadExcelData(excelCityWebsitesAccessibility);
  const coordinates = await processCities(data);
  createGeoJSON(coordinates, geoJSONData);
}

main().catch((error) => {
  console.error("Error in main execution:", error);
});
