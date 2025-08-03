import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  Edit, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  ArrowRightLeft,
  MapPin,
  CreditCard,
  RotateCcw,
  Calendar,
  Clock,
  Wifi,
  WifiOff,
  Download,
  Upload
} from 'lucide-react'

// Component สำหรับ Modal
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

const TableBookingSystem = () => {
  // สถานะต่าง ๆ
  const [tables, setTables] = useState([])
  const [outsideTables, setOutsideTables] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [isDragMode, setIsDragMode] = useState(false)
  const [currentBooking, setCurrentBooking] = useState({ name: '', phone: '', status: 'confirmed' })
  const [lastState, setLastState] = useState(null)
  const [canUndo, setCanUndo] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSyncTime, setLastSyncTime] = useState(null)

  // ฟังก์ชันเพิ่มข้อมูลลง Activity Log
  const addToActivityLog = (action) => {
    const newLog = {
      id: Date.now(),
      action,
      timestamp: new Date().toLocaleString('th-TH'),
      user: 'ระบบ'
    }
    setActivityLog(prev => [newLog, ...prev])
  }

  // โหลดข้อมูลจาก Google Sheets โดยตรง
  useEffect(() => {
    const loadDataFromSheets = async () => {
      try {
        console.log('🔄 กำลังโหลดข้อมูลจาก Google Sheets...')
        const response = await fetch('/api/sync-sheets')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📊 ข้อมูลจาก Google Sheets:', data)
        
        if (data && data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
          setTables(data.tables)
          setOutsideTables(data.outsideTables || [])
          setActivityLog(data.activityLog || [])
          console.log('✅ โหลดข้อมูลจาก Google Sheets สำเร็จ:', {
            tables: data.tables?.length || 0,
            outsideTables: data.outsideTables?.length || 0,
            activityLog: data.activityLog?.length || 0
          })
          toast.success('✅ โหลดข้อมูลจาก Google Sheets สำเร็จ')
        } else {
          // สร้างข้อมูลเริ่มต้นถ้าไม่มีข้อมูลใน Google Sheets
          console.log('🎯 สร้างข้อมูลเริ่มต้น')
          const initialTables = []
          let tableNumber = 1
          for (let row = 1; row <= 11; row++) {
            for (let col = 1; col <= 5; col++) {
              initialTables.push({
                id: `${tableNumber.toString().padStart(2, '0')}`,
                displayName: `โต๊ะ ${tableNumber.toString().padStart(2, '0')}`,
                row,
                col,
                booking: null,
                position: 'inside'
              })
              tableNumber++
            }
          }
          setTables(initialTables)
          addToActivityLog('🎯 เริ่มต้นระบบจองโต๊ะ - สร้างโต๊ะเริ่มต้น 55 โต๊ะ')
          
          // บันทึกข้อมูลเริ่มต้นไป Google Sheets
          try {
            await syncToGoogleSheets()
            console.log('✅ บันทึกข้อมูลเริ่มต้นไป Google Sheets สำเร็จ')
          } catch (syncError) {
            console.error('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลเริ่มต้น:', syncError)
          }
        }
      } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:', error)
        toast.error('❌ ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้')
        
        // Fallback: สร้างข้อมูลเริ่มต้น
        const initialTables = []
        let tableNumber = 1
        for (let row = 1; row <= 11; row++) {
          for (let col = 1; col <= 5; col++) {
            initialTables.push({
              id: `${tableNumber.toString().padStart(2, '0')}`,
              displayName: `โต๊ะ ${tableNumber.toString().padStart(2, '0')}`,
              row,
              col,
              booking: null,
              position: 'inside'
            })
            tableNumber++
          }
        }
        setTables(initialTables)
        addToActivityLog('🎯 เริ่มต้นระบบจองโต๊ะ - สร้างโต๊ะเริ่มต้น 55 โต๊ะ (Fallback)')
      }
    }

    loadDataFromSheets()
  }, [])

  // บันทึกข้อมูลไป Google Sheets อัตโนมัติ
  useEffect(() => {
    if (tables.length > 0 || outsideTables.length > 0) {
      console.log('💾 กำลังบันทึกข้อมูลไป Google Sheets:', { 
        tables: tables.length, 
        outsideTables: outsideTables.length, 
        activityLog: activityLog.length,
        timestamp: new Date().toLocaleString('th-TH')
      })
      
      // Auto sync ไป Google Sheets ทุกครั้งที่มีการเปลี่ยนแปลงข้อมูล
      if (isOnline) {
        syncToGoogleSheets()
      }
    }
  }, [tables, outsideTables, activityLog])

  // ตรวจสอบสถานะ online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('📶 กลับมาออนไลน์แล้ว - กำลัง sync ข้อมูล')
      syncToGoogleSheets(true)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.error('📱 ใช้งานแบบออฟไลน์')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [tables, outsideTables, activityLog])

  // ฟังก์ชัน Sync ข้อมูลไป Google Sheets
  const syncToGoogleSheets = async (showNotification = false) => {
    if (!isOnline) {
      console.log('⚠️ ไม่สามารถ sync ได้ - ไม่มีอินเทอร์เน็ต')
      return false
    }

    try {
      const dataToSync = {
        tables,
        outsideTables,
        activityLog
      }
      
      console.log('🔄 กำลัง sync ข้อมูลไป Google Sheets:', {
        tables: tables.length,
        outsideTables: outsideTables.length,
        activityLog: activityLog.length
      })
      
      const response = await fetch('/api/sync-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSync)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to sync: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setLastSyncTime(new Date())
        console.log('✅ Auto sync ไป Google Sheets สำเร็จ')
        if (showNotification) {
          toast.success('📊 Sync ข้อมูลไป Google Sheets สำเร็จ')
        }
        return true
      } else {
        throw new Error(result.error || 'Sync failed')
      }
    } catch (error) {
      console.error('❌ Sync error:', error)
      if (showNotification) {
        toast.error('❌ Sync ข้อมูลล้มเหลว')
      }
      return false
    }
  }

  // ฟังก์ชันบันทึกสถานะสำหรับ Undo
  const saveStateForUndo = (action) => {
    setLastState({
      tables: [...tables],
      outsideTables: [...outsideTables],
      action
    })
    setCanUndo(true)
  }

  // ฟังก์ชัน Undo
  const undoLastAction = () => {
    if (lastState && canUndo) {
      setTables(lastState.tables)
      setOutsideTables(lastState.outsideTables)
      addToActivityLog(`↩️ ยกเลิกการดำเนินการ: ${lastState.action}`)
      setCanUndo(false)
      setLastState(null)
      toast.success('↩️ ยกเลิกการดำเนินการแล้ว')
    }
  }

  const handleTableClick = (table) => {
    if (isDragMode) {
      return
    }
    
    setSelectedTable(table)
    if (table.booking) {
      setCurrentBooking(table.booking)
      setShowEditModal(true)
    } else {
      setCurrentBooking({ name: '', phone: '', status: 'confirmed' })
      setShowBookingModal(true)
    }
  }

  const handleBooking = () => {
    if (!currentBooking.name.trim()) {
      toast.error('กรุณากรอกชื่อผู้จอง')
      return
    }

    saveStateForUndo(`จองโต๊ะ ${selectedTable.displayName}`)
    
    const updatedTables = tables.map(table => 
      table.id === selectedTable.id 
        ? { ...table, booking: { ...currentBooking, bookedAt: new Date().toISOString() } }
        : table
    )
    
    setTables(updatedTables)
    addToActivityLog(`📝 จองโต๊ะ ${selectedTable.displayName} ให้ ${currentBooking.name} (${currentBooking.phone})`)
    
    setShowBookingModal(false)
    setSelectedTable(null)
    setCurrentBooking({ name: '', phone: '', status: 'confirmed' })
    toast.success(`จองโต๊ะ ${selectedTable.displayName} สำเร็จ`)
  }

  const handleUpdateBooking = () => {
    if (!currentBooking.name.trim()) {
      toast.error('กรุณากรอกชื่อผู้จอง')
      return
    }

    saveStateForUndo(`แก้ไขข้อมูลโต๊ะ ${selectedTable.displayName}`)
    
    const updatedTables = tables.map(table => 
      table.id === selectedTable.id 
        ? { ...table, booking: { ...currentBooking, updatedAt: new Date().toISOString() } }
        : table
    )
    
    setTables(updatedTables)
    addToActivityLog(`✏️ แก้ไขข้อมูลโต๊ะ ${selectedTable.displayName} เป็น ${currentBooking.name} (${currentBooking.phone})`)
    
    setShowEditModal(false)
    setSelectedTable(null)
    toast.success('แก้ไขข้อมูลสำเร็จ')
  }

  const handleCancelBooking = () => {
    if (!selectedTable) return

    saveStateForUndo(`ยกเลิกการจองโต๊ะ ${selectedTable.displayName}`)
    
    const updatedTables = tables.map(table => 
      table.id === selectedTable.id 
        ? { ...table, booking: null }
        : table
    )
    
    setTables(updatedTables)
    addToActivityLog(`❌ ยกเลิกการจองโต๊ะ ${selectedTable.displayName}`)
    
    setShowEditModal(false)
    setSelectedTable(null)
    toast.success('ยกเลิกการจองแล้ว')
  }

  const addNewTable = () => {
    saveStateForUndo('เพิ่มโต๊ะใหม่นอกฮอลล์')
    
    const newTableNumber = tables.length + outsideTables.length + 1
    const newTable = {
      id: `outside-${Date.now()}`,
      displayName: `โต๊ะ ${newTableNumber.toString().padStart(2, '0')} (นอกฮอลล์)`,
      booking: null,
      position: 'outside'
    }
    
    setOutsideTables(prev => [...prev, newTable])
    addToActivityLog(`➕ เพิ่มโต๊ะใหม่: ${newTable.displayName}`)
    toast.success('เพิ่มโต๊ะใหม่แล้ว')
  }

  const deleteOutsideTable = (tableId) => {
    const tableToDelete = outsideTables.find(t => t.id === tableId)
    if (!tableToDelete) return

    saveStateForUndo(`ลบโต๊ะ ${tableToDelete.displayName}`)
    
    setOutsideTables(prev => prev.filter(table => table.id !== tableId))
    addToActivityLog(`🗑️ ลบโต๊ะ: ${tableToDelete.displayName}`)
    toast.success('ลบโต๊ะแล้ว')
  }

  const toggleDragMode = () => {
    setIsDragMode(!isDragMode)
    toast.info(isDragMode ? 'ปิดโหมดจัดโต๊ะ' : 'เปิดโหมดจัดโต๊ะ - ลากโต๊ะเพื่อย้าย')
    addToActivityLog(isDragMode ? '🔒 ปิดโหมดจัดโต๊ะ' : '🔓 เปิดโหมดจัดโต๊ะ')
  }

  const moveTable = (tableId, newRow, newCol) => {
    saveStateForUndo('จัดเรียงโต๊ะใหม่')
    
    const updatedTables = tables.map(table => 
      table.id === tableId 
        ? { ...table, row: newRow, col: newCol }
        : table
    )
    
    setTables(updatedTables)
    addToActivityLog(`🔄 ย้ายโต๊ะ ${tableId} ไปตำแหน่งใหม่ (แถว ${newRow}, คอลัมน์ ${newCol})`)
  }

  const restoreAllTables = () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการจองทั้งหมด?')) return

    saveStateForUndo('ยกเลิกการจองทั้งหมด')
    
    const restoredTables = tables.map(table => ({ ...table, booking: null }))
    setTables(restoredTables)
    setOutsideTables([])
    
    addToActivityLog('🔄 ยกเลิกการจองทั้งหมด - รีเซ็ตระบบ')
    toast.success('ยกเลิกการจองทั้งหมดแล้ว')
  }

  const getTablesByPosition = (position, row = null) => {
    if (position === 'outside') {
      return outsideTables
    }
    
    const filteredTables = tables.filter(table => {
      if (row !== null) {
        return table.row === row
      }
      return true
    })
    
    return filteredTables.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row
      return a.col - b.col
    })
  }

  const renderTable = (table) => {
    const isBooked = table.booking !== null
    const isOnline = table.booking?.status === 'online'
    const isConfirmed = table.booking?.status === 'confirmed'
    
    return (
      <div
        key={table.id}
        className={`
          relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center min-h-[100px] flex flex-col justify-center
          ${isBooked 
            ? (isOnline ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-red-100 border-red-400 text-red-800')
            : 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200'
          }
          ${isDragMode && !isBooked ? 'hover:bg-yellow-100 border-yellow-400' : ''}
          hover:shadow-lg transform hover:scale-105
        `}
        onClick={() => handleTableClick(table)}
        draggable={isDragMode && !isBooked}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', table.id)
        }}
      >
        <div className="font-semibold text-sm mb-1">{table.displayName}</div>
        
        {isBooked ? (
          <>
            <div className="flex items-center justify-center mb-1">
              <Users size={16} className="mr-1" />
              <span className="text-xs font-medium truncate">{table.booking.name}</span>
            </div>
            {table.booking.phone && (
              <div className="text-xs text-gray-600 truncate">{table.booking.phone}</div>
            )}
            <div className="flex items-center justify-center mt-1">
              {isOnline ? <CreditCard size={12} /> : <MapPin size={12} />}
              <span className="text-xs ml-1">{isOnline ? 'ออนไลน์' : 'หน้างาน'}</span>
            </div>
          </>
        ) : (
          <div className="text-xs text-green-600 font-medium">ว่าง</div>
        )}
        
        {table.position === 'outside' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteOutsideTable(table.id)
            }}
            className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-white rounded-full p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    )
  }

  const renderDropZone = (row, colRange) => {
    return (
      <div
        className={`
          min-h-[120px] p-2 border-2 border-dashed border-gray-300 rounded-lg
          ${isDragMode ? 'bg-gray-50 hover:bg-gray-100' : 'hidden'}
        `}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const tableId = e.dataTransfer.getData('text/plain')
          const newCol = colRange[0] // ใช้คอลัมน์แรกของช่วงที่กำหนด
          moveTable(tableId, row, newCol)
        }}
      >
        <div className="text-center text-gray-400 text-sm">วางโต๊ะที่นี่</div>
      </div>
    )
  }

  const bookedTablesCount = tables.filter(table => table.booking).length + outsideTables.filter(table => table.booking).length
  const totalTables = tables.length + outsideTables.length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">ระบบจองโต๊ะงานวัดบ้านโนนปากชี</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  {isOnline ? <Wifi size={16} className="mr-1 text-green-500" /> : <WifiOff size={16} className="mr-1 text-red-500" />}
                  {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                </span>
                {lastSyncTime && (
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    Sync ล่าสุด: {lastSyncTime.toLocaleTimeString('th-TH')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-blue-600 font-semibold">
                  จองแล้ว: {bookedTablesCount}/{totalTables} โต๊ะ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={addNewTable}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              เพิ่มโต๊ะนอกฮอลล์
            </button>
            
            <button
              onClick={toggleDragMode}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isDragMode 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              <ArrowRightLeft size={18} className="mr-2" />
              {isDragMode ? 'ปิดโหมดจัดโต๊ะ' : 'จัดโต๊ะ'}
            </button>
            
            <button
              onClick={() => setShowActivityLog(true)}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Calendar size={18} className="mr-2" />
              ดูกิจกรรม ({activityLog.length})
            </button>
            
            {canUndo && (
              <button
                onClick={undoLastAction}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <RotateCcw size={18} className="mr-2" />
                ยกเลิกการดำเนินการ
              </button>
            )}
            
            <button
              onClick={restoreAllTables}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} className="mr-2" />
              รีเซ็ตทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* Tables Layout - 11 แถว x 5 คอลัมน์ (2+3) */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">โต๊ะในฮอลล์ (55 โต๊ะ)</h2>
          
          <div className="space-y-4">
            {Array.from({ length: 11 }, (_, rowIndex) => {
              const row = rowIndex + 1
              const leftTables = getTablesByPosition('inside').filter(table => table.row === row && table.col <= 2)
              const rightTables = getTablesByPosition('inside').filter(table => table.row === row && table.col > 2)
              
              return (
                <div key={row} className="flex items-center gap-4">
                  {/* โต๊ะด้านซ้าย (2 โต๊ะ) */}
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {leftTables.map(renderTable)}
                    {isDragMode && renderDropZone(row, [1, 2])}
                  </div>
                  
                  {/* ทางเดินกลาง */}
                  <div className="w-16 text-center text-sm text-gray-500 font-medium">
                    แถว {row}
                  </div>
                  
                  {/* โต๊ะด้านขวา (3 โต๊ะ) */}
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    {rightTables.map(renderTable)}
                    {isDragMode && renderDropZone(row, [3, 4, 5])}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Outside Tables */}
      {outsideTables.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">โต๊ะนอกฮอลล์ ({outsideTables.length} โต๊ะ)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {outsideTables.map(renderTable)}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Modal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        title={`จองโต๊ะ ${selectedTable?.displayName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้จอง *</label>
            <input
              type="text"
              value={currentBooking.name}
              onChange={(e) => setCurrentBooking({ ...currentBooking, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกชื่อผู้จอง"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={currentBooking.phone}
              onChange={(e) => setCurrentBooking({ ...currentBooking, phone: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการจอง</label>
            <select
              value={currentBooking.status}
              onChange={(e) => setCurrentBooking({ ...currentBooking, status: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="confirmed">จองหน้างาน</option>
              <option value="online">จองออนไลน์</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleBooking}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              <Check size={18} className="inline mr-2" />
              ยืนยันการจอง
            </button>
            <button
              onClick={() => setShowBookingModal(false)}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              <X size={18} className="inline mr-2" />
              ยกเลิก
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title={`แก้ไขข้อมูล ${selectedTable?.displayName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้จอง *</label>
            <input
              type="text"
              value={currentBooking.name}
              onChange={(e) => setCurrentBooking({ ...currentBooking, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกชื่อผู้จอง"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={currentBooking.phone}
              onChange={(e) => setCurrentBooking({ ...currentBooking, phone: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการจอง</label>
            <select
              value={currentBooking.status}
              onChange={(e) => setCurrentBooking({ ...currentBooking, status: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="confirmed">จองหน้างาน</option>
              <option value="online">จองออนไลน์</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpdateBooking}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <Edit size={18} className="inline mr-2" />
              บันทึกการแก้ไข
            </button>
            <button
              onClick={handleCancelBooking}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} className="inline mr-2" />
              ยกเลิกการจอง
            </button>
          </div>
        </div>
      </Modal>

      {/* Activity Log Modal */}
      <Modal 
        isOpen={showActivityLog} 
        onClose={() => setShowActivityLog(false)}
        title="ประวัติการดำเนินการ"
      >
        <div className="max-h-96 overflow-y-auto">
          {activityLog.length === 0 ? (
            <p className="text-gray-500 text-center py-4">ยังไม่มีกิจกรรม</p>
          ) : (
            <div className="space-y-3">
              {activityLog.map((log) => (
                <div key={log.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-800">{log.action}</div>
                  <div className="text-xs text-gray-500 mt-1">{log.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default TableBookingSystem
