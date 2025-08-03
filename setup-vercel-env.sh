#!/bin/bash
# สคริปต์สำหรับตั้งค่า Environment Variables ใน Vercel

echo "🚀 ตั้งค่า Environment Variables ใน Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "1. ไปที่ Vercel Dashboard: https://vercel.com/dashboard"
echo "2. เลือกโปรเจ็กต์ toh-jeen-npc-68"
echo "3. ไป Settings > Environment Variables"
echo "4. เพิ่มตัวแปรเหล่านี้:"
echo ""

echo "📊 GOOGLE SHEETS CONFIGURATION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# อ่านค่าจากไฟล์ .env
source .env 2>/dev/null || echo "⚠️  ไม่พบไฟล์ .env - กรุณาตั้งค่าก่อน"

echo "Variable Name: VITE_GOOGLE_SHEET_ID"
echo "Value: ${VITE_GOOGLE_SHEET_ID:-'[ไม่พบค่า]'}"
echo ""

echo "Variable Name: GOOGLE_PROJECT_ID"  
echo "Value: ${GOOGLE_PROJECT_ID:-'[ไม่พบค่า]'}"
echo ""

echo "Variable Name: GOOGLE_PRIVATE_KEY_ID"
echo "Value: ${GOOGLE_PRIVATE_KEY_ID:-'[ไม่พบค่า]'}"
echo ""

echo "Variable Name: GOOGLE_CLIENT_EMAIL"
echo "Value: ${GOOGLE_CLIENT_EMAIL:-'[ไม่พบค่า]'}"
echo ""

echo "Variable Name: GOOGLE_CLIENT_ID"
echo "Value: ${GOOGLE_CLIENT_ID:-'[ไม่พบค่า]'}"
echo ""

echo "Variable Name: GOOGLE_CERT_URL"
echo "Value: ${GOOGLE_CERT_URL:-'[ไม่พบค่า]'}"
echo ""

echo "⚠️  สำหรับ GOOGLE_PRIVATE_KEY:"
echo "ต้องคัดลอกทั้งหมดจาก private_key ในไฟล์ JSON รวมถึง:"
echo "-----BEGIN PRIVATE KEY-----"
echo "และ"  
echo "-----END PRIVATE KEY-----"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ หลังจากตั้งค่าเสร็จแล้ว:"
echo "1. ไป Deployments tab"
echo "2. กด Redeploy โปรเจ็กต์"
echo "3. ทดสอบการทำงาน"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
