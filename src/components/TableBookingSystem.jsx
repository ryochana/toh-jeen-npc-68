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
  CreditCard
} from 'lucide-react'
import BookingModal from './BookingModal'
import './TableBookingSystem.css'

const TableBookingSystem = () => {
  const [tables, setTables] = useState([])
  const [outsideTables, setOutsideTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create', 'edit'
  const [isDragMode, setIsDragMode] = useState(false)
  const [draggedTable, setDraggedTable] = useState(null)

  // สร้างโต๊ะเริ่มต้น 10 แถว x 6 โต๊ะ = 60 โต๊ะ (แบ่งเป็น 3+3 คอลัมน์ มีทางเดินตรงกลาง)
  useEffect(() => {
    const savedData = localStorage.getItem('tableBookings')
    if (savedData) {
      const { tables: savedTables, outsideTables: savedOutside } = JSON.parse(savedData)
      setTables(savedTables || [])
      setOutsideTables(savedOutside || [])
    } else {
      // สร้างโต๊ะเริ่มต้น
      const initialTables = []
      let tableNumber = 1
      for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 6; col++) {
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
    }
  }, [])

  // บันทึกข้อมูลลง localStorage
  useEffect(() => {
    if (tables.length > 0 || outsideTables.length > 0) {
      localStorage.setItem('tableBookings', JSON.stringify({ tables, outsideTables }))
    }
  }, [tables, outsideTables])

  const handleTableClick = (table) => {
    if (isDragMode) {
      // โหมดลาก: เลือกโต๊ะที่จะลาก
      if (draggedTable && draggedTable.id === table.id) {
        // ยกเลิกการลาก
        setDraggedTable(null)
        toast.info('ยกเลิกการลากโต๊ะ')
      } else {
        setDraggedTable(table)
        toast.info(`เลือกโต๊ะ ${table.displayName || table.id} สำหรับลาก`)
      }
      return
    }

    // โหมดปกติ: เปิด modal
    if (table.booking) {
      setSelectedTable(table)
      setModalMode('edit')
      setIsModalOpen(true)
    } else {
      setSelectedTable(table)
      setModalMode('create')
      setIsModalOpen(true)
    }
  }

  const handleBookTable = (bookingData) => {
    if (modalMode === 'create') {
      const updatedTables = tables.map(table =>
        table.id === selectedTable.id
          ? { ...table, booking: { ...bookingData, id: Date.now() } }
          : table
      )
      const updatedOutside = outsideTables.map(table =>
        table.id === selectedTable.id
          ? { ...table, booking: { ...bookingData, id: Date.now() } }
          : table
      )
      
      if (selectedTable.position === 'inside') {
        setTables(updatedTables)
      } else {
        setOutsideTables(updatedOutside)
      }
      
      toast.success(`จองโต๊ะ ${selectedTable.id} สำเร็จ`)
    } else {
      const updatedTables = tables.map(table =>
        table.id === selectedTable.id
          ? { ...table, booking: { ...table.booking, ...bookingData } }
          : table
      )
      const updatedOutside = outsideTables.map(table =>
        table.id === selectedTable.id
          ? { ...table, booking: { ...table.booking, ...bookingData } }
          : table
      )
      
      if (selectedTable.position === 'inside') {
        setTables(updatedTables)
      } else {
        setOutsideTables(updatedOutside)
      }
      
      toast.success(`แก้ไขข้อมูลโต๊ะ ${selectedTable.id} สำเร็จ`)
    }
    setIsModalOpen(false)
  }

  const handleDeleteBooking = (tableId) => {
    const updatedTables = tables.map(table =>
      table.id === tableId ? { ...table, booking: null } : table
    )
    const updatedOutside = outsideTables.map(table =>
      table.id === tableId ? { ...table, booking: null } : table
    )
    
    setTables(updatedTables)
    setOutsideTables(updatedOutside)
    toast.success(`ลบการจองโต๊ะ ${tableId} สำเร็จ`)
    setIsModalOpen(false)
  }

  const moveTableOutside = (tableId) => {
    const table = tables.find(t => t.id === tableId)
    if (table) {
      const newOutsideTable = { ...table, position: 'outside' }
      setOutsideTables([...outsideTables, newOutsideTable])
      setTables(tables.filter(t => t.id !== tableId))
      toast.success(`ย้ายโต๊ะ ${tableId} ออกจากหอประชุม`)
    }
  }

  const moveTableInside = (tableId) => {
    const table = outsideTables.find(t => t.id === tableId)
    if (table) {
      const newInsideTable = { ...table, position: 'inside' }
      setTables([...tables, newInsideTable].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row
        return a.col - b.col
      }))
      setOutsideTables(outsideTables.filter(t => t.id !== tableId))
      toast.success(`ย้ายโต๊ะ ${tableId} กลับเข้าหอประชุม`)
    }
  }

  const addNewOutsideTable = () => {
    const newId = `OUT${outsideTables.length + 1}`
    const newTable = {
      id: newId,
      displayName: `นอกหอ ${outsideTables.length + 1}`,
      row: 0,
      col: 0,
      booking: null,
      position: 'outside'
    }
    setOutsideTables([...outsideTables, newTable])
    toast.success(`เพิ่มโต๊ะนอกหอประชุม ${newId}`)
  }

  const addNewTable = () => {
    const allTables = [...tables, ...outsideTables]
    const maxId = Math.max(...allTables.map(t => {
      const num = parseInt(t.id.replace(/[^0-9]/g, ''))
      return isNaN(num) ? 0 : num
    }), 60)
    
    const newId = `${(maxId + 1).toString().padStart(2, '0')}`
    const newTable = {
      id: newId,
      displayName: `โต๊ะ ${newId}`,
      row: Math.ceil((maxId + 1) / 6),
      col: ((maxId) % 6) + 1,
      booking: null,
      position: 'inside'
    }
    
    setTables([...tables, newTable].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row
      return a.col - b.col
    }))
    toast.success(`เพิ่มโต๊ะใหม่ ${newId}`)
  }

  const toggleDragMode = () => {
    setIsDragMode(!isDragMode)
    setDraggedTable(null)
    if (!isDragMode) {
      toast.info('🎯 โหมดลากโต๊ะ: คลิกโต๊ะที่ต้องการลาก แล้วคลิกตำแหน่งที่ต้องการวาง')
    } else {
      toast.info('กลับสู่โหมดปกติ')
    }
  }

  const handleTableDrop = (targetRow, targetCol, targetPosition) => {
    if (!draggedTable) return

    const newTable = {
      ...draggedTable,
      row: targetRow,
      col: targetCol,
      position: targetPosition
    }

    // ลบโต๊ะเดิม
    if (draggedTable.position === 'inside') {
      setTables(tables.filter(t => t.id !== draggedTable.id))
    } else {
      setOutsideTables(outsideTables.filter(t => t.id !== draggedTable.id))
    }

    // เพิ่มโต๊ะในตำแหน่งใหม่
    if (targetPosition === 'inside') {
      setTables([...tables.filter(t => t.id !== draggedTable.id), newTable].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row
        return a.col - b.col
      }))
    } else {
      setOutsideTables([...outsideTables.filter(t => t.id !== draggedTable.id), newTable])
    }

    toast.success(`ย้ายโต๊ะ ${draggedTable.displayName || draggedTable.id} สำเร็จ`)
    setDraggedTable(null)
  }

  const restoreAllTables = () => {
    if (confirm('ต้องการสร้างโต๊ะทั้งหมดคืนหรือไม่? (จะไม่ลบข้อมูลการจองที่มีอยู่)')) {
      const initialTables = []
      let tableNumber = 1
      
      for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 6; col++) {
          const tableId = `${tableNumber.toString().padStart(2, '0')}`
          
          // ตรวจสอบว่ามีโต๊ะนี้อยู่แล้วหรือไม่
          const existingTable = tables.find(t => t.id === tableId) || 
                               outsideTables.find(t => t.id === tableId)
          
          if (!existingTable) {
            initialTables.push({
              id: tableId,
              displayName: `โต๊ะ ${tableId}`,
              row,
              col,
              booking: null,
              position: 'inside'
            })
          }
          tableNumber++
        }
      }
      
      setTables([...tables, ...initialTables].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row
        return a.col - b.col
      }))
      
      toast.success(`สร้างโต๊ะคืน ${initialTables.length} โต๊ะ`)
    }
  }

  const getTableStatusClass = (table) => {
    if (!table.booking) return 'table-available'
    if (table.booking.isPaid) return 'table-paid'
    return 'table-booked'
  }

  const getStatusText = (table) => {
    if (!table.booking) return 'ว่าง'
    if (table.booking.isPaid) return 'จ่ายแล้ว'
    return 'จองแล้ว'
  }

  return (
    <div className="table-booking-system">
      <div className="main-content">
        <div className="hall-container">
          <div className="stage">
            <h3>🎭 เวที</h3>
          </div>
          
          <div className="tables-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(row => (
              <div key={row} className="table-row">
                {/* คอลัมน์ซ้าย 3 โต๊ะ */}
                <div className="table-section left-section">
                  {tables
                    .filter(table => table.row === row && table.col <= 3)
                    .sort((a, b) => a.col - b.col)
                    .map(table => (
                      <div
                        key={table.id}
                        className={`table-item ${getTableStatusClass(table)} ${
                          isDragMode ? 'drag-mode' : ''
                        } ${
                          draggedTable && draggedTable.id === table.id ? 'dragged' : ''
                        }`}
                        onClick={() => handleTableClick(table)}
                        title={`${table.displayName || table.id} - ${getStatusText(table)}`}
                      >
                        <div className="table-number">{table.displayName || table.id}</div>
                        <div className="table-status">{getStatusText(table)}</div>
                        {table.booking && (
                          <div className="booker-name">{table.booking.bookerName}</div>
                        )}
                        {!isDragMode && (
                          <div className="table-actions">
                            <button
                              className="move-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveTableOutside(table.id)
                              }}
                              title="ย้ายออกจากหอประชุม"
                            >
                              <ArrowRightLeft size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  
                  {/* พื้นที่วางโต๊ะในโหมดลาก - ซ้าย */}
                  {isDragMode && draggedTable && [1, 2, 3].map(col => {
                    const hasTable = tables.some(t => t.row === row && t.col === col)
                    if (hasTable) return null
                    return (
                      <div
                        key={`drop-${row}-${col}`}
                        className="drop-zone"
                        onClick={() => handleTableDrop(row, col, 'inside')}
                        title="คลิกเพื่อวางโต๊ะที่นี่"
                      >
                        📍
                      </div>
                    )
                  })}
                </div>

                {/* ทางเดินตรงกลาง */}
                <div className="aisle">
                  <div className="aisle-line"></div>
                </div>

                {/* คอลัมน์ขวา 3 โต๊ะ */}
                <div className="table-section right-section">
                  {tables
                    .filter(table => table.row === row && table.col > 3)
                    .sort((a, b) => a.col - b.col)
                    .map(table => (
                      <div
                        key={table.id}
                        className={`table-item ${getTableStatusClass(table)} ${
                          isDragMode ? 'drag-mode' : ''
                        } ${
                          draggedTable && draggedTable.id === table.id ? 'dragged' : ''
                        }`}
                        onClick={() => handleTableClick(table)}
                        title={`${table.displayName || table.id} - ${getStatusText(table)}`}
                      >
                        <div className="table-number">{table.displayName || table.id}</div>
                        <div className="table-status">{getStatusText(table)}</div>
                        {table.booking && (
                          <div className="booker-name">{table.booking.bookerName}</div>
                        )}
                        {!isDragMode && (
                          <div className="table-actions">
                            <button
                              className="move-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveTableOutside(table.id)
                              }}
                              title="ย้ายออกจากหอประชุม"
                            >
                              <ArrowRightLeft size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  
                  {/* พื้นที่วางโต๊ะในโหมดลาก - ขวา */}
                  {isDragMode && draggedTable && [4, 5, 6].map(col => {
                    const hasTable = tables.some(t => t.row === row && t.col === col)
                    if (hasTable) return null
                    return (
                      <div
                        key={`drop-${row}-${col}`}
                        className="drop-zone"
                        onClick={() => handleTableDrop(row, col, 'inside')}
                        title="คลิกเพื่อวางโต๊ะที่นี่"
                      >
                        📍
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="summary">
          <div className="summary-item">
            <div className="summary-icon available">
              <Users size={16} />
            </div>
            <span>ว่าง: {tables.filter(t => !t.booking).length + outsideTables.filter(t => !t.booking).length}</span>
          </div>
          <div className="summary-item">
            <div className="summary-icon booked">
              <Users size={16} />
            </div>
            <span>จองแล้ว: {tables.filter(t => t.booking && !t.booking.isPaid).length + outsideTables.filter(t => t.booking && !t.booking.isPaid).length}</span>
          </div>
          <div className="summary-item">
            <div className="summary-icon paid">
              <CreditCard size={16} />
            </div>
            <span>จ่ายแล้ว: {tables.filter(t => t.booking && t.booking.isPaid).length + outsideTables.filter(t => t.booking && t.booking.isPaid).length}</span>
          </div>
          <div className="summary-item">
            <button 
              className={`magic-btn ${isDragMode ? 'active' : ''}`} 
              onClick={toggleDragMode}
            >
              ✨ {isDragMode ? 'ปิดโหมดลาก' : 'โหมดลากโต๊ะ'}
            </button>
          </div>
          <div className="summary-item">
            <button className="add-btn" onClick={addNewTable}>
              ➕ เพิ่มโต๊ะใหม่
            </button>
          </div>
          <div className="summary-item">
            <button className="restore-btn" onClick={restoreAllTables}>
              🔄 สร้างโต๊ะคืน
            </button>
          </div>
        </div>
      </div>

      <div className="outside-tables">
        <div className="outside-header">
          <h3>
            <MapPin size={20} />
            โต๊ะนอกหอประชุม
          </h3>
          <button className="add-table-btn" onClick={addNewOutsideTable}>
            <Plus size={16} />
            เพิ่มโต๊ะ
          </button>
        </div>
        
        <div className="outside-tables-grid">
          {outsideTables.map(table => (
            <div
              key={table.id}
              className={`table-item ${getTableStatusClass(table)} ${
                isDragMode ? 'drag-mode' : ''
              } ${
                draggedTable && draggedTable.id === table.id ? 'dragged' : ''
              }`}
              onClick={() => handleTableClick(table)}
            >
              <div className="table-number">{table.displayName || table.id}</div>
              <div className="table-status">{getStatusText(table)}</div>
              {table.booking && (
                <div className="booker-name">{table.booking.bookerName}</div>
              )}
              {!isDragMode && (
                <div className="table-actions">
                  <button
                    className="move-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      moveTableInside(table.id)
                    }}
                    title="ย้ายเข้าหอประชุม"
                  >
                    <ArrowRightLeft size={12} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOutsideTables(outsideTables.filter(t => t.id !== table.id))
                      toast.success(`ลบโต๊ะ ${table.displayName || table.id}`)
                    }}
                    title="ลบโต๊ะ"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {/* พื้นที่วางโต๊ะนอกหอ */}
          {isDragMode && draggedTable && (
            <div
              className="drop-zone outside-drop"
              onClick={() => handleTableDrop(0, 0, 'outside')}
              title="คลิกเพื่อวางโต๊ะนอกหอประชุม"
            >
              📍 วางโต๊ะที่นี่
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <BookingModal
          table={selectedTable}
          mode={modalMode}
          onBook={handleBookTable}
          onDelete={handleDeleteBooking}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

export default TableBookingSystem
