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
    const createTables = () => {
      const newTables = []
      let tableNumber = 1
      
      // 9 แถว ตามที่กำหนด
      for (let row = 1; row <= 9; row++) {
        if (row === 1 || row === 9) {
          // แถว 1 และ 9: 3 โต๊ะ (คอลัมน์ซ้าย)
          for (let col = 1; col <= 3; col++) {
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
        } else {
          // แถว 2-8: 5 โต๊ะ (3 ซ้าย + 2 ขวา)
          for (let col = 1; col <= 5; col++) {
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
      }
      
      setTables(newTables)
      toast.success(`✅ สร้างโต๊ะ ${newTables.length} โต๊ะสำเร็จ`)
    }
    
    createTables()
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
      await supabaseService.upsertTable(selectedTable.id, {
        ...selectedTable,
        booking: bookingData
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
      await supabaseService.upsertTable(selectedTable.id, {
        ...selectedTable,
        booking: null
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🏛️ ระบบจองโต๊ะงานบุญ
          </h1>
          <p className="text-xl text-gray-600 mb-6">งานผ้าป่าวัดบ้านโนนปากชี</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 text-sm mb-6">
            <div className="bg-green-100 px-4 py-2 rounded-full">
              <span className="font-medium text-green-800">🟢 ว่าง: {tables.filter(t => !t.booking).length}</span>
            </div>
            <div className="bg-red-100 px-4 py-2 rounded-full">
              <span className="font-medium text-red-800">🔴 จองแล้ว: {tables.filter(t => t.booking).length}</span>
            </div>
            <div className="bg-blue-100 px-4 py-2 rounded-full">
              <span className="font-medium text-blue-800">📊 ทั้งหมด: {tables.length}</span>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg"
          >
            📊 ส่งออก Excel
          </button>
        </div>
      </div>

      {/* เวที */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white text-center py-8 rounded-2xl shadow-2xl">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-3xl font-bold mb-2">เวทีแสดง</h2>
          <p className="text-lg opacity-90">Stage Area</p>
        </div>
      </div>

      {/* โต๊ะ 9 แถว */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            🪑 โต๊ะในหอประชุม (9 แถว, 37 โต๊ะ)
          </h2>
          
          <div className="space-y-6">
            {Array.from({ length: 9 }, (_, rowIndex) => {
              const row = rowIndex + 1
              const rowTables = tables.filter(table => table.row === row)
              
              return (
                <div key={row} className="bg-gray-50/50 rounded-xl p-6">
                  <div className="text-center font-bold mb-4 text-gray-700">
                    🏛️ แถวที่ {row} ({rowTables.length} โต๊ะ)
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="grid gap-4" style={{
                      gridTemplateColumns: row === 1 || row === 9 
                        ? 'repeat(3, 1fr)' 
                        : 'repeat(3, 1fr) 60px repeat(2, 1fr)'
                    }}>
                      {/* โต๊ะซ้าย 3 โต๊ะ */}
                      {rowTables.filter(t => t.col <= 3).map((table) => (
                        <button
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          className={`
                            p-4 rounded-xl border-2 text-center min-h-[100px] flex flex-col justify-center
                            transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                            ${table.booking 
                              ? 'bg-gradient-to-br from-red-400 to-pink-500 border-red-300 text-white shadow-lg shadow-red-200' 
                              : 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 text-white shadow-lg shadow-green-200'
                            }
                            hover:shadow-2xl cursor-pointer font-bold
                          `}
                        >
                          <div className="text-lg mb-2">{table.displayName}</div>
                          <div className="text-sm">
                            {table.booking ? (
                              <>
                                <div>📝 {table.booking.name}</div>
                                {table.booking.phone && (
                                  <div className="text-xs mt-1 opacity-80">📞 {table.booking.phone}</div>
                                )}
                              </>
                            ) : (
                              <div>✨ ว่าง</div>
                            )}
                          </div>
                        </button>
                      ))}
                      
                      {/* ทางเดิน (เฉพาะแถว 2-8) */}
                      {row !== 1 && row !== 9 && (
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-1 h-16 bg-gradient-to-b from-blue-300 to-indigo-300 rounded-full"></div>
                          <span className="text-xs text-gray-600 font-bold mt-2">ทางเดิน</span>
                        </div>
                      )}
                      
                      {/* โต๊ะขวา 2 โต๊ะ (เฉพาะแถว 2-8) */}
                      {row !== 1 && row !== 9 && rowTables.filter(t => t.col > 3).map((table) => (
                        <button
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          className={`
                            p-4 rounded-xl border-2 text-center min-h-[100px] flex flex-col justify-center
                            transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                            ${table.booking 
                              ? 'bg-gradient-to-br from-red-400 to-pink-500 border-red-300 text-white shadow-lg shadow-red-200' 
                              : 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 text-white shadow-lg shadow-green-200'
                            }
                            hover:shadow-2xl cursor-pointer font-bold
                          `}
                        >
                          <div className="text-lg mb-2">{table.displayName}</div>
                          <div className="text-sm">
                            {table.booking ? (
                              <>
                                <div>📝 {table.booking.name}</div>
                                {table.booking.phone && (
                                  <div className="text-xs mt-1 opacity-80">📞 {table.booking.phone}</div>
                                )}
                              </>
                            ) : (
                              <div>✨ ว่าง</div>
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

      {/* Modal */}
      {showModal && selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl w-full max-w-md shadow-2xl border border-white/30">
            {/* Modal Header */}
            <div className={`p-6 rounded-t-3xl text-white text-center ${
              selectedTable.booking 
                ? 'bg-gradient-to-r from-red-500 to-pink-600' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600'
            }`}>
              <div className="text-4xl mb-2">
                {selectedTable.booking ? '✏️' : '📝'}
              </div>
              <h3 className="text-xl font-bold">
                {selectedTable.booking ? 'แก้ไขการจอง' : 'จองโต๊ะใหม่'}
              </h3>
              <p className="text-lg opacity-90 mt-1">{selectedTable.displayName}</p>
              <p className="text-sm opacity-75">แถวที่ {selectedTable.row} คอลัมน์ที่ {selectedTable.col}</p>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 ชื่อผู้จอง *
                </label>
                <input
                  type="text"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                  placeholder="กรอกชื่อผู้จอง"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                  placeholder="กรอกเบอร์โทรศัพท์"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 สถานะการจ่าย
                </label>
                <select
                  value={bookingData.status}
                  onChange={(e) => setBookingData({ ...bookingData, status: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                >
                  <option value="confirmed">จองแล้ว</option>
                  <option value="paid">จ่ายแล้ว</option>
                </select>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3">
              {selectedTable.booking && (
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  🗑️ ยกเลิก
                </button>
              )}
              
              <button
                onClick={handleBooking}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
              >
                ✅ {selectedTable.booking ? 'อัพเดท' : 'จองโต๊ะ'}
              </button>
              
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 font-semibold shadow-lg"
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
