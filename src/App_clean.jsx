import React from 'react'
import { Toaster } from 'react-hot-toast'
import TableBookingSystem from './components/TableBookingSystem'
import './App.css'

function App() {
  return (
    <div className="App">
      <TableBookingSystem />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }}
      />
    </div>
  )
}

export default App
