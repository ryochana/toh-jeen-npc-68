# PowerShell Script สำหรับแสดงค่า Environment Variables สำหรับ Vercel

Write-Host "🚀 ตั้งค่า Environment Variables ใน Vercel" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "1. ไปที่ Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Yellow
Write-Host "2. เลือกโปรเจ็กต์ toh-jeen-npc-68" -ForegroundColor Yellow  
Write-Host "3. ไป Settings > Environment Variables" -ForegroundColor Yellow
Write-Host "4. เพิ่มตัวแปรเหล่านี้:" -ForegroundColor Yellow
Write-Host ""

Write-Host "📊 GOOGLE SHEETS CONFIGURATION:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# อ่านไฟล์ .env
$envPath = ".\.env"
$envVars = @{}

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $envVars[$matches[1].Trim()] = $matches[2].Trim().Trim('"')
        }
    }
} else {
    Write-Host "⚠️  ไม่พบไฟล์ .env - กรุณาตั้งค่าก่อน" -ForegroundColor Red
}

$requiredVars = @(
    "VITE_GOOGLE_SHEET_ID",
    "GOOGLE_PROJECT_ID", 
    "GOOGLE_PRIVATE_KEY_ID",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CERT_URL"
)

foreach ($var in $requiredVars) {
    Write-Host "Variable Name: $var" -ForegroundColor White
    $value = $envVars[$var]
    if ($value) {
        if ($var -like "*KEY*") {
            Write-Host "Value: [มีค่า - ซ่อนเพื่อความปลอดภัย]" -ForegroundColor Green
        } else {
            Write-Host "Value: $value" -ForegroundColor Green
        }
    } else {
        Write-Host "Value: [ไม่พบค่า]" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "⚠️  สำหรับ GOOGLE_PRIVATE_KEY:" -ForegroundColor Yellow
Write-Host "ต้องคัดลอกทั้งหมดจาก private_key ในไฟล์ JSON รวมถึง:" -ForegroundColor Yellow
Write-Host "-----BEGIN PRIVATE KEY-----" -ForegroundColor Magenta
Write-Host "และ" -ForegroundColor Yellow
Write-Host "-----END PRIVATE KEY-----" -ForegroundColor Magenta
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ หลังจากตั้งค่าเสร็จแล้ว:" -ForegroundColor Green
Write-Host "1. ไป Deployments tab" -ForegroundColor Yellow
Write-Host "2. กด Redeploy โปรเจ็กต์" -ForegroundColor Yellow
Write-Host "3. ทดสอบการทำงาน" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# แสดงข้อมูล private key ถ้ามี
if ($envVars["GOOGLE_PRIVATE_KEY"]) {
    Write-Host ""
    Write-Host "🔑 GOOGLE_PRIVATE_KEY ที่ต้องใส่ใน Vercel:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host $envVars["GOOGLE_PRIVATE_KEY"] -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
}
