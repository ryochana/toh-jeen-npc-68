import { google } from 'googleapis'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Service Account credentials (จะได้จาก environment variables)
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.GOOGLE_CERT_URL
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = process.env.GOOGLE_SHEET_ID

    const { tables, activityLog } = req.body

    // Clear existing data and add headers
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Tables!A:J'
    })

    // Add headers for Tables sheet
    const tablesHeaders = [['id', 'displayName', 'row', 'col', 'position', 'bookerName', 'phone', 'notes', 'isPaid', 'lastUpdated']]
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Tables!A1:J1',
      valueInputOption: 'RAW',
      resource: { values: tablesHeaders }
    })

    // Add table data
    if (tables && tables.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Tables!A2:J${tables.length + 1}`,
        valueInputOption: 'RAW',
        resource: { values: tables }
      })
    }

    // Update Activity Log
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'ActivityLog!A:C'
    })

    const activityHeaders = [['message', 'timestamp', 'time']]
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'ActivityLog!A1:C1',
      valueInputOption: 'RAW',
      resource: { values: activityHeaders }
    })

    if (activityLog && activityLog.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `ActivityLog!A2:C${activityLog.length + 1}`,
        valueInputOption: 'RAW',
        resource: { values: activityLog }
      })
    }

    res.status(200).json({ 
      success: true, 
      message: 'Data synced to Google Sheets successfully',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error syncing to Google Sheets:', error)
    res.status(500).json({ 
      error: 'Failed to sync to Google Sheets', 
      details: error.message 
    })
  }
}
