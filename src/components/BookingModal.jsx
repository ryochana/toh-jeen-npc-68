import React, { useState } from 'react'
import { X, Save, Trash2, User, Phone, CreditCard } from 'lucide-react'
import './BookingModal.css'

const BookingModal = ({ table, mode, onBook, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    bookerName: table.booking?.bookerName || '',
    phoneNumber: table.booking?.phoneNumber || '',
    email: table.booking?.email || '',
    numberOfGuests: table.booking?.numberOfGuests || 1,
    specialRequests: table.booking?.specialRequests || '',
    isPaid: table.booking?.isPaid || false,
    amount: table.booking?.amount || 0,
    notes: table.booking?.notes || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.bookerName.trim()) {
      alert('กรุณากรอกชื่อผู้จอง')
      return
    }
    onBook(formData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mode === 'create' ? 'จองโต๊ะ' : 'แก้ไขการจอง'} {table.id}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="bookerName">
              <User size={16} />
              ชื่อผู้จอง *
            </label>
            <input
              type="text"
              id="bookerName"
              name="bookerName"
              value={formData.bookerName}
              onChange={handleChange}
              placeholder="กรอกชื่อผู้จอง"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">
              <Phone size={16} />
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">อีเมล</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="กรอกอีเมล (ไม่บังคับ)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numberOfGuests">จำนวนแขก</label>
              <input
                type="number"
                id="numberOfGuests"
                name="numberOfGuests"
                value={formData.numberOfGuests}
                onChange={handleChange}
                min="1"
                max="20"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">
                <CreditCard size={16} />
                จำนวนเงิน (บาท)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="specialRequests">ความต้องการพิเศษ</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="ระบุความต้องการพิเศษ (ถ้ามี)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">หมายเหตุ</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="หมายเหตุเพิ่มเติม"
              rows="2"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              จ่ายเงินแล้ว
            </label>
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn">
              <Save size={16} />
              {mode === 'create' ? 'จองโต๊ะ' : 'บันทึกการแก้ไข'}
            </button>
            
            {mode === 'edit' && (
              <button
                type="button"
                className="delete-btn"
                onClick={() => {
                  if (confirm(`ต้องการลบการจองโต๊ะ ${table.id} หรือไม่?`)) {
                    onDelete(table.id)
                  }
                }}
              >
                <Trash2 size={16} />
                ลบการจอง
              </button>
            )}
            
            <button type="button" className="cancel-btn" onClick={onClose}>
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal
