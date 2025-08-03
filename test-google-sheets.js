// ตัวช่วยทดสอบการเชื่อมต่อ Google Sheets
// รันด้วยคำสั่ง: node test-google-sheets.js

const fs = require('fs')
const path = require('path')

// อ่านไฟล์ .env แบบง่าย ๆ
function loadEnv() {
  const envPath = path.join(__dirname, '.env')
  if (!fs.existsSync(envPath)) {
    console.log('❌ ไม่พบไฟล์ .env')
    return {}
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env = {}
  
  envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim()
        // ลบ quotes ถ้ามี
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        env[key.trim()] = value
      }
    }
  })
  
  return env
}

const env = loadEnv()

console.log('🔍 ตรวจสอบการตั้งค่า Google Sheets...\n')

// ตรวจสอบ environment variables
const requiredEnvs = [
  'VITE_GOOGLE_SHEET_ID',
  'GOOGLE_PROJECT_ID', 
  'GOOGLE_PRIVATE_KEY_ID',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CERT_URL'
]

let allConfigured = true

requiredEnvs.forEach(envKey => {
  if (env[envKey]) {
    console.log(`✅ ${envKey}: ${envKey.includes('KEY') ? '[มีค่า - ซ่อนเพื่อความปลอดภัย]' : env[envKey]}`)
  } else {
    console.log(`❌ ${envKey}: ไม่ได้ตั้งค่า`)
    allConfigured = false
  }
})

console.log('\n📋 สรุปผล:')
if (allConfigured) {
  console.log('✅ การตั้งค่าครบถ้วน - พร้อมใช้งาน!')
  console.log('🔗 Google Sheets: https://docs.google.com/spreadsheets/d/' + env.VITE_GOOGLE_SHEET_ID)
} else {
  console.log('❌ การตั้งค่าไม่ครบถ้วน - กรุณาตั้งค่า environment variables ที่ขาดหายใน .env')
  console.log('📖 อ่านวิธีการตั้งค่าใน GOOGLE_SHEETS_SETUP.md')
}

console.log('\n💡 เมื่อตั้งค่าเรียบร้อยแล้ว ให้รีสตาร์ทแอปด้วยคำสั่ง: npm run dev')
