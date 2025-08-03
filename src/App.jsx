import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import TableBookingSystem from './components/TableBookingSystem'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>ระบบบันทึกจองโต๊ะจีน</h1>
        <h2>งานผ้าป่า โรงเรียนบ้านโนนผักชี</h2>
      </header>
      
      <main className="app-main">
        <TableBookingSystem />
      </main>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}

export default App
