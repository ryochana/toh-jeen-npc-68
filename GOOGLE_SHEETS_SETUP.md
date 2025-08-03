# การตั้งค่า Google Sheets Integration

## ขั้นตอนที่ 1: เตรียม Google Sheets

1. **Google Sheets ของคุณ**: https://docs.google.com/spreadsheets/d/1cEdeOnCyDjLJNzTAhGCuKVESQv4hyGd3zLRiNHbG5e0/edit
2. **สร้าง 3 แท็บ** ในชีตของคุณ:
   - `Tables` - สำหรับข้อมูลโต๊ะทั้งหมด
   - `Bookings` - สำหรับข้อมูลการจอง
   - `ActivityLog` - สำหรับประวัติกิจกรรม

## ขั้นตอนที่ 2: สร้าง Google Service Account

1. **ไปที่ Google Cloud Console**: https://console.cloud.google.com/
2. **สร้างโปรเจ็กต์ใหม่** หรือเลือกโปรเจ็กต์ที่มีอยู่
3. **เปิด Google Sheets API**:
   - ไป APIs & Services > Library
   - ค้นหา "Google Sheets API"
   - คลิก Enable

4. **สร้าง Service Account**:
   - ไป APIs & Services > Credentials
   - คลิก "Create Credentials" > "Service Account"
   - ตั้งชื่อ เช่น "table-booking-service"
   - คลิก "Create and continue"
   - เลือก Role: "Editor" (หรือ "Basic > Editor")
   - คลิก "Continue" และ "Done"

5. **สร้าง Key สำหรับ Service Account**:
   - คลิกที่ Service Account ที่สร้าง
   - ไปแท็บ "Keys"
   - คลิก "Add Key" > "Create new key"
   - เลือก "JSON"
   - ดาวน์โหลดไฟล์ JSON

6. **แชร์ Google Sheets ให้ Service Account**:
   - คัดลอก ีเมล์ของ Service Account จากไฟล์ JSON (client_email)
   - แชร์ Google Sheets ให้กับอีเมล์นี้ โดยให้สิทธิ์ "Editor"

## ขั้นตอนที่ 3: อัปเดตไฟล์ .env

จากไฟล์ JSON ที่ดาวน์โหลด ให้คัดลอกข้อมูลมาใส่ในไฟล์ `.env`:

```
VITE_GOOGLE_SHEET_ID=1cEdeOnCyDjLJNzTAhGCuKVESQv4hyGd3zLRiNHbG5e0
GOOGLE_PROJECT_ID=project_id_from_json
GOOGLE_PRIVATE_KEY_ID=private_key_id_from_json
GOOGLE_PRIVATE_KEY="private_key_from_json"
GOOGLE_CLIENT_EMAIL=client_email_from_json
GOOGLE_CLIENT_ID=client_id_from_json
GOOGLE_CERT_URL=auth_provider_x509_cert_url_from_json
```

## ขั้นตอนที่ 4: ทดสอบการเชื่อมต่อ

หลังจากตั้งค่าเรียบร้อยแล้ว:
1. รีสตาร์ทแอป (`npm run dev`)
2. ลองกดปุ่ม "📊 Sync Sheets" ในแอป
3. ตรวจสอบว่าข้อมูลถูกส่งไป Google Sheets หรือไม่

## หมายเหตุ
- ไฟล์ `.env` จะถูก ignore โดย Git เพื่อความปลอดภัย
- ห้ามแชร์ข้อมูล Service Account กับผู้อื่น
- ถ้ามีปัญหา ตรวจสอบ Console ของเบราว์เซอร์ (กด F12)
