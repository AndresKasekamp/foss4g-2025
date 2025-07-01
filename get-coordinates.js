import fetch from "node-fetch";
import xlsx from "xlsx";
import fs from "fs";

const loadExcelData = (filePath) => {
  const workbook = xlsx.readFile(filePath);

  // Get the first sheet name
  const sheetName = workbook.SheetNames[0];

  // Get the worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  return xlsx.utils.sheet_to_json(worksheet);
};

// Step 1: Get Wikidata entity ID from Wikipedia
async function getWikidataId(city) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    city
  )}&prop=pageprops&format=json`;

  const res = await fetch(url);
  const data = await res.json();

  const page = Object.values(data.query.pages)[0];
  return page.pageprops.wikibase_item;
}

// Step 2: Get coordinates from Wikidata
async function getCoordinates(wikidataId) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;

  const res = await fetch(url);
  const data = await res.json();

  const entity = data.entities[wikidataId];
  const coords = entity.claims.P625[0].mainsnak.datavalue.value;

  return {
    lat: coords.latitude,
    lon: coords.longitude,
  };
}

function createGeoJSON(coords, outputPath) {
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
}

async function processCities(data) {
  const coordinates = [];
  const coordinatesMissing = ["Prnjavor", "Gračanica", "Gradiška"]; // NOTE: Quick workaround for missing coordinates

  for (const row of data) {
    try {
      let city = row.City;
      if (coordinatesMissing.includes(city)) {
        city += ", Bosnia and Herzegovina";
      }
      console.log(`Processing city: ${city}`);

      const wikidataId = await getWikidataId(city);
      console.log(`Wikidata ID for ${city}: ${wikidataId}`);

      const coords = await getCoordinates(wikidataId);
      console.log(`${city} coordinates:`, coords);

      coordinates.push({
        name: row.City,
        accessibility: Math.round(row.accessibility),
        lat: coords.lat,
        lon: coords.lon,
      });
    } catch (error) {
      console.error(`Error processing city ${row.City}:`, error);
    }
  }

  return coordinates;
}

// Main execution
async function main() {
  const data = loadExcelData("./FOSS4G_2025_accessibility.xlsx");
  const coordinates = await processCities(data);
  createGeoJSON(coordinates, "./bosniaCities.geojson");
}

main().catch((error) => {
  console.error("Error in main execution:", error);
});
