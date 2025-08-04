# ระบบจองโต๊ะงานวัดบ้านโนนปากชี 🎭

ระบบจองโต๊ะแบบ Real-time สำหรับงานผ้าป่า พัฒนาด้วย React + Vite

## ✨ คุณสมบัติหลัก

### � การจัดการโต๊ะ
- **37 โต๊ะในฮอลล์**: จัดเรียงแบบ 9 แถว (แถว 1,9 มี 3 โต๊ะ / แถว 2-8 มี 5 โต๊ะ)
- **โต๊ะน# ระบบจองโต๊ะหอประชุม (Table Booking System)

ระบบจองโต๊ะสำหรับหอประชุม พร้อมเลย์เอาท์แบบ 9 แถว 37 โต๊ะ และเชื่อมต่อ Supabase

## คุณสมบัติหลัก

### 🎯 เลย์เอาท์โต๊ะ
- **แถว 1 และ 9**: 3 โต๊ะ (คอลัมน์ซ้าย)
- **แถว 2-8**: 5 โต๊ะ (3 คอลัมน์ซ้าย + 2 คอลัมน์ขวา)
- **รวม**: 37 โต๊ะทั้งหมด
- เรียงลำดับเลขโต๊ะแบบต่อเนื่อง

### 📊 การจัดการข้อมูล
- **Supabase**: ฐานข้อมูลหลักในคลาวด์
- **localStorage**: Cache สำหรับการทำงานออฟไลน์
- **Real-time sync**: ซิงค์ข้อมูลอัตโนมัติ
- **Activity Log**: บันทึกกิจกรรมทั้งหมด

### 🎨 ฟีเจอร์ที่โดดเด่น
- ✅ การจองแบบ Modal แบบลอย
- ✅ สถานะโต๊ะ: ว่าง / จอง / จ่ายแล้ว
- ✅ Export ไฟล์ Excel ภาษาไทย
- ✅ ระบบ Undo/Redo
- ✅ มโหรดแสดงสถิติ
- ✅ ออนไลน์/ออฟไลน์ detection

## การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และเพิ่ม:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. ตั้งค่า Supabase Database
รันคำสั่ง SQL ใน `supabase-setup.sql`:
```sql
-- สร้างตาราง table_bookings
-- สร้างตาราง activity_logs
-- ตั้งค่า Row Level Security
-- สร้าง Triggers และ Functions
```

### 4. รันโปรเจค
```bash
npm run dev
```

## โครงสร้างไฟล์

```
src/
├── components/
│   ├── TableBookingSystem.jsx    # คอมโพเนนต์หลัก
│   ├── TableBookingSystem.css    # สไตล์ CSS
│   └── BookingModal.jsx          # Modal สำหรับจอง
├── services/
│   └── supabaseService.js        # Service สำหรับ Supabase
├── App.jsx                       # App หลัก
└── main.jsx                      # Entry point
```

## การใช้งาน

### การจองโต๊ะ
1. คลิกที่โต๊ะที่ต้องการจอง
2. กรอกข้อมูลในฟอร์ม Modal
3. เลือกสถานะ: จอง / จ่ายแล้ว
4. กดยืนยัน

### การแก้ไขการจอง
1. คลิกที่โต๊ะที่จองแล้ว
2. แก้ไขข้อมูลในฟอร์ม
3. กดบันทึก

### Export ข้อมูล
- กดปุ่ม "📊 Export Excel"
- ไฟล์จะดาวน์โหลดเป็นภาษาไทย

## เทคโนโลยี

- **Frontend**: React 19, Vite 7
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React
- **Export**: SheetJS (xlsx)
- **Notifications**: React Hot Toast

## สี Theme

```css
/* สถานะโต๊ะ */
--table-available: linear-gradient(135deg, #d4edda, #c3e6cb)
--table-booked: linear-gradient(135deg, #fff3cd, #ffeaa7)
--table-paid: linear-gradient(135deg, #cce5ff, #b3d9ff)

/* Stage */
--stage-gradient: linear-gradient(135deg, #ff6b6b, #ee5a24)
```

