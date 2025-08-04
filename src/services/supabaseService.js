// Supabase Configuration
// กรุณาเพิ่ม environment variables ในไฟล์ .env.local:
// VITE_SUPABASE_URL=your_supabase_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions สำหรับจัดการข้อมูลโต๊ะ
export const supabaseService = {
  // ดึงข้อมูลโต๊ะทั้งหมด
  async getTables() {
    try {
      const { data, error } = await supabase
        .from('table_bookings')
        .select('*')
        .order('table_id')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tables:', error)
      return []
    }
  },

  // บันทึกหรือแก้ไขข้อมูลโต๊ะ
  async upsertTable(tableData) {
    try {
      const { data, error } = await supabase
        .from('table_bookings')
        .upsert(tableData)
        .select()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error upserting table:', error)
      throw error
    }
  },

  // ลบข้อมูลโต๊ะ
  async deleteTable(tableId) {
    try {
      const { error } = await supabase
        .from('table_bookings')
        .delete()
        .eq('table_id', tableId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting table:', error)
      throw error
    }
  },

  // บันทึก activity log
  async addActivityLog(action, tableId = null, details = null) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          action,
          table_id: tableId,
          details
        })
        .select()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding activity log:', error)
      // ไม่ throw error เพราะ log ไม่ใช่ส่วนสำคัญ
      return null
    }
  },

  // ดึง activity logs
  async getActivityLogs(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      return []
    }
  },

  // sync ข้อมูลจาก localStorage ไป Supabase
  async syncFromLocalStorage(localData) {
    try {
      const { tables = [], outsideTables = [] } = localData
      const allTables = [...tables, ...outsideTables]
      
      // แปลงข้อมูลให้เข้ากับ schema ของ Supabase
      const supabaseData = allTables.map(table => ({
        table_id: table.id,
        table_display_name: table.displayName,
        table_row: table.row || null,
        table_col: table.col || null,
        table_position: table.position || 'inside',
        booking_name: table.booking?.name || null,
        booking_phone: table.booking?.phone || null,
        booking_status: table.booking?.status || null,
        is_booked: !!table.booking,
        booked_at: table.booking?.bookedAt || null,
        updated_at: table.booking?.updatedAt || null
      }))

      // ลบข้อมูลเก่าทั้งหมดก่อน
      await supabase.from('table_bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      // เพิ่มข้อมูลใหม่
      if (supabaseData.length > 0) {
        const { error } = await supabase
          .from('table_bookings')
          .insert(supabaseData)
        
        if (error) throw error
      }

      await this.addActivityLog('🔄 Sync ข้อมูลจาก localStorage ไป Supabase สำเร็จ')
      return true
    } catch (error) {
      console.error('Error syncing to Supabase:', error)
      throw error
    }
  },

  // ดึงข้อมูลจาก Supabase แล้วแปลงเป็นรูปแบบที่ localStorage ใช้
  async syncToLocalStorage() {
    try {
      const supabaseData = await this.getTables()
      
      const tables = []
      const outsideTables = []
      
      supabaseData.forEach(item => {
        const table = {
          id: item.table_id,
          displayName: item.table_display_name,
          row: item.table_row,
          col: item.table_col,
          position: item.table_position,
          booking: item.is_booked ? {
            name: item.booking_name,
            phone: item.booking_phone,
            status: item.booking_status,
            bookedAt: item.booked_at,
            updatedAt: item.updated_at
          } : null
        }
        
        if (item.table_position === 'outside') {
          outsideTables.push(table)
        } else {
          tables.push(table)
        }
      })
      
      return { tables, outsideTables }
    } catch (error) {
      console.error('Error syncing from Supabase:', error)
      throw error
    }
  }
}
