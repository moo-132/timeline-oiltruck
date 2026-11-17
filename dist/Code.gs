const SPREADSHEET_ID='1IvEAlZuGpsNcPPay6fNCSEMOqGySaljFZpctQVawtbo';
const TAB='FuelTrips';
const HEADERS=['Date','Plate','Province','GateIn','GateOut','Document','Trip','DedupKey','ImportedAt'];
function doGet(){return HtmlService.createHtmlOutputFromFile('Index').setTitle('Fuel Oil Operation');}
function identity_(){if(!Session.getActiveUser().getEmail())throw Error('ต้องลงชื่อเข้าใช้ Google ที่มีสิทธิ์ชีต และ Deploy แบบ execute as user accessing');}
function sheet_(){return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(TAB);}
function read_(sheet){if(!sheet)return [];if(JSON.stringify(sheet.getRange(1,1,1,9).getDisplayValues()[0])!==JSON.stringify(HEADERS))throw Error('หัวตาราง FuelTrips ไม่ตรงกับแมป หยุดเพื่อป้องกันข้อมูลเดิม');const n=sheet.getLastRow();if(n>10001)throw Error('ข้อมูลเกินขอบเขต 10,000 แถว ต้องปรับระบบก่อน');if(n<2)return [];return sheet.getRange(2,1,n-1,9).getDisplayValues().map(r=>({date:r[0],plate:r[1],province:r[2],gateIn:r[3],gateOut:r[4],document:r[5],trip:Number(r[6]),key:r[7],start:Fuel.time(r[3]),end:r[4]?(Fuel.time(r[4])<Fuel.time(r[3])?Fuel.time(r[4])+1440:Fuel.time(r[4])):null}));}
function getTrips(){identity_();return read_(sheet_());}
function saveTrips(input){identity_();if(!Array.isArray(input)||!input.length||input.length>1000)throw Error('จำนวนรายการต้องอยู่ระหว่าง 1–1,000');const lock=LockService.getScriptLock();lock.waitLock(30000);try{let sheet=sheet_();const old=read_(sheet);const rows=Fuel.analyze(input,old);if(rows.some(r=>r.errors.length))throw Error('พบข้อมูลซ้ำหรือข้อมูลไม่สมบูรณ์ กรุณาโหลดใหม่และตรวจทาน');for(const r of rows){if([r.plate,r.province,r.document].some(v=>/^[=+@-]/.test(v)||v.length>150))throw Error('ข้อความไม่ถูกต้อง');if(old.some(e=>e.date===r.date&&e.plate===r.plate&&e.province===r.province&&Fuel.time(e.gateIn)>=r.start))throw Error('พบรายการย้อนหลังที่เปลี่ยนเลขเที่ยวเดิม ต้องตรวจทานแยกก่อน');}if(old.length+rows.length>10000)throw Error('ข้อมูลเกินขอบเขต');if(!sheet){sheet=SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(TAB);sheet.getRange(1,1,1,9).setValues([HEADERS]);sheet.setFrozenRows(1);}const values=rows.map(r=>[r.date,r.plate,r.province,r.gateIn,r.gateOut,r.document,r.trip,r.key,new Date().toISOString()]);sheet.getRange(sheet.getLastRow()+1,1,values.length,9).setNumberFormat('@').setValues(values);SpreadsheetApp.flush();return {count:values.length};}finally{lock.releaseLock();}}

// GENERATED_FUEL_LOGIC
(function(root){
const normalize=s=>String(s||'').normalize('NFKC').trim().toUpperCase().replace(/[\s‐‑–—-]/g,'');
const time=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s)?Number(s.slice(0,2))*60+Number(s.slice(3)):NaN;
function analyze(input,existing=[]){
 if(!Array.isArray(input)||input.length>1000)throw Error('ต้องเป็นรายการ JSON ไม่เกิน 1,000 แถว');
 const keys=new Set(existing.map(r=>r.key)), docs=new Set(existing.filter(r=>r.document).map(r=>r.date+'|'+r.document));
 const rows=input.map((r,i)=>{const x={date:String(r.date||''),plate:normalize(r.plate),province:normalize(r.province),gateIn:String(r.gateIn||''),gateOut:String(r.gateOut||''),document:String(r.document||'').trim(),index:i,errors:[]};
 if(r.reviewRequired)x.errors.push('ต้องยืนยันภาพ: '+String(r.sourceNote||''));
 x.start=time(x.gateIn);x.end=x.gateOut?time(x.gateOut):null;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||!Number.isFinite(Date.parse(x.date))||new Date(x.date).toISOString().slice(0,10)!==x.date)x.errors.push('วันที่ไม่ถูกต้อง ใช้ ค.ศ.');
 if(!x.plate||!x.province||!Number.isFinite(x.start)||(x.gateOut&&!Number.isFinite(x.end)))x.errors.push('ทะเบียน จังหวัด หรือเวลาไม่ครบ/ผิด');
 if(x.end!==null&&x.end<x.start)x.end+=1440;
 x.key=[x.date,x.plate,x.province,x.gateIn].join('|');
 if(keys.has(x.key))x.errors.push('รายการซ้ำ'); keys.add(x.key);
 const d=x.date+'|'+x.document;if(x.document&&docs.has(d))x.errors.push('เลขเอกสารซ้ำ');if(x.document)docs.add(d);
 return x;});
 const combined=[...existing.map(r=>({...r,start:time(r.gateIn),old:true})),...rows].sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start);
 const count={};for(const r of combined){if(r.errors?.length)continue;const k=[r.date,r.plate,r.province].join('|');r.trip=count[k]=(count[k]||0)+1;if(!r.old&&r.trip>2)r.errors.push('เกิน 2 เที่ยว ต้องตรวจทาน');}
 return rows;
}
root.Fuel={normalize,time,analyze};if(typeof module!=='undefined')module.exports=root.Fuel;
})(typeof globalThis!=='undefined'?globalThis:this);
