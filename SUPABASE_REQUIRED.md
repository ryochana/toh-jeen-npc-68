# 🔗 คำแนะนำการตั้งค่า Supabase เป็นหลัก

## ⚠️ **สำคัญ: ข้อมูลจะหายถ้าไม่มี Supabase!**

ระบบได้ถูกปรับให้ใช้ **Supabase เป็นหลัก** แทน localStorage เพื่อป้องกันข้อมูลหาย

## 🚀 **วิธีตั้งค่า Supabase (จำเป็น)**

### 1. สร้าง Project ใน Supabase
```
1. ไปที่ https://supabase.com
2. สร้างบัญชีใหม่หรือเข้าสู่ระบบ
3. คลิก "New Project"
4. ตั้งชื่อโปรเจ็กต์: "table-booking-system"
5. ตั้งรหัสผ่าน database
6. เลือก region: Southeast Asia (Singapore)
7. รอโปรเจ็กต์สร้างเสร็จ (2-3 นาที)
```

### 2. รัน SQL Script
```
1. เปิด SQL Editor ใน Supabase Dashboard
2. คลิก "New query"
3. Copy ไฟล์ supabase-setup.sql ทั้งหมด
4. Paste ลงใน SQL Editor
5. คลิก "Run" (Ctrl+Enter)
6. ตรวจสอบว่าได้ตาราง table_bookings และ activity_logs
```

### 3. Copy API Keys
```
1. ไปที่ Settings > API
2. Copy "Project URL"
3. Copy "anon/public key"
```

### 4. สร้างไฟล์ .env.local
```bash
# สร้างไฟล์ .env.local ในโฟลเดอร์หลัก
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. รีสตาร์ท Development Server
```bash
# ปิด npm run dev (Ctrl+C)
npm run dev
```

## ✅ **การทำงานของระบบใหม่**

### 📊 **Supabase เป็นหลัก:**
- ✅ ข้อมูลทั้งหมดบันทึกใน Supabase ทันที
- ✅ localStorage เป็นแค่ cache ชั่วคราว
- ✅ เมื่อเปิดเว็บใหม่ จะดึงข้อมูลจาก Supabase
- ✅ ข้อมูลไม่หายแม้ลบ cache เบราว์เซอร์

### ⚠️ **ถ้าไม่มี Supabase:**
- ❌ ข้อมูลจะหายเมื่อลบ cache เบราว์เซอร์
- ❌ ไม่สามารถแชร์ข้อมูลข้ามอุปกรณ์
- ❌ ไม่มีการสำรองข้อมูล
- ❌ ระบบจะแจ้งเตือนตลอดเวลา

## 🎯 **การใช้งาน**

### การทำงานปกติ:
1. **เปิดเว็บ** → ดึงข้อมูลจาก Supabase
2. **จองโต๊ะ** → บันทึกไป Supabase ทันที
3. **แก้ไขข้อมูล** → บันทึกไป Supabase ทันที
4. **Export Excel** → ข้อมูลจาก Supabase

### ปุ่มควบคุม:
- **☁️ บันทึกไป Supabase**: Force sync ข้อมูลไปคลาวด์
- **📥 ดึงจาก Supabase**: ดึงข้อมูลล่าสุดจากคลาวด์

## 🔍 **วิธีตรวจสอบว่าใช้งานได้**

### 1. Header แสดงสถานะ:
```
☁️ Supabase เป็นหลัก = ✅ ตั้งค่าสำเร็จ
⚠️ ไม่มี Supabase = ❌ ต้องตั้งค่า
```

### 2. Console Messages:
```javascript
✅ โหลดข้อมูลจาก Supabase สำเร็จ = ✅ ข้อมูลจากคลาวด์
🔄 กำลังบันทึกไป Supabase (หลัก) = ✅ กำลังบันทึก
✅ Sync ไป Supabase สำเร็จ - ข้อมูลถูกบันทึกในคลาวด์แล้ว ☁️ = ✅ บันทึกสำเร็จ
```

### 3. ทดสอบ:
```
1. จองโต๊ะ → ดู console ว่ามี "บันทึกไป Supabase"
2. เปิดเว็บแท็บใหม่ → ข้อมูลควร sync มา
3. ดูใน Supabase Dashboard → ควรเห็นข้อมูลใหม่
```

## 🆘 **Troubleshooting**

### ปัญหา: Header แสดง "⚠️ ไม่มี Supabase"
```
แก้ไข:
1. ตรวจสอบไฟล์ .env.local มีอยู่จริง
2. ตรวจสอบ URL และ Key ถูกต้อง
3. รีสตาร์ท npm run dev
```

### ปัญหา: Console แสดง "ไม่สามารถเชื่อมต่อ Supabase"
```
แก้ไข:
1. ตรวจสอบ internet connection
2. ตรวจสอบ Project URL ถูกต้อง
3. ตรวจสอบ RLS policies ใน Supabase
```

### ปัญหา: ข้อมูลไม่ sync
```
แก้ไข:
1. คลิกปุ่ม "☁️ บันทึกไป Supabase" 
2. ตรวจสอบ console มี error หรือไม่
3. ตรวจสอบ SQL tables ใน Supabase
```

## 📋 **Checklist การตั้งค่า**

- [ ] สร้าง Supabase Project
- [ ] รัน SQL Script สำเร็จ
- [ ] มีตาราง table_bookings และ activity_logs
- [ ] Copy URL และ Key จาก Settings > API
- [ ] สร้างไฟล์ .env.local
- [ ] รีสตาร์ท npm run dev
- [ ] Header แสดง "☁️ Supabase เป็นหลัก"
- [ ] ทดสอบจองโต๊ะและดู console
- [ ] ทดสอบเปิดแท็บใหม่ข้อมูล sync มา

## 🎉 **เมื่อตั้งค่าสำเร็จ**

ระบบจะ:
- ✅ บันทึกข้อมูลใน cloud อัตโนมัติ
- ✅ ข้อมูลไม่หายแม้ลบ cache
- ✅ ใช้งานได้หลายอุปกรณ์
- ✅ มีข้อมูล backup ใน cloud
- ✅ Export Excel จากข้อมูลล่าสุด

---
💡 **หมายเหตุ**: หากไม่ตั้งค่า Supabase ระบบจะใช้งานได้ แต่ข้อมูลจะหายเมื่อลบ cache เบราว์เซอร์
