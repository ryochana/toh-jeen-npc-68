// Google Sheets Service - ทำงานผ่าน API endpoint เท่านั้น
// ไม่ import google-auth-library เพื่อป้องกันปัญหา build ใน browser

class GoogleSheetsService {
  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
    this.initialized = false
    this.apiEndpoint = '/api/sync-sheets'
  }

  async initialize() {
    if (this.initialized) return

    try {
      console.log('🔧 Google Sheets service initialized (API mode)')
      this.initialized = true
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets:', error)
      throw error
    }
  }

  // ฟังก์ชัน sync ข้อมูลไป Google Sheets (ผ่าน API endpoint)
  async syncToSheets(data) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: this.spreadsheetId,
          data: data
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to sync to Google Sheets: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ Synced to Google Sheets successfully')
      return result
    } catch (error) {
      console.error('❌ Error syncing to Google Sheets:', error)
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
      table.booking ? (table.booking.isPaid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย') : '',
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