import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import {
  loadExcelData,
  exportToExcel,
  excelCityWebsites,
  excelCityWebsitesAccessibility,
  deleteTempDirectories,
  normalizeUrl,
} from "./utils.js";

// Main execution
async function main() {
  const data = loadExcelData(excelCityWebsites);
  const updatedData = [];

  for (const row of data) {
    console.log(`City: ${row.city}, URL: ${row.url}`);

    const url = normalizeUrl(row.url);

    const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

    const options = {
      logLevel: "info",
      output: "json",
      onlyCategories: ["accessibility"],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);
    const accessibility = runnerResult.lhr.categories.accessibility.score * 100;
    await chrome.kill();
    await deleteTempDirectories("."); // May not be necessary, if you are not using WSL

    console.log(`Accessibility on ${row.city}:`, accessibility);

    updatedData.push({
      city: row.city,
      url,
      accessibility,
    });
  }

  exportToExcel(updatedData, excelCityWebsitesAccessibility);
}

main().catch((error) => {
  console.error("Error in main execution:", error);
});
