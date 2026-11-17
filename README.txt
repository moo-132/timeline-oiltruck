Fuel Oil Operation — Google Sheets dashboard

เปิด dist/index.html ผ่านเว็บเซิร์ฟเวอร์เพื่อดูกราฟ เลือกวัน รีเฟรช และพิมพ์กราฟ
เปิด Google Sheets: https://docs.google.com/spreadsheets/d/1kaAYhEhTywYQEKrhFIqJDrcs4Zav0BhP97cl_sZ6Als/edit#gid=2062218599
แก้ไขข้อมูลในแท็บ FuelTrips แล้วกดรีเฟรชบนเว็บ ข้อมูลกราฟอ่านจากแท็บ WebData ที่เผยแพร่ไว้
หากอ่านข้อมูลไม่ได้ ให้ตรวจสิทธิ์การเผยแพร่ WebData และการเชื่อมต่ออินเทอร์เน็ต
ยกเลิกส่วนอัปโหลดภาพ/JSON วาง JSON ข้อมูลจำลอง ส่งออก JSON และยืนยันบันทึกจากหน้าเว็บแล้ว
หน้าเว็บไม่มีการเขียนข้อมูลลงชีต ข้อมูลรอตรวจทานยังแสดงเครื่องหมาย ⚠

สร้างชุด HTML สำหรับ Apps Script: cd fuel-oil-site แล้วรัน node build-package.cjs
อัปเดตหน้าเว็บด้วยไฟล์ใน dist; การแก้ไฟล์ในเครื่องยังไม่ใช่การเผยแพร่เว็บไซต์
