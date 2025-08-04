import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export const supabaseService = {
  async getAllTables() {
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

  async upsertTable(record) {
    try {
      const { data, error } = await supabase
        .from('table_bookings')
        .upsert(record)
        .select()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error upserting table:', error)
      throw error
    }
  },

  async deleteTable(tableId) {
    try {
      const { error } = await supabase
        .from('table_bookings')
        .delete()
        .eq('table_id', tableId)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting table:', error)
      throw error
    }
  }
}

export default supabase
