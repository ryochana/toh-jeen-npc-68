import { GoogleAuth } from 'google-auth-library'

class GoogleSheetsService {
  constructor() {
    this.auth = null
    this.sheets = null
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return

    try {
      // สำหรับ production จะใช้ service account credentials
      // ส่วนนี้จะต้องใช้ backend API เพราะ credentials ไม่ควรเปิดเผยใน frontend
      
      // สำหรับ demo ใช้ localStorage ก่อน และ sync เป็นระยะ
      console.log('Google Sheets service initialized (demo mode)')
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error)
      throw error
    }
  }

  // ฟังก์ชัน sync ข้อมูลไป Google Sheets (จะเรียกผ่าน API endpoint)
  async syncToSheets(data) {
    try {
      const response = await fetch('/api/sync-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Failed to sync to Google Sheets')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error syncing to Google Sheets:', error)
      // Fallback to localStorage if sheets sync fails
      localStorage.setItem('tableBookings', JSON.stringify(data))
      throw error
    }
  }

  // เตรียมข้อมูลสำหรับ Google Sheets
  prepareTablesData(tables, outsideTables) {
    const allTables = [...tables, ...outsideTables]
    return allTables.map(table => [
      table.id,
      table.displayName,
      table.row,
      table.col,
      table.position,
      table.booking ? table.booking.bookerName : '',
      table.booking ? table.booking.phone : '',
      table.booking ? table.booking.notes : '',
      table.booking ? table.booking.isPaid : false,
      new Date().toLocaleString('th-TH')
    ])
  }

  prepareActivityLogData(activityLog) {
    return activityLog.map(activity => [
      activity.message,
      activity.timestamp,
      activity.time
    ])
  }

  // ฟังก์ชันสำหรับ sync ข้อมูลทั้งหมด
  async syncAllData(tables, outsideTables, activityLog) {
    const data = {
      tables: this.prepareTablesData(tables, outsideTables),
      activityLog: this.prepareActivityLogData(activityLog),
      timestamp: new Date().toISOString()
    }

    return await this.syncToSheets(data)
  }
}

export default new GoogleSheetsService()