## การ Deploy

### Vercel
```bash
npm run build
vercel --prod
```

### Environment Variables ใน Vercel
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## การแก้ปัญหา

### ไม่สามารถเชื่อมต่อ Supabase
1. ตรวจสอบ `.env.local`
2. ตรวจสอบ Supabase URL และ Key
3. ตรวจสอบ RLS Policies

### ข้อมูลหายหลังรีเฟรช
1. ตรวจสอบการเชื่อมต่อ Supabase
2. เช็ค Console สำหรับ error
3. ข้อมูลจะอยู่ใน localStorage เป็น backup

## ใบอนุญาต
MIT License์**: เพิ่มโต๊ะเพิ่มเติมได้ไม่จำกัด
- **ย้ายโต๊ะ**: ย้ายระหว่างในฮอลล์และนอกฮอลล์ได้
- **Drag & Drop**: จัดเรียงโต๊ะด้วยการลาก

### 📊 การจองและจัดการ
- **2 ประเภทการจอง**: จองหน้างาน / จองออนไลน์
- **ข้อมูลผู้จอง**: ชื่อ, เบอร์โทรศัพท์
- **สถานะแบบ Real-time**: ว่าง / จองแล้ว / ประเภทการจอง
- **Undo System**: ยกเลิกการดำเนินการได้

### � Export และ Analytics
- **Export Excel**: ข้อมูลครบถ้วนเป็นภาษาไทย
- **3 Worksheets**: รายการทั้งหมด / สรุปข้อมูล / โต๊ะที่จองแล้ว
- **เรียงตามลำดับ**: จัดเรียงตามหมายเลขโต๊ะ
- **Activity Logs**: ประวัติการดำเนินการทั้งหมด

### 🔄 ระบบฐานข้อมูล
- **Supabase Integration**: เก็บข้อมูลในคลาวด์
- **localStorage Fallback**: ทำงานได้แม้ offline
- **Auto Sync**: ซิงค์ข้อมูลอัตโนมัติ
- **Multi-device Support**: ใช้งานข้ามอุปกรณ์ได้

## 🚀 การติดตั้งและใช้งาน

### ติดตั้ง Dependencies
```bash
npm install
```

### รันในโหมด Development
```bash
npm run dev
```

### Build สำหรับ Production
```bash
npm run build
```

## ⚙️ การตั้งค่า Supabase (ไม่จำเป็น)

### 1. สร้าง Project ใน Supabase
1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้าง project ใหม่
3. รัน SQL script จากไฟล์ `supabase-setup.sql`

