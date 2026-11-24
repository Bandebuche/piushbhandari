/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - STUDENT DATA ENTRY & ANALYTICS BACKEND
 * ============================================================================
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0/edit
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete any code in Code.gs and paste this ENTIRE file
 * 4. Click the Save icon (Ctrl + S)
 * 5. Click "Deploy" (top right) > "Manage deployments"
 * 6. Click the Edit (pencil) icon next to your Active deployment
 * 7. Under "Version", select "New version"
 * 8. Click "Deploy" and "Done"!
 * ============================================================================
 */

// Target Spreadsheet ID
const TARGET_SPREADSHEET_ID = "1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0";
const SHEET_NAME = "SupportData";

// Standard 8-Column Schema
const HEADERS = [
  "Timestamp",
  "Name",
  "Phone",
  "Email",
  "Category",
  "Query",
  "Typing Time",
  "Assigned By"
];

// Clean category normalization (Gold, Diamond, Silver, PMP, Chakravyuh)
function normalizeCategory(cat) {
  var s = String(cat || "").trim();
  if (s === "Diamond Member" || s === "डायमंड" || s.toLowerCase() === "diamond") return "Diamond";
  if (s === "Silver Member" || s === "सिल्वर" || s.toLowerCase() === "silver") return "Silver";
  if (s === "Gold" || s === "गोल्ड" || s.toLowerCase() === "gold") return "Gold";
  if (s === "PMP" || s.toLowerCase() === "pmp" || s === "पीएमपी") return "PMP";
  if (s === "Cyclic" || s === "Chakravyuh" || s === "चक्रव्यूह" || s === "PM Ke Chakravyuh" || s === "पीएम के चक्रव्यूह" || s.toLowerCase().indexOf("chakravyuh") >= 0) return "Chakravyuh";
  return s || "Gold";
}

/**
 * Get or create target sheet and ensure standard 8-column header
 */
function getOrCreateSheet() {
  let ss = null;
  
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    Logger.log("Not in container context: " + err);
  }

  if (!ss || !ss.getId()) {
    try {
      ss = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);
    } catch (err) {
      Logger.log("Error opening by ID: " + err);
    }
  }

  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.getActiveSheet();
    if (sheet.getLastRow() === 0 && sheet.getLastColumn() === 0) {
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  // Ensure headers are present
  if (sheet.getLastRow() === 0) {
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS]);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f766e"); // Teal/green header
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    
    for (let i = 1; i <= HEADERS.length; i++) {
      sheet.setColumnWidth(i, i === 6 ? 280 : 160);
    }
  } else {
    // Check if headers match standard 8 columns
    const curHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 8)).getValues()[0];
    const headerStr = curHeaders.map(function(h) { return String(h).toLowerCase(); }).join(",");
    
    if (headerStr.indexOf("phone") === -1 && headerStr.indexOf("number") === -1) {
      // If previous table had Category in col 3, insert 2 new columns after Name (col 2)
      if (sheet.getLastColumn() >= 3 && headerStr.indexOf("category") !== -1) {
        sheet.insertColumnsAfter(2, 2);
      }
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setValues([HEADERS]);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f766e");
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    } else {
      // Ensure header row styling is clean
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setValues([HEADERS]);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f766e");
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
  }
  
  return sheet;
}

/**
 * Self-healing repair: Fixes any legacy rows where data was shifted into Phone/Email columns
 */
function repairAndNormalizeSheet(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);
  const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
  const values = dataRange.getValues();
  let modified = false;

  const validCategories = [
    "gold", "diamond", "silver", "pmp", "chakravyuh",
    "diamond member", "silver member", "cyclic", "pm ke chakravyuh"
  ];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const colC = String(row[2] || "").trim(); // Col C (Phone)
    const colD = String(row[3] || "").trim(); // Col D (Email)
    const colE = String(row[4] || "").trim(); // Col E (Category)
    const colF = String(row[5] || "").trim(); // Col F (Query)
    const colG = String(row[6] || "").trim(); // Col G (Typing Time)
    const colH = String(row[7] || "").trim(); // Col H (Assigned By)

    const isCatInPhone = validCategories.indexOf(colC.toLowerCase()) !== -1;
    const isDateInCat = colE.indexOf("202") >= 0 || colE.indexOf("GMT") >= 0 || (row[4] instanceof Date);

    // Detect shifted row (old 6-column append):
    if (isCatInPhone && (isDateInCat || !colG || !colH)) {
      const realCat = normalizeCategory(colC);
      const realQuery = colD;
      let realTime = colE;
      if (row[4] instanceof Date) {
        realTime = Utilities.formatDate(row[4], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
      }
      const realAsg = colF || "Sachin";

      values[i][2] = "-";        // Phone
      values[i][3] = "-";        // Email
      values[i][4] = realCat;    // Category
      values[i][5] = realQuery;  // Query
      values[i][6] = realTime;   // Typing Time
      values[i][7] = realAsg;    // Assigned By
      modified = true;
    } else {
      // Normal row: sanitize fields
      if (values[i][4]) {
        values[i][4] = normalizeCategory(values[i][4]);
      }
      if (!values[i][2]) values[i][2] = "-";
      if (!values[i][3]) values[i][3] = "-";
      if (!values[i][7]) values[i][7] = "Sachin";

      if (row[6] instanceof Date) {
        values[i][6] = Utilities.formatDate(row[6], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
        modified = true;
      }
    }
  }

  if (modified) {
    dataRange.setValues(values);
  }
}

/**
 * Shared helper to append a record into Google Sheet
 */
