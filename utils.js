import xlsx from "xlsx";

export const loadExcelData = (filePath) => {
  const workbook = xlsx.readFile(filePath);

  // Get the first sheet name
  const sheetName = workbook.SheetNames[0];

  // Get the worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  return xlsx.utils.sheet_to_json(worksheet);
};
