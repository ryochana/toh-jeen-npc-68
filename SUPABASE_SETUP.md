# การตั้งค่า Supabase สำหรับระบบจองโต๊ะ

## ขั้นตอนการตั้งค่า Supabase

### 1. สร้าง Project ใหม่ใน Supabase
1. ไปที่ [https://supabase.com](https://supabase.com)
2. สร้างบัญชีหรือเข้าสู่ระบบ
3. คลิก "New Project"
4. ตั้งชื่อ project และ password
5. เลือก region ที่ใกล้ที่สุด (แนะนำ Southeast Asia)

### 2. รัน SQL Script
1. ไปที่ SQL Editor ใน Supabase Dashboard
2. Copy ไฟล์ `supabase-setup.sql` ทั้งหมด
3. Paste และ Run คำสั่ง SQL
4. ตรวจสอบว่าตาราง `table_bookings` และ `activity_logs` ถูกสร้างแล้ว

### 3. ตั้งค่า Environment Variables
1. Copy ไฟล์ `.env.local.example` เป็น `.env.local`
2. ไปที่ Settings > API ใน Supabase Dashboard
3. คัดลอก URL และ anon key
4. แก้ไขไฟล์ `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. ทดสอบการเชื่อมต่อ
1. รีสตาร์ท development server: `npm run dev`
2. เปิดเว็บไซต์และดูใน Console
3. ถ้าเห็นข้อความ "Supabase เชื่อมต่อแล้ว" แสดงว่าสำเร็จ

## ฟีเจอร์ที่เพิ่มเข้ามา

### การ Sync ข้อมูล
- **Sync ไป Supabase**: บันทึกข้อมูลจาก localStorage ไป Supabase
- **ดึงจาก Supabase**: โหลดข้อมูลล่าสุดจาก Supabase
- **Auto Sync**: บันทึกอัตโนมัติเมื่อมีการเปลี่ยนแปลง

### Export Excel
- **รายการโต๊ะทั้งหมด**: ข้อมูลครบถ้วนทุกโต๊ะ
- **สรุปข้อมูล**: สถิติการจองต่างๆ
- **โต๊ะที่จองแล้ว**: เฉพาะโต๊ะที่มีการจอง
- **ภาษาไทย**: header และข้อมูลเป็นภาษาไทยทั้งหมด
- **เรียงตามลำดับ**: จัดเรียงตามหมายเลขโต๊ะ

## โครงสร้าง Database

### ตาราง table_bookings
- `id`: Primary key (UUID)
- `table_id`: รหัสโต๊ะ
- `table_display_name`: ชื่อแสดงของโต๊ะ
- `table_row`, `table_col`: ตำแหน่งแถว/คอลัมน์
- `table_position`: inside/outside
- `booking_name`: ชื่อผู้จอง
- `booking_phone`: เบอร์โทรศัพท์
- `booking_status`: confirmed/online
- `is_booked`: สถานะการจอง
- `booked_at`, `updated_at`, `created_at`: เวลาต่างๆ

### ตาราง activity_logs
- `id`: Primary key (UUID)
- `action`: การกระทำที่เกิดขึ้น
- `table_id`: รหัสโต๊ะที่เกี่ยวข้อง
- `user_name`: ชื่อผู้ใช้
- `timestamp`: เวลาที่เกิดเหตุการณ์
- `details`: รายละเอียดเพิ่มเติม (JSON)

## การทำงานของระบบ

### โหลดข้อมูล
1. ตรวจสอบการตั้งค่า Supabase
2. ถ้ามี: โหลดจาก Supabase ก่อน
3. ถ้าไม่มีหรือล้มเหลว: โหลดจาก localStorage
4. ถ้าไม่มีข้อมูล: สร้างโต๊ะเริ่มต้น 37 โต๊ะ

### บันทึกข้อมูล
1. บันทึกใน localStorage ทันที
2. ถ้าเปิดใช้งาน Supabase: sync ไปด้วย
3. แสดงสถานะการ sync ใน header

### ข้อดีของการใช้ทั้งคู่
- **ความเร็ว**: localStorage ทำงานเร็ว
- **ความปลอดภัย**: Supabase เก็บข้อมูลในคลาวด์
- **Offline Support**: ทำงานได้แม้ไม่มีอินเทอร์เน็ต
- **Multi-device**: ข้อมูลซิงค์ระหว่างอุปกรณ์

## การ Troubleshooting

### ปัญหา Supabase ไม่เชื่อมต่อ
1. ตรวจสอบ environment variables
2. ตรวจสอบ internet connection
3. ดู Console สำหรับ error messages
4. ตรวจสอบ RLS policies ใน Supabase

### ปัญหา Export Excel
1. ตรวจสอบว่า browser รองรับการดาวน์โหลดไฟล์
2. อนุญาตให้เว็บไซต์ดาวน์โหลดไฟล์
3. ตรวจสอบ popup blocker

### ปัญหาข้อมูลหาย
1. ข้อมูลยังอยู่ใน localStorage
2. ใช้ปุ่ม "ดึงจาก Supabase" เพื่อกู้คืน
3. ตรวจสอบ activity logs

## คำแนะนำการใช้งาน

### สำหรับการใช้งานจริง
1. ตั้งค่า Supabase ให้เรียบร้อย
2. ทดสอบการ sync ก่อนใช้งาน
3. Export ข้อมูลสำรองเป็นระยะ
4. ตรวจสอบ activity logs เป็นประจำ

### สำหรับ Development
1. สามารถใช้ localStorage อย่างเดียวได้
2. ไม่จำเป็นต้องตั้งค่า Supabase
3. ข้อมูลจะเก็บใน browser ของเครื่องนั้นๆ
