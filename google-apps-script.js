/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT FOR PIUSH BHANDARI EXECUTIVE PORTFOLIO INQUIRIES
 * ==============================================================================
 * 
 * Target Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1REqkSTLaEhXApYk4ERMp7KKUWpAaed29EUWwTFgjG70/edit?usp=sharing
 * Spreadsheet ID: 1REqkSTLaEhXApYk4ERMp7KKUWpAaed29EUWwTFgjG70
 * 
 * Columns:
 * 1. Timestamp
 * 2. Name / Organization
 * 3. Email Address
 * 4. Engagement Focus
 * 5. Project Scope or Brief
 * 6. Status
 * 
 * DEPLOYMENT INSTRUCTIONS (Takes ~1 minute):
 * 1. Open the Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1REqkSTLaEhXApYk4ERMp7KKUWpAaed29EUWwTFgjG70/edit
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any default code in the editor, and paste this entire file contents.
 * 4. Click "Save" (Ctrl+S or the disk icon).
 * 5. Click the blue "Deploy" button (top right) -> "New deployment".
 * 6. Click the gear icon next to "Select type" -> choose "Web app".
 * 7. Set:
 *    - Description: "Inquiry Webhook"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (IMPORTANT: so the portfolio form can post without requiring Google login)
 * 8. Click "Deploy".
 * 9. Copy the generated "Web App URL" (ends in /exec).
 * 10. Paste the Web App URL into s:\Anti\piyushbhatiya\app.js at GOOGLE_SHEET_WEBHOOK_URL.
 * ==============================================================================
 */

var SPREADSHEET_ID = "1REqkSTLaEhXApYk4ERMp7KKUWpAaed29EUWwTFgjG70";
var SHEET_NAME = "Sheet1";

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for lock to avoid simultaneous write collisions
    lock.waitLock(30000);

    var ss;
    if (SPREADSHEET_ID && SPREADSHEET_ID !== "") {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Name / Organization",
        "Email Address",
        "Engagement Focus",
        "Project Scope or Brief",
        "Status"
      ]);
      // Format header row
      var headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0C382C");
      headerRange.setFontColor("#FFFFFF");
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var name = data.name || data.Name || data["Name / Organization"] || "Anonymous";
    var email = data.email || data.Email || data["Email Address"] || "";
    var subject = data.subject || data.Subject || data["Engagement Focus"] || "Executive Consultation";
    var message = data.message || data.Message || data["Project Scope or Brief"] || "";
    var timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

    // Append new inquiry row
    sheet.appendRow([
      timestamp,
      name,
      email,
      subject,
      message,
      "New Inquiry"
    ]);

    // Format new row styling
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 6).setVerticalAlignment("middle");

    // Optional email notification to Piush Bhandari
    try {
      MailApp.sendEmail({
        to: "piushbhandari14@gmail.com",
        subject: "New Executive Mandate Inquiry: " + subject + " (" + name + ")",
        body: "You have received a new executive inquiry via your portfolio:\n\n" +
              "Name / Organization: " + name + "\n" +
              "Email: " + email + "\n" +
              "Engagement Focus: " + subject + "\n" +
              "Date: " + timestamp + "\n\n" +
              "Project Scope:\n" + message + "\n\n" +
              "View Google Sheet: https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/edit"
      });
    } catch (mailErr) {
      Logger.log("Email notification skipped: " + mailErr.toString());
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Inquiry successfully recorded in Google Sheet",
        row: lastRow
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "active",
      message: "Piush Bhandari Executive Portfolio Google Sheet Webhook is active.",
      spreadsheet: "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/edit"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