### 2. ตั้งค่า Environment Variables
```bash
# Copy example file
cp .env.local.example .env.local

# แก้ไขไฟล์ .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. รีสตาร์ท Development Server
```bash
npm run dev
```

> **หมายเหตุ**: ถ้าไม่ตั้งค่า Supabase ระบบจะใช้ localStorage อย่างเดียว และยังคงใช้งานได้ปกติ

## 📱 การใช้งาน

### การจองโต๊ะ
1. คลิกที่โต๊ะว่าง (สีเขียว)
2. กรอกชื่อผู้จอง และเบอร์โทรศัพท์
3. เลือกประเภทการจอง (หน้างาน/ออนไลน์)
4. คลิก "ยืนยันการจอง"

### การแก้ไขข้อมูล
1. คลิกที่โต๊ะที่จองแล้ว (สีแดง/น้ำเงิน)
2. แก้ไขข้อมูลตามต้องการ
3. คลิก "บันทึกการแก้ไข" หรือ "ยกเลิกการจอง"

### การจัดการโต๊ะ
- **เพิ่มโต๊ะนอกฮอลล์**: คลิกปุ่ม "เพิ่มโต๊ะนอกฮอลล์"
- **ย้ายโต๊ะ**: ใช้ปุ่มลูกศรในส่วน "การจัดการโต๊ะที่จองแล้ว"
- **ลบการจอง**: ใช้ปุ่มถังขยะ

### Export ข้อมูล
1. คลิกปุ่ม "Export Excel"
2. ไฟล์ Excel จะถูกดาวน์โหลดโดยอัตโนมัติ
3. ไฟล์จะมีชื่อตามวันที่และเวลาปัจจุบัน

### Sync ข้อมูล (เฉพาะเมื่อใช้ Supabase)
- **Sync ไป Supabase**: อัพโหลดข้อมูลไปยังคลาวด์
- **ดึงจาก Supabase**: ดาวน์โหลดข้อมูลล่าสุด

## 🎨 การออกแบบ UI

### สีสถานะโต๊ะ
- 🟢 **สีเขียว**: โต๊ะว่าง
- 🔴 **สีแดง**: จองหน้างาน
- 🔵 **สีน้ำเงิน**: จองออนไลน์

### เลย์เอาท์ฮอลล์
```
🎭 เวทีแสดง
┌─────────────────────────────────────┐
│ แถว 1: [01] [02] [03]     ทางเดิน     ไม่มีโต๊ะ │
│ แถว 2: [04] [05] [06]     ทางเดิน     [07] [08] │
│ แถว 3: [09] [10] [11]     ทางเดิน     [12] [13] │
│ แถว 4: [14] [15] [16]     ทางเดิน     [17] [18] │
│ แถว 5: [19] [20] [21]     ทางเดิน     [22] [23] │
│ แถว 6: [24] [25] [26]     ทางเดิน     [27] [28] │
│ แถว 7: [29] [30] [31]     ทางเดิน     [32] [33] │
│ แถว 8: [34] [35] [36]     ทางเดิน     [37] [38] │
│ แถว 9: [35] [36] [37]     ทางเดิน     ไม่มีโต๊ะ │
└─────────────────────────────────────┘
```

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Database**: Supabase PostgreSQL
- **Local Storage**: Browser localStorage
- **Export**: SheetJS (xlsx)

## 📁 โครงสร้างโปรเจ็กต์

```
toh-jeen-npc-68/
├── src/
│   ├── components/
│   │   ├── TableBookingSystem.jsx    # Component หลัก
│   │   ├── BookingModal.jsx          # Modal จองโต๊ะ
│   │   └── TableBookingSystem.css    # Styles
│   ├── services/
│   │   └── supabaseService.js        # Supabase integration
│   └── main.jsx                      # Entry point
├── public/                           # Static files
├── supabase-setup.sql               # SQL schema
├── SUPABASE_SETUP.md                # คู่มือตั้งค่า Supabase
└── .env.local.example               # ตัวอย่าง environment variables
```

## 🔧 การ Troubleshooting

### ปัญหาที่พบบ่อย

**Q: ข้อมูลหายไป**
- A: ข้อมูลยังอยู่ใน localStorage หรือ Supabase ใช้ปุ่ม "ดึงจาก Supabase" หรือรีเฟรชหน้า

**Q: Export Excel ไม่ทำงาน**
- A: ตรวจสอบ popup blocker และอนุญาตให้เว็บไซต์ดาวน์โหลดไฟล์

**Q: Supabase ไม่เชื่อมต่อ**
- A: ตรวจสอบ environment variables และ internet connection

**Q: โต๊ะไม่แสดงผล**
- A: ล้าง localStorage แล้วรีเฟรชหน้า: `localStorage.clear()`

### การติดต่อสำหรับการสนับสนุน
- ดู Activity Logs สำหรับประวัติการทำงาน
- ตรวจสอบ Console ใน Browser DevTools
- ตรวจสอบไฟล์ `SUPABASE_SETUP.md` สำหรับข้อมูลเพิ่มเติม

## 📄 ใบอนุญาต

โปรเจ็กต์นี้พัฒนาขึ้นสำหรับงานวัดบ้านโนนปากชี สามารถนำไปใช้และแก้ไขได้อย่างอิสระ

---

พัฒนาด้วย ❤️ สำหรับงานบุญผ้าป่า 🙏

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
