import xlsx from "xlsx";
import fs from "fs/promises";
import path from "path";

export const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";
export const excelCityWebsites = "city_websites.xlsx";
export const excelCityWebsitesAccessibility =
  "city_websites_accessibility.xlsx";
export const geoJSONData = "bosniaCities.geojson"


export const loadExcelData = (filePath) => {
  const workbook = xlsx.readFile(filePath);

  // Get the first sheet name
  const sheetName = workbook.SheetNames[0];

  // Get the worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  return xlsx.utils.sheet_to_json(worksheet);
};

export const extractWebsiteFromWikitext = (wikitext) => {
  const regex =
    /website\s*=\s*(?:\{\{URL\|([^|}]+)(?:\|[^}]+)?\}\}|\[([^\s\]]+))/i;
  const match = wikitext.match(regex);

  if (match) {
    return match[1];
  }

  return null;
};

export const exportToExcel = (data, filename) => {
  // Create a new workbook and worksheet
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);

  // Append worksheet to workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, "Cities");

  // Write to file
  xlsx.writeFile(workbook, filename);
};

export const deleteTempDirectories = async (basePath) => {
  try {
    const files = await fs.readdir(basePath, { withFileTypes: true });

    for (const file of files) {
      if (file.isDirectory() && file.name.startsWith("C")) {
        const dirPath = path.join(basePath, file.name);
        await fs.rm(dirPath, { recursive: true, force: true });
        console.log(`Deleted: ${dirPath}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
};


export function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
}