import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { supabaseService } from '../services/supabaseService'
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
  Upload,
  Database,
  FileSpreadsheet
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
  const [isSupabaseEnabled, setIsSupabaseEnabled] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

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

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    const initializeTables = () => {
      const initialTables = []
      let tableNumber = 1
      
      // สร้างโต๊ะ 9 แถว
      for (let row = 1; row <= 9; row++) {
        if (row === 1 || row === 9) {
          // แถว 1 และ 9: มีแค่ 3 โต๊ะ (คอลัมซ้าย)
          for (let col = 1; col <= 3; col++) {
            initialTables.push({
              id: tableNumber.toString().padStart(2, '0'),
              displayName: tableNumber.toString().padStart(2, '0'),
              row,
              col,
              booking: null,
              position: 'inside'
            })
            tableNumber++
          }
        } else {
          // แถว 2-8: มี 5 โต๊ะ (3 ซ้าย + 2 ขวา)
          for (let col = 1; col <= 5; col++) {
            initialTables.push({
              id: tableNumber.toString().padStart(2, '0'),
              displayName: tableNumber.toString().padStart(2, '0'),
              row,
              col,
              booking: null,
              position: 'inside'
            })
            tableNumber++
          }
        }
      }
      
      setTables(initialTables)
      addToActivityLog('🎯 เริ่มต้นระบบจองโต๊ะ - สร้างโต๊ะเริ่มต้น 37 โต๊ะ')
    }

    const loadData = async () => {
      // ตรวจสอบว่ามี environment variables สำหรับ Supabase หรือไม่
      const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co'
      
      setIsSupabaseEnabled(hasSupabaseConfig)
      
      if (hasSupabaseConfig) {
        try {
          // พยายามโหลดจาก Supabase ก่อน
          const supabaseData = await supabaseService.syncToLocalStorage()
          if (supabaseData.tables.length > 0 || supabaseData.outsideTables.length > 0) {
            setTables(supabaseData.tables)
            setOutsideTables(supabaseData.outsideTables)
            
            const logs = await supabaseService.getActivityLogs(50)
            const convertedLogs = logs.map(log => ({
              id: log.id,
              action: log.action,
              timestamp: new Date(log.timestamp).toLocaleString('th-TH'),
              user: log.user_name || 'ระบบ'
            }))
            setActivityLog(convertedLogs)
            
            console.log('✅ โหลดข้อมูลจาก Supabase สำเร็จ')
            addToActivityLog('📥 โหลดข้อมูลจาก Supabase สำเร็จ')
            return
          }
        } catch (error) {
          console.warn('⚠️ ไม่สามารถโหลดจาก Supabase ได้, กำลังโหลดจาก localStorage:', error)
        }
      }

      // โหลดจาก localStorage
      const savedData = localStorage.getItem('tableBookingData')
      if (savedData) {
        try {
          const { tables: savedTables, outsideTables: savedOutside, activityLog: savedLog } = JSON.parse(savedData)
          setTables(savedTables || [])
          setOutsideTables(savedOutside || [])
          setActivityLog(savedLog || [])
          console.log('✅ โหลดข้อมูลจาก localStorage สำเร็จ')
        } catch (error) {
          console.error('❌ เกิดข้อผิดพลาดในการโหลดข้อมูลจาก localStorage:', error)
          initializeTables()
        }
      } else {
        initializeTables()
      }
    }

    loadData()
  }, [])

  // บันทึกข้อมูลลง localStorage และ Supabase
  useEffect(() => {
    if (tables.length > 0 || outsideTables.length > 0) {
      console.log('💾 กำลังบันทึกข้อมูลลง localStorage:', { 
        tables: tables.length, 
        outsideTables: outsideTables.length, 
        activityLog: activityLog.length,
        timestamp: new Date().toLocaleString('th-TH')
      })
      
      // บันทึกลง localStorage
      localStorage.setItem('tableBookingData', JSON.stringify({
        tables,
        outsideTables,
        activityLog
      }))

      // บันทึกลง Supabase (ถ้าเปิดใช้งาน)
      if (isSupabaseEnabled && !isSyncing) {
        syncToSupabase(false)
      }
    }
  }, [tables, outsideTables, activityLog])

  const syncToSupabase = async (showNotification = true) => {
    if (!isSupabaseEnabled || isSyncing) return

    setIsSyncing(true)
    try {
      await supabaseService.syncFromLocalStorage({ tables, outsideTables })
      setLastSyncTime(new Date())
      console.log('✅ Sync ไป Supabase สำเร็จ')
      if (showNotification) {
        toast.success('📊 Sync ข้อมูลไป Supabase สำเร็จ')
      }
    } catch (error) {
      console.error('❌ Sync ไป Supabase ล้มเหลว:', error)
      if (showNotification) {
        toast.error('❌ Sync ไป Supabase ล้มเหลว')
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const syncFromSupabase = async () => {
    if (!isSupabaseEnabled) {
      toast.error('❌ Supabase ไม่ได้ถูกตั้งค่า')
      return
    }

    setIsSyncing(true)
    try {
      const supabaseData = await supabaseService.syncToLocalStorage()
      setTables(supabaseData.tables)
      setOutsideTables(supabaseData.outsideTables)
      
      const logs = await supabaseService.getActivityLogs(50)
      const convertedLogs = logs.map(log => ({
        id: log.id,
        action: log.action,
        timestamp: new Date(log.timestamp).toLocaleString('th-TH'),
        user: log.user_name || 'ระบบ'
      }))
      setActivityLog(convertedLogs)
      
      addToActivityLog('📥 ดึงข้อมูลจาก Supabase สำเร็จ')
      toast.success('📥 ดึงข้อมูลจาก Supabase สำเร็จ')
    } catch (error) {
      console.error('❌ ดึงข้อมูลจาก Supabase ล้มเหลว:', error)
      toast.error('❌ ดึงข้อมูลจาก Supabase ล้มเหลว')
    } finally {
      setIsSyncing(false)
    }
  }

  // ตรวจสอบสถานะ online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('📶 กลับมาออนไลน์แล้ว')
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
  }, [])

  // ฟังก์ชัน Export Excel
  const exportToExcel = () => {
    try {
      // รวมข้อมูลโต๊ะทั้งหมด
      const allTables = [...tables, ...outsideTables]
      
      // เรียงตามเลขโต๊ะ
      const sortedTables = allTables.sort((a, b) => {
        const aNum = parseInt(a.displayName.replace(/\D/g, ''))
        const bNum = parseInt(b.displayName.replace(/\D/g, ''))
        return aNum - bNum
      })

      // สร้างข้อมูลสำหรับ Excel
      const excelData = sortedTables.map((table, index) => ({
        'ลำดับ': index + 1,
        'หมายเลขโต๊ะ': table.displayName,
        'ตำแหน่ง': table.position === 'inside' ? 'ในฮอลล์' : 'นอกฮอลล์',
        'แถว': table.row || '-',
        'คอลัมน์': table.col || '-',
        'สถานะ': table.booking ? 'จองแล้ว' : 'ว่าง',
        'ชื่อผู้จอง': table.booking?.name || '-',
        'เบอร์โทรศัพท์': table.booking?.phone || '-',
        'ประเภทการจอง': table.booking ? (table.booking.status === 'online' ? 'จองออนไลน์' : 'จองหน้างาน') : '-',
        'วันที่จอง': table.booking?.bookedAt ? new Date(table.booking.bookedAt).toLocaleDateString('th-TH') : '-',
        'เวลาที่จอง': table.booking?.bookedAt ? new Date(table.booking.bookedAt).toLocaleTimeString('th-TH') : '-',
        'แก้ไขล่าสุด': table.booking?.updatedAt ? new Date(table.booking.updatedAt).toLocaleDateString('th-TH') : '-'
      }))

      // สร้าง summary
      const summary = [
        { 'รายการ': 'โต๊ะทั้งหมด', 'จำนวน': allTables.length },
        { 'รายการ': 'โต๊ะที่จองแล้ว', 'จำนวน': allTables.filter(t => t.booking).length },
        { 'รายการ': 'โต๊ะว่าง', 'จำนวน': allTables.filter(t => !t.booking).length },
        { 'รายการ': 'โต๊ะในฮอลล์', 'จำนวน': tables.length },
        { 'รายการ': 'โต๊ะนอกฮอลล์', 'จำนวน': outsideTables.length },
        { 'รายการ': 'จองออนไลน์', 'จำนวน': allTables.filter(t => t.booking?.status === 'online').length },
        { 'รายการ': 'จองหน้างาน', 'จำนวน': allTables.filter(t => t.booking?.status === 'confirmed').length }
      ]

      // สร้าง workbook
      const wb = XLSX.utils.book_new()
      
      // สร้าง worksheet สำหรับข้อมูลโต๊ะ
      const ws1 = XLSX.utils.json_to_sheet(excelData)
      XLSX.utils.book_append_sheet(wb, ws1, 'รายการโต๊ะทั้งหมด')
      
      // สร้าง worksheet สำหรับสรุป
      const ws2 = XLSX.utils.json_to_sheet(summary)
      XLSX.utils.book_append_sheet(wb, ws2, 'สรุปข้อมูล')

      // สร้าง worksheet สำหรับโต๊ะที่จองแล้ว
      const bookedTables = allTables.filter(t => t.booking).map((table, index) => ({
        'ลำดับ': index + 1,
        'หมายเลขโต๊ะ': table.displayName,
        'ชื่อผู้จอง': table.booking.name,
        'เบอร์โทรศัพท์': table.booking.phone,
        'ประเภทการจอง': table.booking.status === 'online' ? 'จองออนไลน์' : 'จองหน้างาน',
        'ตำแหน่ง': table.position === 'inside' ? 'ในฮอลล์' : 'นอกฮอลล์',
        'วันที่จอง': table.booking.bookedAt ? new Date(table.booking.bookedAt).toLocaleDateString('th-TH') : '-',
        'เวลาที่จอง': table.booking.bookedAt ? new Date(table.booking.bookedAt).toLocaleTimeString('th-TH') : '-'
      }))
      
      if (bookedTables.length > 0) {
        const ws3 = XLSX.utils.json_to_sheet(bookedTables)
        XLSX.utils.book_append_sheet(wb, ws3, 'โต๊ะที่จองแล้ว')
      }

      // ตั้งชื่อไฟล์
      const currentDate = new Date().toLocaleDateString('th-TH').replace(/\//g, '-')
      const currentTime = new Date().toLocaleTimeString('th-TH', { hour12: false }).replace(/:/g, '-')
      const filename = `รายการจองโต๊ะ_${currentDate}_${currentTime}.xlsx`

      // บันทึกไฟล์
      XLSX.writeFile(wb, filename)
      
      addToActivityLog(`📊 Export ข้อมูลไป Excel: ${filename}`)
      toast.success(`📊 Export ข้อมูลสำเร็จ: ${filename}`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('❌ Export ข้อมูลล้มเหลว')
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

  const moveTableOutside = (tableId) => {
    const table = tables.find(t => t.id === tableId)
    if (!table || !table.booking) return

    saveStateForUndo(`ย้ายโต๊ะ ${table.displayName} ออกจากฮอลล์`)
    
    const outsideTable = {
      ...table,
      position: 'outside',
      displayName: `${table.displayName} (นอกฮอลล์)`,
      row: null,
      col: null
    }
    
    setOutsideTables(prev => [...prev, outsideTable])
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, booking: null } : t))
    
    addToActivityLog(`📤 ย้ายโต๊ะ ${table.displayName} ออกจากฮอลล์`)
    toast.success('ย้ายโต๊ะออกจากฮอลล์แล้ว')
  }

  const moveTableInside = (tableId) => {
    const table = outsideTables.find(t => t.id === tableId)
    if (!table) return

    // หาตำแหน่งว่างในฮอลล์
    const emptyTable = tables.find(t => !t.booking)
    if (!emptyTable) {
      toast.error('ไม่มีโต๊ะว่างในฮอลล์')
      return
    }

    saveStateForUndo(`ย้ายโต๊ะ ${table.displayName} เข้าฮอลล์`)
    
    setTables(prev => prev.map(t => 
      t.id === emptyTable.id 
        ? { ...t, booking: table.booking }
        : t
    ))
    setOutsideTables(prev => prev.filter(t => t.id !== tableId))
    
    addToActivityLog(`📥 ย้ายโต๊ะ ${table.displayName} เข้าฮอลล์ (โต๊ะ ${emptyTable.displayName})`)
    toast.success('ย้ายโต๊ะเข้าฮอลล์แล้ว')
  }

  const deleteTable = (tableId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบโต๊ะนี้ถาวร?')) return

    const insideTable = tables.find(t => t.id === tableId)
    const outsideTable = outsideTables.find(t => t.id === tableId)
    
    if (insideTable) {
      saveStateForUndo(`ลบโต๊ะ ${insideTable.displayName} ถาวร`)
      setTables(prev => prev.map(t => 
        t.id === tableId ? { ...t, booking: null } : t
      ))
      addToActivityLog(`🗑️ ลบการจองโต๊ะ ${insideTable.displayName}`)
      toast.success('ลบการจองแล้ว')
    } else if (outsideTable) {
      saveStateForUndo(`ลบโต๊ะ ${outsideTable.displayName} ถาวร`)
      setOutsideTables(prev => prev.filter(t => t.id !== tableId))
      addToActivityLog(`🗑️ ลบโต๊ะ ${outsideTable.displayName} ถาวร`)
      toast.success('ลบโต๊ะถาวรแล้ว')
    }
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
          relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 text-center min-h-[100px] flex flex-col justify-center shadow-sm hover:shadow-md
          ${isBooked 
            ? (isOnline 
                ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 text-blue-800 hover:from-blue-100 hover:to-blue-200' 
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-400 text-red-800 hover:from-red-100 hover:to-red-200'
              )
            : 'bg-gradient-to-br from-green-50 to-green-100 border-green-400 text-green-800 hover:from-green-100 hover:to-green-200'
          }
          ${isDragMode && !isBooked ? 'hover:bg-yellow-100 border-yellow-400 hover:shadow-lg' : ''}
          transform hover:scale-105 active:scale-95
        `}
        onClick={() => handleTableClick(table)}
        draggable={isDragMode && !isBooked}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', table.id)
        }}
      >
        {/* หมายเลขโต๊ะ */}
        <div className="absolute top-1 left-2 text-xs font-bold opacity-60">
          #{table.displayName}
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-1 right-2">
          {isBooked ? (
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-blue-500' : 'bg-red-500'}`} 
                 title={isOnline ? 'จองออนไลน์' : 'จองหน้างาน'}>
            </div>
          ) : (
            <div className="w-3 h-3 rounded-full bg-green-500" title="ว่าง"></div>
          )}
        </div>

        <div className="mt-2">
          <div className="font-bold text-lg mb-1">{table.displayName}</div>
          
          {isBooked ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Users size={14} className="mr-1" />
                <span className="text-sm font-medium truncate max-w-[80px]" title={table.booking.name}>
                  {table.booking.name}
                </span>
              </div>
              
              {table.booking.phone && (
                <div className="text-xs text-gray-600 truncate max-w-[90px]" title={table.booking.phone}>
                  📞 {table.booking.phone}
                </div>
              )}
              
              <div className="flex items-center justify-center mt-2">
                {isOnline ? (
                  <>
                    <CreditCard size={12} className="mr-1" />
                    <span className="text-xs font-semibold">ออนไลน์</span>
                  </>
                ) : (
                  <>
                    <MapPin size={12} className="mr-1" />
                    <span className="text-xs font-semibold">หน้างาน</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm font-bold text-green-600 flex items-center justify-center">
              <Check size={16} className="mr-1" />
              ว่าง
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 rounded-lg bg-white bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 pointer-events-none"></div>
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
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  {isOnline ? <Wifi size={16} className="mr-1 text-green-500" /> : <WifiOff size={16} className="mr-1 text-red-500" />}
                  {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                </span>
                
                <span className="flex items-center">
                  <Database size={16} className="mr-1" />
                  {isSupabaseEnabled ? (
                    <span className="text-green-600">Supabase เชื่อมต่อแล้ว</span>
                  ) : (
                    <span className="text-orange-600">ใช้ localStorage</span>
                  )}
                </span>
                
                {lastSyncTime && isSupabaseEnabled && (
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    Sync ล่าสุด: {lastSyncTime.toLocaleTimeString('th-TH')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">สรุปโต๊ะ</div>
                <div className="text-lg font-bold text-blue-800">
                  {bookedTablesCount}/{totalTables} โต๊ะ
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-50 px-2 py-1 rounded text-green-700 text-center">
                  ว่าง: {totalTables - bookedTablesCount}
                </div>
                <div className="bg-red-50 px-2 py-1 rounded text-red-700 text-center">
                  จอง: {bookedTablesCount}
                </div>
                <div className="bg-blue-50 px-2 py-1 rounded text-blue-700 text-center">
                  ออนไลน์: {[...tables, ...outsideTables].filter(t => t.booking?.status === 'online').length}
                </div>
                <div className="bg-orange-50 px-2 py-1 rounded text-orange-700 text-center">
                  หน้างาน: {[...tables, ...outsideTables].filter(t => t.booking?.status === 'confirmed').length}
                </div>
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

            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <FileSpreadsheet size={18} className="mr-2" />
              Export Excel
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

            {isSupabaseEnabled && (
              <>
                <button
                  onClick={() => syncToSupabase(true)}
                  disabled={isSyncing}
                  className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  <Upload size={18} className="mr-2" />
                  {isSyncing ? 'กำลัง Sync...' : 'Sync ไป Supabase'}
                </button>
                
                <button
                  onClick={syncFromSupabase}
                  disabled={isSyncing}
                  className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  <Download size={18} className="mr-2" />
                  {isSyncing ? 'กำลัง Sync...' : 'ดึงจาก Supabase'}
                </button>
              </>
            )}
            
            <button
              onClick={restoreAllTables}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} className="mr-2" />
              รีเซ็ตทั้งหมด
            </button>
          </div>

          {/* Table Management Section */}
          <div className="border-t mt-4 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">การจัดการโต๊ะที่จองแล้ว:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...tables, ...outsideTables].filter(t => t.booking).length > 0 ? (
                [...tables, ...outsideTables].filter(t => t.booking).map(table => (
                  <div key={table.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{table.displayName}</div>
                      <div className="text-xs text-gray-600">{table.booking.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {table.position === 'inside' ? (
                        <button
                          onClick={() => moveTableOutside(table.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="ย้ายออกจากฮอลล์"
                        >
                          <ArrowRightLeft size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => moveTableInside(table.id)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="ย้ายเข้าฮอลล์"
                        >
                          <ArrowRightLeft size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTable(table.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="ลบการจอง"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-4">
                  ไม่มีโต๊ะที่จองแล้ว
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Layout - 9 แถว x (3+2) คอลัมน์ */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">โต๊ะในฮอลล์ (37 โต๊ะ)</h2>
          
          {/* เวที */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">🎭 เวทีแสดง</h3>
            </div>
          </div>

          {/* Layout แบบตาราง */}
          <div className="space-y-3">
            {Array.from({ length: 9 }, (_, rowIndex) => {
              const row = rowIndex + 1
              const leftTables = getTablesByPosition('inside').filter(table => table.row === row && table.col <= 3)
              const rightTables = getTablesByPosition('inside').filter(table => table.row === row && table.col > 3)
              
              return (
                <div key={row} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Row Header */}
                  <div className="bg-gray-100 px-4 py-2 text-center font-semibold text-gray-700 border-b">
                    แถวที่ {row}
                  </div>
                  
                  {/* Tables Row */}
                  <div className="p-4">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* โต๊ะด้านซ้าย (3 โต๊ะ) */}
                      <div className="col-span-3 grid grid-cols-3 gap-3">
                        {leftTables.length > 0 ? (
                          leftTables.map(renderTable)
                        ) : (
                          Array.from({ length: 3 }, (_, i) => (
                            <div key={i} className="h-24 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                              ว่าง
                            </div>
                          ))
                        )}
                        {isDragMode && renderDropZone(row, [1, 2, 3])}
                      </div>
                      
                      {/* ทางเดินกลาง */}
                      <div className="col-span-1 flex flex-col items-center justify-center">
                        <div className="w-full h-1 bg-blue-200 rounded-full mb-2"></div>
                        <span className="text-xs text-gray-500 font-medium">ทางเดิน</span>
                        <div className="w-full h-1 bg-blue-200 rounded-full mt-2"></div>
                      </div>
                      
                      {/* โต๊ะด้านขวา (2 โต๊ะ เฉพาะแถว 2-8) */}
                      <div className="col-span-2 grid grid-cols-2 gap-3">
                        {row !== 1 && row !== 9 ? (
                          <>
                            {rightTables.length > 0 ? (
                              rightTables.map(renderTable)
                            ) : (
                              Array.from({ length: 2 }, (_, i) => (
                                <div key={i} className="h-24 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                                  ว่าง
                                </div>
                              ))
                            )}
                            {isDragMode && renderDropZone(row, [4, 5])}
                          </>
                        ) : (
                          <div className="col-span-2 flex items-center justify-center h-24 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="text-center">
                              <div className="text-lg">🚫</div>
                              <div>ไม่มีโต๊ะ</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
              <span>โต๊ะว่าง</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
              <span>จองหน้างาน</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
              <span>จองออนไลน์</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded bg-gray-50"></div>
              <span>ตำแหน่งว่าง</span>
            </div>
          </div>
        </div>
      </div>

      {/* Outside Tables */}
      {outsideTables.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">โต๊ะนอกฮอลล์ ({outsideTables.length} โต๊ะ)</h2>
              <div className="text-sm text-gray-600">
                จอง: {outsideTables.filter(t => t.booking).length} / ว่าง: {outsideTables.filter(t => !t.booking).length}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