function appendEntry(data, callback) {
  const sheet = getOrCreateSheet();
  repairAndNormalizeSheet(sheet);

  const name = String(data.name || "").trim();
  const phone = String(data.phone || data.number || "-").trim() || "-";
  const email = String(data.email || data.gmail || "-").trim() || "-";
  const category = normalizeCategory(data.category);
  const query = String(data.query || "").trim();
  const typingTime = String(data.typingTime || "").trim();
  const assignedBy = String(data.assignedBy || "Sachin").trim() || "Sachin";

  if (!name) {
    return createOutput({
      status: "error",
      message: "Name field is required."
    }, callback);
  }

  // Format current timestamp
  const now = new Date();
  const timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  // Prepare standard 8-column row:
  // [Timestamp, Name, Phone, Email, Category, Query, Typing Time, Assigned By]
  const newRow = [
    timestampStr,
    name,
    phone,
    email,
    category,
    query,
    typingTime,
    assignedBy
  ];

  sheet.appendRow(newRow);

  const response = {
    status: "success",
    message: "Entry successfully saved to Google Sheet!",
    entry: {
      timestamp: timestampStr,
      name: name,
      phone: phone,
      email: email,
      category: category,
      query: query,
      typingTime: typingTime,
      assignedBy: assignedBy
    }
  };

  return createOutput(response, callback);
}

/**
 * Handles HTTP GET requests
 * - Used to fetch all live records for dashboard & table
 * - Supports action=ping for connection testing
 * - Supports action=create / action=insert for web beacon submissions
 * - Supports action=repair for on-demand sheet healing
 * - Supports JSONP callback parameter if needed
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    repairAndNormalizeSheet(sheet);

    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "read";
    const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;

    if (action === "ping") {
      const response = {
        status: "success",
        message: "Google Sheets Web App is connected and live with Phone and Gmail fields!",
        sheetName: sheet.getName(),
        rowCount: Math.max(0, sheet.getLastRow() - 1),
        serverTime: new Date().toISOString()
      };
      return createOutput(response, callback);
    }

    if (action === "repair") {
      return createOutput({
        status: "success",
        message: "Google Sheet successfully checked and repaired!",
        rowCount: Math.max(0, sheet.getLastRow() - 1)
      }, callback);
    }

    // Support GET-based creation / fallback ping
    if (action === "create" || action === "insert") {
      return appendEntry(e.parameter || {}, callback);
    }

    // Default action: read all records
    const lastRow = sheet.getLastRow();
    const lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);
    const records = [];

    if (lastRow > 1) {
      const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
      const values = dataRange.getValues();
      const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
        return String(h).trim().toLowerCase();
      });

      const phoneIdx = headerRow.indexOf("phone") !== -1 ? headerRow.indexOf("phone") : (headerRow.indexOf("number") !== -1 ? headerRow.indexOf("number") : 2);
      const emailIdx = headerRow.indexOf("email") !== -1 ? headerRow.indexOf("email") : (headerRow.indexOf("gmail") !== -1 ? headerRow.indexOf("gmail") : 3);
      const catIdx = headerRow.indexOf("category") !== -1 ? headerRow.indexOf("category") : 4;
      const queryIdx = headerRow.indexOf("query") !== -1 ? headerRow.indexOf("query") : 5;
      const timeIdx = headerRow.indexOf("typing time") !== -1 ? headerRow.indexOf("typing time") : 6;
      const asgIdx = headerRow.indexOf("assigned by") !== -1 ? headerRow.indexOf("assigned by") : 7;

      for (let i = 0; i < values.length; i++) {
        const row = values[i];
        
        let formattedTimestamp = "";
        if (row[0] instanceof Date) {
          formattedTimestamp = Utilities.formatDate(row[0], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        } else {
          formattedTimestamp = String(row[0] || "");
        }

        let formattedTime = "";
        if (row[timeIdx] instanceof Date) {
          formattedTime = Utilities.formatDate(row[timeIdx], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
        } else {
          formattedTime = String(row[timeIdx] || "").trim();
        }

        records.push({
          id: i + 1,
          timestamp: formattedTimestamp,
          name: String(row[1] || "").trim(),
          phone: String(row[phoneIdx] || "").trim(),
          email: String(row[emailIdx] || "").trim(),
          category: normalizeCategory(row[catIdx]),
          query: String(row[queryIdx] || "").trim(),
          typingTime: formattedTime,
          assignedBy: String(row[asgIdx] || "Sachin").trim() || "Sachin"
        });
      }
    }

    const response = {
      status: "success",
      total: records.length,
      records: records,
      fetchedAt: new Date().toISOString()
    };

    return createOutput(response, callback);

  } catch (error) {
    const errorResponse = {
      status: "error",
      message: error.toString()
    };
    const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;
    return createOutput(errorResponse, callback);
  }
}

/**
 * Handles HTTP POST requests
 * - Appends submitted form data as a new row
 */
function doPost(e) {
  try {
    let data = {};

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    return appendEntry(data);

  } catch (error) {
    return createOutput({
      status: "error",
      message: error.toString()
    });
  }
}

/**
 * Helper to construct JSON or JSONP output with CORS headers
 */
function createOutput(dataObj, callback) {
  const jsonStr = JSON.stringify(dataObj);
  
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + jsonStr + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function you can run directly inside Apps Script editor to auto-repair
 */
function testAppScript() {
  const sheet = getOrCreateSheet();
  repairAndNormalizeSheet(sheet);
  Logger.log("Sheet checked and repaired: " + sheet.getName());
}
