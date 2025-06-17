const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
});

function getISTTimestamp() {
    const date = new Date();
    // IST is UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(date.getTime() + istOffset);
    return istTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

async function appendToSheet(barcode) {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const nowIST = getISTTimestamp();

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:B',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[barcode, nowIST]],
        },
    });
}

module.exports = { appendToSheet };
