import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { supabaseService } from '../services/supabaseService';

const TableBookingSystem = () => {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [bookingData, setBookingData] = useState({ name: '', phone: '', status: 'confirmed' })

  // สร้างโต๊ะ 37 โต๊ะ ตาม 9 แถว
  useEffect(() => {
    const init = async () => {
      // สร้างโครงสร้าง 9 แถว 37 โต๊ะ
      const newTables = []
      let tableNumber = 1
      for (let row = 1; row <= 9; row++) {
        const cols = row === 1 || row === 9 ? 3 : 5
        for (let col = 1; col <= cols; col++) {
          newTables.push({
            id: tableNumber.toString().padStart(2, '0'),
            displayName: `โต๊ะ ${tableNumber.toString().padStart(2, '0')}`,
            row,
            col,
            booking: null,
            position: 'inside'
          })
          tableNumber++
        }
      }
      // โหลดข้อมูลจาก Supabase
      let saved = []
      try {
        saved = await supabaseService.getAllTables()
      } catch (err) {
        console.error('Load tables error:', err)
      }
      // รวมข้อมูลการจอง
      const merged = newTables.map(table => {
        const rec = saved.find(r => r.table_id === table.id)
        if (rec && rec.is_booked) {
          return { ...table, booking: { name: rec.booking_name, phone: rec.booking_phone, status: rec.booking_status } }
        }
        return table
      })
      setTables(merged)
    }
    init()
  }, [])

  const handleTableClick = (table) => {
    setSelectedTable(table)
    if (table.booking) {
      setBookingData(table.booking)
    } else {
      setBookingData({ name: '', phone: '', status: 'confirmed' })
    }
    setShowModal(true)
  }

  const handleBooking = async () => {
    if (!bookingData.name.trim()) {
      toast.error('กรุณากรอกชื่อผู้จอง')
      return
    }

    const updatedTables = tables.map(table => 
      table.id === selectedTable.id 
        ? { ...table, booking: { ...bookingData } }
        : table
    )
    
    setTables(updatedTables)
    setShowModal(false)
    toast.success(`✅ จองโต๊ะ ${selectedTable.displayName} สำเร็จ`)

    // Save to Supabase
    try {
      await supabaseService.upsertTable({
        table_id: selectedTable.id,
        table_display_name: selectedTable.displayName,
        table_row: selectedTable.row,
        table_col: selectedTable.col,
        table_position: selectedTable.position,
        booking_name: bookingData.name,
        booking_phone: bookingData.phone || null,
        booking_status: bookingData.status,
        is_booked: true,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error saving to Supabase:', error)
    }
  }

  const handleCancelBooking = async () => {
    const updatedTables = tables.map(table => 
      table.id === selectedTable.id 
        ? { ...table, booking: null }
        : table
    )
    
    setTables(updatedTables)
    setShowModal(false)
    toast.success(`✅ ยกเลิกการจองโต๊ะ ${selectedTable.displayName}`)

    // Update Supabase
    try {
      await supabaseService.upsertTable({
        table_id: selectedTable.id,
        booking_name: null,
        booking_phone: null,
        booking_status: null,
        is_booked: false,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating Supabase:', error)
    }
  }

  const exportToExcel = () => {
    const bookedTables = tables.filter(table => table.booking)
    const excelData = bookedTables.map(table => ({
      'หมายเลขโต๊ะ': table.displayName,
      'แถว': table.row,
      'คอลัมน์': table.col,
      'ชื่อผู้จอง': table.booking.name,
      'เบอร์โทรศัพท์': table.booking.phone || '-',
      'สถานะ': table.booking.status === 'confirmed' ? 'จองแล้ว' : 'จ่ายแล้ว'
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'รายการจองโต๊ะ')
    XLSX.writeFile(wb, `รายการจองโต๊ะ_${new Date().toLocaleDateString('th-TH')}.xlsx`)
    toast.success('📊 ส่งออกไฟล์ Excel สำเร็จ')
  }

  return (
    <main className="container mt-4">
      {/* Summary Stats */}
      <section className="panel mb-4">
        <div className="flex justify-center items-center mb-4">
          <div className="mx-2 text-center">
            <div>🟢 ว่าง</div>
            <div>{tables.filter(t => !t.booking).length} โต๊ะ</div>
          </div>
          <div className="mx-2 text-center">
            <div>🔴 จองแล้ว</div>
            <div>{tables.filter(t => t.booking).length} โต๊ะ</div>
          </div>
          <div className="mx-2 text-center">
            <div>📊 รวม</div>
            <div>{tables.length} โต๊ะ</div>
          </div>
        </div>
        <div className="text-center">
          <button onClick={exportToExcel} className="btn">📊 ส่งออกรายงาน Excel</button>
        </div>
      </section>

      {/* Stage */}
      <section className="panel mb-4 text-center">
        <div className="text-6xl mb-4">🎭</div>
        <h2 className="text-center mb-2">เวทีแสดง</h2>
        <p>พื้นที่แสดงและพิธีกรรม</p>
      </section>

      {/* Table Layout */}
      <section className="panel mb-4">
        <div className="text-center mb-4">
          <h2>🪑 โต๊ะในหอประชุม</h2>
          <p>การจัดวาง 9 แถว รวม 37 โต๊ะ</p>
        </div>
        {Array.from({ length: 9 }, (_, rowIndex) => {
          const row = rowIndex + 1
          const rowTables = tables.filter(t => t.row === row)
          return (
            <div key={row} className="mb-4">
              <div className="text-center mb-2 font-bold">🏛️ แถวที่ {row} ({rowTables.length} โต๊ะ)</div>
              <div className="table-grid" style={{ gridTemplateColumns: row === 1 || row === 9 ? 'repeat(3, 1fr)' : 'repeat(3, 1fr) 80px repeat(2, 1fr)' }}>
      {showModal && selectedTable && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="mb-4 text-center">
              <h3 className="font-bold mb-2">
                {selectedTable.booking ? 'แก้ไขการจอง' : 'จองโต๊ะใหม่'}
              </h3>
              <p>ID: {selectedTable.id}</p>
              <p>ชื่อโต๊ะ: {selectedTable.displayName}</p>
            </header>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleBooking();
              }}
            >
              <label>Table ID</label>
              <input type="text" value={selectedTable.id} readOnly />
              <label>Display Name</label>
              <input
                type="text"
                value={selectedTable.displayName}
                readOnly
              />
              <label>Row</label>
              <input type="text" value={selectedTable.row} readOnly />
              <label>Column</label>
              <input type="text" value={selectedTable.col} readOnly />
              <label>Position</label>
              <input type="text" value={selectedTable.position} readOnly />

              <label>👤 ชื่อผู้จอง *</label>
              <input
                type="text"
                value={bookingData.name}
                onChange={e => setBookingData({ ...bookingData, name: e.target.value })}
                required
              />
              <label>📱 เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={bookingData.phone}
                onChange={e => setBookingData({ ...bookingData, phone: e.target.value })}
              />
              <label>💰 สถานะการจ่าย</label>
              <select
                value={bookingData.status}
                onChange={e => setBookingData({ ...bookingData, status: e.target.value })}
              >
                <option value="confirmed">📝 จองแล้ว</option>
                <option value="paid">💰 จ่ายแล้ว</option>
              </select>

              <div className="flex justify-center mt-4">
                {selectedTable.booking && (
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    className="btn mx-2"
                  >
                    🗑️ ยกเลิกการจอง
                  </button>
                )}
                <button type="submit" className="btn mx-2">
                  ✅{' '}
                  {selectedTable.booking ? 'อัพเดทข้อมูล' : 'จองโต๊ะ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn mx-2"
                >
                  ❌ ปิด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
              />

              <label>💰 สถานะการจ่าย</label>
              <select
                value={bookingData.status}
                onChange={e => setBookingData({ ...bookingData, status: e.target.value })}
              >
                <option value="confirmed">📝 จองแล้ว</option>
                <option value="paid">💰 จ่ายแล้ว</option>
              </select>

              <div className="flex justify-center mt-4">
                {selectedTable.booking && (
                  <button type="button" onClick={handleCancelBooking} className="btn mx-2">
                    🗑️ ยกเลิกการจอง
                  </button>
                )}
                <button type="submit" className="btn mx-2">
                  ✅ {selectedTable.booking ? 'อัพเดทข้อมูล' : 'จองโต๊ะ'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn mx-2">
                  ❌ ปิด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default TableBookingSystem
