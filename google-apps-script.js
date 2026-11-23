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

// Headers configuration for the Google Sheet
const HEADERS = [
  "Timestamp",
  "Name",
  "Category",
  "Query",
  "Typing Time",
  "Assigned By"
];

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
      sheet.setColumnWidth(i, i === 4 ? 300 : 160); // wider for Query
    }
  }
  
  return sheet;
}

/**
 * Handles HTTP GET requests
 * - Used to fetch all live records for dashboard & table
 * - Supports action=ping for connection testing
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
        message: "Google Sheets Web App is connected and live!",
        sheetName: sheet.getName(),
        rowCount: Math.max(0, sheet.getLastRow() - 1),
        serverTime: new Date().toISOString()
      };
      return createOutput(response, callback);
    }

    // Default action: read all records
    const lastRow = sheet.getLastRow();
    const records = [];

    if (lastRow > 1) {
      // Read rows starting from row 2 (skipping header)
      const dataRange = sheet.getRange(2, 1, lastRow - 1, HEADERS.length);
      const values = dataRange.getValues();

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
          category: String(row[2] || "").trim(),
          query: String(row[3] || "").trim(),
          typingTime: String(row[4] || "").trim(),
          assignedBy: String(row[5] || "").trim()
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
    const sheet = getOrCreateSheet();
    let data = {};

    // Parse incoming data (JSON or Form URL Encoded)
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback to parameter parsing
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    const name = String(data.name || "").trim();
    const category = String(data.category || "").trim();
    const query = String(data.query || "").trim();
    const typingTime = String(data.typingTime || "").trim();
    const assignedBy = String(data.assignedBy || "").trim();

    if (!name) {
      return createOutput({
        status: "error",
        message: "Name field is required."
      });
    }

    // Format current timestamp
    const now = new Date();
    const timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    // Prepare row matching HEADERS order:
    // [Timestamp, Name, Category, Query, Typing Time, Assigned By]
    const newRow = [
      timestampStr,
      name,
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
        category: category,
        query: query,
        typingTime: typingTime,
        assignedBy: assignedBy
      }
    };

    return createOutput(response);

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
        category: "Diamond Member",
        query: "Need access to advanced module recordings and mentorship slot.",
        typingTime: "10:30 AM",
        assignedBy: "Sachin"
      })
    }
  };
  const res = doPost(sample);
  Logger.log(res.getContent());
}
