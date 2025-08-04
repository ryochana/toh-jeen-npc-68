import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { supabaseService } from '../services/supabaseService'

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
          const cols = row === 1 || row === 9 ? 3 : 5
          return (
            <div key={row} className="mb-4">
              <div className="text-center mb-2 font-bold">🏛️ แถวที่ {row} ({rowTables.length} โต๊ะ)</div>
              <div className="table-grid" style={{ gridTemplateColumns: row === 1 || row === 9 ? 'repeat(3, 1fr)' : 'repeat(3, 1fr) 80px repeat(2, 1fr)' }}>
                {rowTables.map(table => (
                  <div
                    key={table.id}
                    className={`table-cell ${table.booking ? 'status-booked' : 'status-available'}`}
                    onClick={() => handleTableClick(table)}
                  >
                    <div className="mb-2">🪑</div>
                    <div className="font-bold mb-1">{table.displayName}</div>
                    {table.booking ? (
                      <>
                        <div>👤 {table.booking.name}</div>
                        {table.booking.phone && <div>📞 {table.booking.phone}</div>}
                        <div>{table.booking.status === 'paid' ? '💰 จ่ายแล้ว' : '📝 จองแล้ว'}</div>
                      </>
                    ) : (
                      <div>✨ ว่าง</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* Booking Modal */}
      {showModal && selectedTable && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="mb-4 text-center">
              <h3 className="font-bold mb-2">{selectedTable.booking ? 'แก้ไขการจอง' : 'จองโต๊ะใหม่'}</h3>
              <p>ID: {selectedTable.id}</p>
              <p>ชื่อโต๊ะ: {selectedTable.displayName}</p>
            </header>
            <form onSubmit={e => { e.preventDefault(); handleBooking(); }}>
              <label>Table ID</label>
              <input type="text" value={selectedTable.id} readOnly />
              <label>Display Name</label>
              <input type="text" value={selectedTable.displayName} readOnly />
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
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-amber-200 p-8 text-center">
          <div className="text-6xl mb-4">🏮</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            ระบบจองโต๊ะจีน
          </h1>
          <p className="text-2xl text-gray-700 mb-2 font-semibold">โรงเรียนบ้านโนนผักชี</p>
          <p className="text-lg text-gray-600 mb-6">งานบุญประจำปี 🙏</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 text-lg mb-8">
            <div className="bg-green-100 border-2 border-green-300 px-6 py-3 rounded-2xl">
              <span className="font-bold text-green-800">🟢 ว่าง: {tables.filter(t => !t.booking).length} โต๊ะ</span>
            </div>
            <div className="bg-red-100 border-2 border-red-300 px-6 py-3 rounded-2xl">
              <span className="font-bold text-red-800">🔴 จองแล้ว: {tables.filter(t => t.booking).length} โต๊ะ</span>
            </div>
            <div className="bg-blue-100 border-2 border-blue-300 px-6 py-3 rounded-2xl">
              <span className="font-bold text-blue-800">📊 รวม: {tables.length} โต๊ะ</span>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            📊 ส่งออกรายงาน Excel
          </button>
        </div>
      </div>

      {/* เวที */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-center py-12 rounded-3xl shadow-2xl border-4 border-yellow-300">
          <div className="text-8xl mb-6">🎭</div>
          <h2 className="text-4xl font-bold mb-4">เวทีแสดง</h2>
          <p className="text-xl opacity-90">พื้นที่แสดงและพิธีกรรม</p>
        </div>
      </div>

      {/* โต๊ะ 9 แถว */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-amber-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🪑 โต๊ะในหอประชุม
            </h2>
            <p className="text-lg text-gray-600">การจัดวาง 9 แถว รวม 37 โต๊ะ</p>
          </div>
          
          <div className="space-y-8">
            {Array.from({ length: 9 }, (_, rowIndex) => {
              const row = rowIndex + 1
              const rowTables = tables.filter(table => table.row === row)
              
              return (
                <div key={row} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                  <div className="text-center font-bold mb-6 text-gray-800 text-xl">
                    🏛️ แถวที่ {row} ({rowTables.length} โต๊ะ)
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="grid gap-6" style={{
                      gridTemplateColumns: row === 1 || row === 9 
                        ? 'repeat(3, 1fr)' 
                        : 'repeat(3, 1fr) 80px repeat(2, 1fr)'
                    }}>
                      {/* โต๊ะซ้าย 3 โต๊ะ */}
                      {rowTables.filter(t => t.col <= 3).map((table) => (
                        <button
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          className={`
                            p-6 rounded-2xl border-3 text-center min-h-[140px] flex flex-col justify-center
                            transition-all duration-300 transform hover:scale-110 hover:-translate-y-2
                            ${table.booking 
                              ? 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 border-red-400 text-white shadow-lg shadow-red-300' 
                              : 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 border-green-400 text-white shadow-lg shadow-green-300'
                            }
                            hover:shadow-2xl cursor-pointer font-bold text-lg
                          `}
                        >
                          <div className="text-2xl mb-3">🪑</div>
                          <div className="text-xl mb-2">{table.displayName}</div>
                          <div className="text-sm">
                            {table.booking ? (
                              <>
                                <div className="font-bold">👤 {table.booking.name}</div>
                                {table.booking.phone && (
                                  <div className="text-xs mt-1 opacity-90">📞 {table.booking.phone}</div>
                                )}
                                <div className="text-xs mt-1 opacity-90">
                                  {table.booking.status === 'paid' ? '💰 จ่ายแล้ว' : '📝 จองแล้ว'}
                                </div>
                              </>
                            ) : (
                              <div className="font-bold">✨ ว่าง</div>
                            )}
                          </div>
                        </button>
                      ))}
                      
                      {/* ทางเดิน (เฉพาะแถว 2-8) */}
                      {row !== 1 && row !== 9 && (
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-2 h-24 bg-gradient-to-b from-amber-300 via-orange-400 to-red-400 rounded-full shadow-lg"></div>
                          <span className="text-sm text-gray-700 font-bold mt-3 px-3 py-1 bg-white rounded-full shadow">ทางเดิน</span>
                        </div>
                      )}
                      
                      {/* โต๊ะขวา 2 โต๊ะ (เฉพาะแถว 2-8) */}
                      {row !== 1 && row !== 9 && rowTables.filter(t => t.col > 3).map((table) => (
                        <button
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          className={`
                            p-6 rounded-2xl border-3 text-center min-h-[140px] flex flex-col justify-center
                            transition-all duration-300 transform hover:scale-110 hover:-translate-y-2
                            ${table.booking 
                              ? 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 border-red-400 text-white shadow-lg shadow-red-300' 
                              : 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 border-green-400 text-white shadow-lg shadow-green-300'
                            }
                            hover:shadow-2xl cursor-pointer font-bold text-lg
                          `}
                        >
                          <div className="text-2xl mb-3">🪑</div>
                          <div className="text-xl mb-2">{table.displayName}</div>
                          <div className="text-sm">
                            {table.booking ? (
                              <>
                                <div className="font-bold">👤 {table.booking.name}</div>
                                {table.booking.phone && (
                                  <div className="text-xs mt-1 opacity-90">📞 {table.booking.phone}</div>
                                )}
                                <div className="text-xs mt-1 opacity-90">
                                  {table.booking.status === 'paid' ? '💰 จ่ายแล้ว' : '📝 จองแล้ว'}
                                </div>
                              </>
                            ) : (
                              <div className="font-bold">✨ ว่าง</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal ป๊อปอัพ */}
      {showModal && selectedTable && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl w-full max-w-lg shadow-2xl border-4 border-amber-200 transform animate-scaleIn">
            {/* Modal Header */}
            <div className={`p-8 rounded-t-3xl text-white text-center ${
              selectedTable.booking 
                ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700' 
                : 'bg-gradient-to-r from-green-500 via-green-600 to-green-700'
            }`}>
              <div className="text-6xl mb-4">
                {selectedTable.booking ? '✏️' : '🪑'}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {selectedTable.booking ? 'แก้ไขการจอง' : 'จองโต๊ะใหม่'}
              </h3>
              <p className="text-xl opacity-90 mb-1">{selectedTable.displayName}</p>
              <p className="text-sm opacity-80">แถวที่ {selectedTable.row} - คอลัมน์ที่ {selectedTable.col}</p>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  👤 ชื่อผู้จอง *
                </label>
                <input
                  type="text"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  className="w-full p-4 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-lg"
                  placeholder="กรอกชื่อผู้จอง"
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  📱 เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  className="w-full p-4 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-lg"
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  💰 สถานะการจ่าย
                </label>
                <select
                  value={bookingData.status}
                  onChange={(e) => setBookingData({ ...bookingData, status: e.target.value })}
                  className="w-full p-4 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-lg"
                >
                  <option value="confirmed">📝 จองแล้ว</option>
                  <option value="paid">💰 จ่ายแล้ว</option>
                </select>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-8 pt-0 flex gap-4">
              {selectedTable.booking && (
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  🗑️ ยกเลิกการจอง
                </button>
              )}
              
              <button
                onClick={handleBooking}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                ✅ {selectedTable.booking ? 'อัพเดทข้อมูล' : 'จองโต๊ะ'}
              </button>
              
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                ❌ ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableBookingSystem
