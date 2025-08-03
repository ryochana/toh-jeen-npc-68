// Vercel Serverless Function สำหรับ Google Sheets
import { google } from 'googleapis'

export default async function handler(req, res) {
  // เพิ่ม CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { spreadsheetId, data } = req.body

    if (!spreadsheetId || !data) {
      return res.status(400).json({ error: 'Missing required data' })
    }

    // ตรวจสอบ environment variables
    const requiredEnvs = ['GOOGLE_PROJECT_ID', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_CLIENT_EMAIL']
    for (const env of requiredEnvs) {
      if (!process.env[env]) {
        console.error(`Missing environment variable: ${env}`)
        return res.status(500).json({ error: `Missing configuration: ${env}` })
      }
    }

    // ตั้งค่า Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.GOOGLE_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // เคลียร์และอัปเดตแต่ละแท็บ
    const updates = []

    // Tables tab
    if (data.tables && data.tables.length > 0) {
      // เคลียร์ข้อมูลเก่า
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'Tables!A:Z'
      })

      // เพิ่ม header
      const tablesHeader = [
        ['ID', 'ชื่อโต๊ะ', 'แถว', 'คอลัมน์', 'ตำแหน่ง', 'ผู้จอง', 'เบอร์โทร', 'หมายเหตุ', 'สถานะการจ่าย', 'อัปเดตล่าสุด']
      ]
      
      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Tables!A1:J1',
          valueInputOption: 'USER_ENTERED',
          resource: { values: tablesHeader }
        })
      )

      // เพิ่มข้อมูลโต๊ะ
      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Tables!A2:J${data.tables.length + 1}`,
          valueInputOption: 'USER_ENTERED',
          resource: { values: data.tables }
        })
      )
    }

    // ActivityLog tab
    if (data.activityLog && data.activityLog.length > 0) {
      // เคลียร์ข้อมูลเก่า
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'ActivityLog!A:Z'
      })

      // เพิ่ม header
      const logHeader = [['กิจกรรม', 'วันที่', 'เวลา']]
      
      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'ActivityLog!A1:C1',
          valueInputOption: 'USER_ENTERED',
          resource: { values: logHeader }
        })
      )

      // เพิ่มข้อมูล log
      updates.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `ActivityLog!A2:C${data.activityLog.length + 1}`,
          valueInputOption: 'USER_ENTERED',
          resource: { values: data.activityLog }
        })
      )
    }

    // รอให้การอัปเดตทั้งหมดเสร็จ
    await Promise.all(updates)

    console.log('✅ Successfully synced to Google Sheets')
    return res.status(200).json({ 
      success: true, 
      message: 'Data synced successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error syncing to Google Sheets:', error)
    return res.status(500).json({ 
      error: 'Failed to sync data', 
      details: error.message 
    })
  }
}
