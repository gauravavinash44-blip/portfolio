/**
 * Google Apps Script for "Request access" on the locked case studies.
 *
 * Setup (once):
 *  1. Make a Google Sheet. Extensions > Apps Script. Paste this file.
 *  2. Project Settings > Script properties: add ACCESS_KEY with the same value as ACCESS_KEY in your .env.
 *  3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *  4. Copy the web app URL into .env as ACCESS_ENDPOINT, then run: npm run lock
 *
 * Every request lands as a row in the "Requests" tab. The key is never stored in this file.
 */
function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents || "{}"); } catch (err) { return reply({ ok: false, error: "bad json" }); }

  // Honeypot: real people never fill the hidden "website" field
  if (data.website) return reply({ ok: false, error: "rejected" });

  var clean = function (v, max) { return String(v || "").replace(/\s+/g, " ").trim().slice(0, max || 200); };
  var row = {
    name: clean(data.name, 120), role: clean(data.role, 120), company: clean(data.company, 60),
    contact: clean(data.contact, 200), caseStudy: clean(data.caseStudy, 80), page: clean(data.page, 200),
  };
  if (!row.name || !row.role || !row.company || !row.contact) return reply({ ok: false, error: "missing fields" });

  var sheet = SpreadsheetApp.getActive().getSheetByName("Requests") || SpreadsheetApp.getActive().insertSheet("Requests");
  if (sheet.getLastRow() === 0) sheet.appendRow(["Time", "Name", "Role", "Company", "Email or LinkedIn", "Case study", "Page"]);
  sheet.appendRow([new Date(), row.name, row.role, row.company, row.contact, row.caseStudy, row.page]);

  var key = PropertiesService.getScriptProperties().getProperty("ACCESS_KEY");
  if (!key) return reply({ ok: false, error: "not configured" });
  return reply({ ok: true, key: key, company: row.company });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
