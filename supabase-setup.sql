-- สร้างตาราง table_bookings สำหรับเก็บข้อมูลการจองโต๊ะ
-- ไฟล์นี้จะไม่กระทบตารางที่มีอยู่แล้วใน Supabase

CREATE TABLE IF NOT EXISTS table_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id VARCHAR(50) NOT NULL,
  table_display_name VARCHAR(100) NOT NULL,
  table_row INTEGER,
  table_col INTEGER,
  table_position VARCHAR(20) DEFAULT 'inside', -- 'inside' หรือ 'outside'
  
  -- ข้อมูลผู้จอง
  booking_name VARCHAR(200),
  booking_phone VARCHAR(50),
  booking_status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed' หรือ 'online'
  
  -- ข้อมูลเวลา
  booked_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- สถานะโต๊ะ
  is_booked BOOLEAN DEFAULT FALSE,
  
  -- ข้อมูลเพิ่มเติม
  notes TEXT,
  
  UNIQUE(table_id)
);

-- สร้าง index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX IF NOT EXISTS idx_table_bookings_table_id ON table_bookings(table_id);
CREATE INDEX IF NOT EXISTS idx_table_bookings_is_booked ON table_bookings(is_booked);
CREATE INDEX IF NOT EXISTS idx_table_bookings_position ON table_bookings(table_position);
CREATE INDEX IF NOT EXISTS idx_table_bookings_created_at ON table_bookings(created_at);

-- สร้างตาราง activity_logs สำหรับเก็บประวัติการดำเนินการ
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  table_id VARCHAR(50),
  user_name VARCHAR(100) DEFAULT 'ระบบ',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);

-- สร้าง index สำหรับ activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_id ON activity_logs(table_id);

-- สร้าง function สำหรับอัพเดท updated_at โดยอัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับอัพเดท updated_at
DROP TRIGGER IF EXISTS update_table_bookings_updated_at ON table_bookings;
CREATE TRIGGER update_table_bookings_updated_at
  BEFORE UPDATE ON table_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- สร้าง Row Level Security (RLS) policies
ALTER TABLE table_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ลบ policy เก่าถ้ามี
DROP POLICY IF EXISTS "Allow public access to table_bookings" ON table_bookings;
DROP POLICY IF EXISTS "Allow public access to activity_logs" ON activity_logs;

-- Policy สำหรับ table_bookings (อนุญาตให้ทุกคนอ่านและเขียนได้)
CREATE POLICY "Allow public access to table_bookings" 
ON table_bookings FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Policy สำหรับ activity_logs (อนุญาตให้ทุกคนอ่านและเขียนได้)
CREATE POLICY "Allow public access to activity_logs" 
ON activity_logs FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- คำสั่งตัวอย่างสำหรับการ query ข้อมูล
-- SELECT * FROM table_bookings ORDER BY table_id;
-- SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50;
