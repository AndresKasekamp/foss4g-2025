import fs from "fs/promises";
import path from "path";
import xlsx from "xlsx";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { loadExcelData } from "./utils.js";

// Convert JSON data to worksheet
const saveJsonToExcel = (jsonData, outputFilePath) => {
  const worksheet = xlsx.utils.json_to_sheet(jsonData);

  // Create a new workbook and append the worksheet
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write the workbook to a file
  xlsx.writeFile(workbook, outputFilePath);

  console.log(`Excel file created at: ${outputFilePath}`);
};

const deleteTempDirectories = async (basePath) => {
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

// Main execution
async function main() {
  const data = loadExcelData("./FOSS4G_2025.xlsx");
  const updatedData = [];
  
  for (const row of data) {
    console.log(`City: ${row.City}, URL: ${row.URL}`);

    const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

    const options = {
      logLevel: "info",
      output: "json",
      onlyCategories: ["accessibility"],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(row.URL, options);

    const accessibility = runnerResult.lhr.categories.accessibility.score * 100;

    await chrome.kill();
    await deleteTempDirectories(".");

    console.log(`Accessibility on ${row.City}:`, accessibility);

    updatedData.push({
      ...row,
      accessibility,
    });
  }

  saveJsonToExcel(updatedData, `./FOSS4G_2025_accessibility.xlsx`);
}

main().catch((error) => {
  console.error("Error in main execution:", error);
});
