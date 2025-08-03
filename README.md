# ระบบบันทึกจองโต๊ะจีน - งานผ้าป่า โรงเรียนบ้านโนนผักชี

เว็บแอปพลิเคชันสำหรับจัดการการจองโต๊ะในงานผ้าป่า ที่สามารถใช้งานได้ง่าย มีฟีเจอร์ครบครัน และออกแบบให้สวยงาม

## คุณสมบัติหลัก

### 🏛️ ระบบจัดการโต๊ะ
- **หอประชุม**: จัดเรียงโต๊ะ 5 แถว x 12 โต๊ะ (60 โต๊ะ)
- **เวทีด้านหน้า**: แสดงตำแหน่งเวทีชัดเจน
- **โต๊ะนอกหอประชุม**: สามารถเพิ่มโต๊ะเพิ่มเติมได้ตามต้องการ

### 📝 ระบบจองโต๊ะ
- **จองโต๊ะใหม่**: คลิกที่โต๊ะว่างเพื่อจอง
- **แก้ไขการจอง**: คลิกที่โต๊ะที่จองแล้วเพื่อแก้ไข
- **ลบการจอง**: สามารถยกเลิกการจองได้
- **ข้อมูลการจอง**:
  - ชื่อผู้จอง
  - เบอร์โทรศัพท์
  - อีเมล
  - จำนวนแขก
  - ความต้องการพิเศษ
  - หมายเหตุ

### 💰 ระบบการเงิน
- **สถานะการจ่ายเงิน**: จ่ายแล้ว/ยังไม่จ่าย
- **จำนวนเงิน**: บันทึกยอดเงินที่จ่าย
- **การแสดงผล**: สีต่างกันตามสถานะ
  - 🟢 เขียว: โต๊ะว่าง
  - 🟡 เหลือง: จองแล้วแต่ยังไม่จ่าย
  - 🔵 น้ำเงิน: จ่ายเงินแล้ว

### 🔄 ระบบจัดการโต๊ะ
- **ย้ายโต๊ะ**: ย้ายโต๊ะเข้า/ออกจากหอประชุมได้
- **เพิ่มโต๊ะ**: เพิ่มโต๊ะนอกหอประชุมได้ตามต้องการ
- **ลบโต๊ะ**: ลบโต๊ะนอกหอประชุมที่ไม่ต้องการ

### 📊 สรุปข้อมูล
- จำนวนโต๊ะว่าง
- จำนวนโต๊ะที่จองแล้ว
- จำนวนโต๊ะที่จ่ายเงินแล้ว

## เทคโนโลยีที่ใช้

- **Frontend**: React 18 + Vite
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Storage**: Local Storage (บันทึกข้อมูลในเบราว์เซอร์)
- **Styling**: CSS Modules พร้อม Responsive Design

## การติดตั้งและรัน

```bash
# ติดตั้ง dependencies
npm install

# รันในโหมด development
npm run dev

# สร้างไฟล์สำหรับ production
npm run build

# ดูตัวอย่าง production build
npm run preview
```

## การ Deploy บน Vercel

1. อัปโหลดโปรเจ็กต์ขึ้น GitHub ผ่าน GitHub Desktop
2. เข้าไปที่ [Vercel](https://vercel.com)
3. เชื่อมต่อกับ GitHub repository
4. เลือกโปรเจ็กต์และ Deploy

## โครงสร้างโปรเจ็กต์

```
src/
├── components/
│   ├── TableBookingSystem.jsx    # ระบบจองโต๊ะหลัก
│   ├── TableBookingSystem.css    # สไตล์ระบบจองโต๊ะ
│   ├── BookingModal.jsx          # หน้าต่างจองโต๊ะ
│   └── BookingModal.css          # สไตล์หน้าต่างจอง
├── App.jsx                       # คอมโพเนนต์หลัก
└── App.css                       # สไตล์หลัก
```

## ข้อมูลที่เก็บ

ระบบใช้ Local Storage เก็บข้อมูล:
- ข้อมูลการจองทั้งหมด
- สถานะโต๊ะ (ในหอ/นอกหอ)
- ข้อมูลผู้จอง
- สถานะการจ่ายเงิน

## การใช้งาน

1. **จองโต๊ะใหม่**: คลิกที่โต๊ะสีเขียว (ว่าง)
2. **ดูข้อมูลการจอง**: คลิกที่โต๊ะที่จองแล้ว
3. **แก้ไขการจอง**: คลิกที่โต๊ะแล้วแก้ไขข้อมูล
4. **ย้ายโต๊ะ**: ใช้ปุ่มลูกศรเพื่อย้ายโต๊ะ
5. **เพิ่มโต๊ะนอกหอ**: คลิกปุ่ม "เพิ่มโต๊ะ" ในส่วนนอกหอประชุม

## ข้อกำหนดเบราว์เซอร์

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## การสนับสนุน

สำหรับคำถามหรือปัญหาการใช้งาน กรุณาติดต่อผู้พัฒนา

---

พัฒนาโดย: GitHub Copilot  
สำหรับ: งานผ้าป่า โรงเรียนบ้านโนนผักชี+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
