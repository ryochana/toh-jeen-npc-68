import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import TableBookingSystem from './components/TableBookingSystem'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">🏮</div>
          <div className="header-text">
            <h1>ระบบจองโต๊ะจีน</h1>
            <h2>งานผ้าป่า โรงเรียนบ้านโนนผักชี</h2>
            <p className="header-subtitle">จัดการการจองโต๊ะอย่างมีประสิทธิภาพ</p>
          </div>
          <div className="header-decoration">
            <span className="decoration-item">🎊</span>
            <span className="decoration-item">🎋</span>
            <span className="decoration-item">🎊</span>
          </div>
        </div>
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
