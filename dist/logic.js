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
 const count={};for(const r of combined){if(r.errors?.length)continue;const k=[r.date,r.plate,r.province].join('|');r.trip=count[k]=(count[k]||0)+1;if(!r.old&&r.trip>3)r.errors.push('เกิน 3 เที่ยว ต้องตรวจทาน');}
 return rows;
}
root.Fuel={normalize,time,analyze};if(typeof module!=='undefined')module.exports=root.Fuel;
})(typeof globalThis!=='undefined'?globalThis:this);
