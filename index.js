const fs = require('fs');
const rawDataJson = require('./reports.json');

function getHeaderName(key, parentKey) {
  let headerName = key;
  if (parentKey) {
    if (Number.isInteger(Number(key))) {
      headerName = `${parentKey}[${key}]`;
    } else {
      headerName = `${parentKey}.${key}`;
    }
  }
  return headerName;
}

function extractKeyValue(i = 0, result = [], keyName, value, parentKey = '') {
  let headerName = getHeaderName(keyName, parentKey);

  let headerIndex = result.findIndex((r) => r.header === headerName);
  if (headerIndex === -1 && typeof value !== 'object') {
    result.push({ header: headerName, rows: [] });
    headerIndex = result.findIndex((r) => r.header === headerName);
  }

  if (typeof value === 'object') {
    const list = Object.entries(value);
    for (const [key, value] of list) {
      extractKeyValue(i, result, key, value, headerName);
    }
  } else {
    result[headerIndex].rows[i] = value;
  }
}

function parseDataToCSV(data) {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    const list = Object.entries(data[i]);
    for (const [key, value] of list) {
      extractKeyValue(i, result, key, value);
    }
  }

  return result;
}

function generateCSVFromData(result, csvLines) {
  const headers = result.map(({ header }) => header);
  const rows = result.map(({ rows }) => rows);

  let csv = [];
  csv.push(headers.join(','));

  for (let i = 0; i < csvLines; i++) {
    for (let x = 0; x < headers.length; x++) {
      csv[i + 1] = csv[i + 1] || [];
      csv[i + 1].push(rows[x][i]);
    }
    csv[i + 1] = csv[i + 1].join(',');
  }

  return csv.join('\n');
}

function saveCSV(csvData) {
  const fileName = `reports_${Date.now()}.csv`;
  fs.writeFile(fileName, String(csvData), (err) => {
    if (err) throw new Error();
    console.log('Report generated and saved');
  });
}

function main() {
  const csvData = parseDataToCSV(rawDataJson);
  const csv = generateCSVFromData(csvData, rawDataJson.length);
  saveCSV(csv);
}

main();
