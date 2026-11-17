// Read-only public WebData feed. No Google credentials or AI calls in the browser.
window.FuelSheet={load(){return new Promise((resolve,reject)=>{
 const callback='fuelSheetLoaded_'+Date.now();const script=document.createElement('script');
 const cleanup=()=>{clearTimeout(timer);script.remove();delete window[callback]};
 const timer=setTimeout(()=>{cleanup();reject(Error('อ่าน Google Sheets ไม่สำเร็จ กรุณาตรวจการเผยแพร่แท็บ WebData แล้วกดรีเฟรช'))},20000);
 window[callback]=response=>{cleanup();if(response.status!=='ok')return reject(Error('Google Sheets ยังไม่เปิดให้อ่านแท็บ WebData'));try{
 const rows=response.table.rows.filter(r=>r.c?.[1]?.v).map(r=>{const c=r.c.map(x=>x?.v??'');const date=c[0] instanceof Date?[c[0].getFullYear(),String(c[0].getMonth()+1).padStart(2,'0'),String(c[0].getDate()).padStart(2,'0')].join('-'):String(c[0]).slice(0,10);const time=x=>Array.isArray(x)?String(x[0]).padStart(2,'0')+':'+String(x[1]).padStart(2,'0'):String(x);return {date,plate:String(c[1]),province:String(c[2]),gateIn:time(c[3]),gateOut:time(c[4]),trip:Number(c[5]),unloading:time(c[6]),volume:Number(c[7])||0,sourceRow:c[8],reviewRequired:String(c[9])!=='ยืนยันแล้ว',sourceNote:String(c[9])}});resolve(rows)
 }catch(e){reject(Error('รูปแบบข้อมูลชีตไม่ถูกต้อง: '+e.message))}};
 script.onerror=()=>{cleanup();reject(Error('เชื่อม Google Sheets ไม่สำเร็จ'))};
 script.src='https://docs.google.com/spreadsheets/d/1kaAYhEhTywYQEKrhFIqJDrcs4Zav0BhP97cl_sZ6Als/gviz/tq?gid=1892346793&range=A1%3AJ1000&headers=1&tqx='+encodeURIComponent('out:json;responseHandler:'+callback)+'&tq='+encodeURIComponent('select *')+'&_='+Date.now();document.head.append(script);
})}};
