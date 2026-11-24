/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - STUDENT DATA ENTRY & ANALYTICS BACKEND
 * ============================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete any code in Code.gs and paste this entire file
 * 4. Click "Deploy" (top right) > "New deployment"
 * 5. Select type: "Web app"
 * 6. Set Description: "Student Support Web App"
 * 7. Set "Execute as": "Me" (your email)
 * 8. Set "Who has access": "Anyone" (crucial for form submissions without login)
 * 9. Click "Deploy", authorize permissions when prompted
 * 10. Copy the Web app URL (ends with /exec) and paste it into your application settings!
 * ============================================================================
 */

// Configured Spreadsheet ID from user
const TARGET_SPREADSHEET_ID = "1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0";
const SHEET_NAME = "SupportData";

// Headers configuration for the Google Sheet (Including Phone Number & Gmail)
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
 * Helper to get or create target sheet with proper headers
 */
function getOrCreateSheet() {
  let ss = null;
  
  // 1. Try active container-bound spreadsheet
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    Logger.log("Not in container context: " + err);
  }

  // 2. Fallback to explicit target spreadsheet ID
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
    // If SupportData doesn't exist, check active sheet or create one
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
    
    // Auto resize columns
    for (let i = 1; i <= HEADERS.length; i++) {
      sheet.setColumnWidth(i, i === 6 ? 300 : 160); // wider for Query
    }
  } else {
    // Check if headers need upgrade to include Phone & Email
    const curHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 6)).getValues()[0];
    const headerStr = curHeaders.map(function(h) { return String(h).toLowerCase(); }).join(",");
    if (headerStr.indexOf("phone") === -1 && headerStr.indexOf("number") === -1) {
      // If previous table had Category in column 3, insert 2 new columns after Name (column 2)
      if (sheet.getLastColumn() >= 3 && headerStr.indexOf("category") !== -1) {
        sheet.insertColumnsAfter(2, 2);
      }
      // Upgrade header row to standard 8-column schema
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
 * Shared helper to append a record into Google Sheet
 */
function appendEntry(data, callback) {
  const sheet = getOrCreateSheet();
  const name = String(data.name || "").trim();
  const phone = String(data.phone || data.number || "").trim();
  const email = String(data.email || data.gmail || "").trim();
  const category = normalizeCategory(data.category);
  const query = String(data.query || "").trim();
  const typingTime = String(data.typingTime || "").trim();
  const assignedBy = String(data.assignedBy || "").trim();

  if (!name) {
    return createOutput({
      status: "error",
      message: "Name field is required."
    }, callback);
  }

  // Format current timestamp
  const now = new Date();
  const timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  // Prepare row matching HEADERS order:
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
 * - Supports JSONP callback parameter if needed
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
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

    // Support GET-based creation / fallback ping
    if (action === "create" || action === "insert") {
      return appendEntry(e.parameter || {}, callback);
    }

    // Default action: read all records
    const lastRow = sheet.getLastRow();
    const lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);
    const records = [];

    if (lastRow > 1) {
      // Read rows starting from row 2 (skipping header)
      const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
      const values = dataRange.getValues();
      const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
        return String(h).trim().toLowerCase();
      });

      const hasPhoneCol = headerRow.indexOf("phone") !== -1 || headerRow.indexOf("number") !== -1;
      const phoneIdx = hasPhoneCol ? (headerRow.indexOf("phone") !== -1 ? headerRow.indexOf("phone") : headerRow.indexOf("number")) : 2;
      const emailIdx = headerRow.indexOf("email") !== -1 ? headerRow.indexOf("email") : (headerRow.indexOf("gmail") !== -1 ? headerRow.indexOf("gmail") : 3);
      const catIdx = headerRow.indexOf("category") !== -1 ? headerRow.indexOf("category") : (hasPhoneCol ? 4 : 2);
      const queryIdx = headerRow.indexOf("query") !== -1 ? headerRow.indexOf("query") : (hasPhoneCol ? 5 : 3);
      const timeIdx = headerRow.indexOf("typing time") !== -1 ? headerRow.indexOf("typing time") : (hasPhoneCol ? 6 : 4);
      const asgIdx = headerRow.indexOf("assigned by") !== -1 ? headerRow.indexOf("assigned by") : (hasPhoneCol ? 7 : 5);

      for (let i = 0; i < values.length; i++) {
        const row = values[i];
        
        // Format timestamp safely
        let formattedTimestamp = "";
        if (row[0] instanceof Date) {
          formattedTimestamp = Utilities.formatDate(row[0], Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        } else {
          formattedTimestamp = String(row[0] || "");
        }

        records.push({
          id: i + 1,
          timestamp: formattedTimestamp,
          name: String(row[1] || "").trim(),
          phone: hasPhoneCol ? String(row[phoneIdx] || "").trim() : "",
          email: hasPhoneCol ? String(row[emailIdx] || "").trim() : "",
          category: normalizeCategory(row[catIdx]),
          query: String(row[queryIdx] || "").trim(),
          typingTime: String(row[timeIdx] || "").trim(),
          assignedBy: String(row[asgIdx] || "").trim()
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

    // Parse incoming data (JSON or Form URL Encoded)
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback to parameter parsing
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
    // Return JSONP
    return ContentService.createTextOutput(callback + "(" + jsonStr + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // Return standard JSON
  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function you can run directly inside Apps Script editor
 */
function testAppScript() {
  const sheet = getOrCreateSheet();
  Logger.log("Sheet initialized: " + sheet.getName());
  const sample = {
    postData: {
      contents: JSON.stringify({
        name: "Aarav Sharma",
        phone: "+91 98201 54321",
        email: "aarav.sharma@gmail.com",
        category: "Diamond",
        query: "Need access to advanced module recordings and mentorship slot.",
        typingTime: "10:30 AM",
        assignedBy: "Sachin"
      })
    }
  };
  const res = doPost(sample);
  Logger.log(res.getContent());
}
