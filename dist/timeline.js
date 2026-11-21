(async()=>{
const host=document.getElementById('nativeTimeline');
host.innerHTML=`<div class="tl-title"><span class="truck">▰</span><div><h1>บันทึกการรับน้ำมันดีเซล โรงไฟฟ้าจะนะ</h1><p>โรงไฟฟ้าจะนะ จ.สงขลา ｜ เลือกวันที่จาก Google Sheets ｜ ป้อม 1</p></div></div><div class="tl-tools"><div class="tl-tools-left"><label class="tl-date-wrap" title="เลือกวันที่"><svg class="tl-calendar-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 3v4M17 3v4M3 10h18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><select id="tlDateSelect" class="tl-date-select" aria-label="เลือกวันที่ข้อมูลใน Google Sheets" hidden></select><button type="button" id="tlCalendarButton" class="tl-calendar-button" aria-haspopup="dialog" aria-expanded="false" aria-controls="tlCalendarPanel">เลือกวันที่ ▾</button></label><div id="tlCalendarPanel" class="tl-calendar-panel" role="dialog" aria-label="เลือกวันที่จากปฏิทิน" hidden><div class="tl-cal-head"><button type="button" id="tlCalPrev" aria-label="เดือนก่อน">‹</button><strong id="tlCalMonth"></strong><button type="button" id="tlCalNext" aria-label="เดือนถัดไป">›</button></div><div id="tlCalGrid" class="tl-cal-grid"></div><div class="tl-cal-hint">วันที่มีข้อมูลเลือกได้ · วันเสาร์–อาทิตย์แสดงสีแยก</div></div></div><div class="tl-tools-right"><button id="tlRefresh" class="tl-icon-btn" title="รีเฟรชจาก Google Sheets" aria-label="รีเฟรชจาก Google Sheets"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.8 9a7 7 0 0 1 12.5-2L20 12M4 12l1.7 5A7 7 0 0 0 18.2 15"/></svg></button><button id="tlExportPng" class="tl-icon-btn" title="บันทึกภาพ PNG" aria-label="บันทึกภาพ PNG"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M6 16l4-4 3 3 3-4 3 5"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/></svg></button><button id="tlExportTimelinePng" class="tl-icon-btn tl-export-timeline-btn" title="บันทึก PNG เฉพาะ Timeline (ไม่รวมกราฟ PCU)" aria-label="บันทึก PNG เฉพาะ Timeline ไม่รวม PCU"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M6 9h12M6 13h12M6 17h8"/></svg><span>PNG Timeline</span></button><button id="tlPrint" class="tl-icon-btn" title="พิมพ์กราฟ" aria-label="พิมพ์กราฟ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7zM17 11h1"/></svg></button><a id="tlOpenSheet" class="tl-icon-btn" href="https://docs.google.com/spreadsheets/d/1kaAYhEhTywYQEKrhFIqJDrcs4Zav0BhP97cl_sZ6Als/edit#gid=2062218599" target="_blank" rel="noopener noreferrer" title="เปิด Google Sheets" aria-label="เปิด Google Sheets"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 4h7v7M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></svg></a></div></div><div class="tl-travel-controls"><label class="tl-travel-toggle"><input type="checkbox" id="tlShowTravel"><span>แสดงเส้นทางไป–กลับและเติมน้ำมันที่คลัง</span></label><span class="tl-travel-help" id="tlTravelHelp">ขามา / ขากลับ 60 นาที · ช่วงเติมที่คลังคำนวณจากเวลาระหว่างเที่ยว (ประมาณ)</span><div id="tlTravelSortControls" class="tl-travel-sort-controls" hidden><label>เรียงกลุ่มรถตาม <select id="tlTravelSortKey" aria-label="เกณฑ์เรียงกลุ่มรถ"><option value="firstIn">Gate In เที่ยวแรก</option><option value="secondIn">Gate In เที่ยว 2</option><option value="secondOut">Gate Out เที่ยว 2</option></select></label><label>ลำดับ <select id="tlTravelSortDirection" aria-label="ทิศทางเรียงกลุ่มรถ"><option value="asc">ก่อนไปหลัง</option><option value="desc">หลังไปก่อน</option></select></label></div></div><p id="tlNote" class="muted">กำลังอ่าน Google Sheets…</p><div id="tlKpis" class="tl-kpis"></div><div class="tl-overflow"><table class="tl-table"><thead><tr><th>ลำดับ<br><small id="tlOrderLabel">(ตามเวลา Unloading)</small></th><th>รอบที่</th><th>เลขทะเบียนรถ</th><th>เวลาเข้า</th><th>เวลา Unloading</th><th>เวลาออก</th><th>ปริมาณรับ<br><small>(ลิตร @86°F)</small></th><th class="tl-chart-head">ช่วงเวลาปฏิบัติงาน (เวลาเข้า – ออก ในโรงไฟฟ้า)<div id="tlAxis"></div></th></tr></thead><tbody id="tlBody"></tbody></table></div><div class="tl-legend"><b>สัญลักษณ์</b><span><i class="tl-swatch purple"></i>รถที่วิ่ง 3 รอบในวันเดียว</span><span><i class="tl-swatch teal"></i>รถที่วิ่ง 2 รอบในวันเดียว</span><span><i class="tl-swatch orange"></i>รถที่วิ่ง 1 รอบในวันเดียว</span><span>💧 เวลา Unloading (รับน้ำมันลงถัง)</span><span class="tl-travel-legend" hidden><i class="tl-swatch tl-swatch-in"></i>วิ่งมาจากคลัง 60 นาที</span><span class="tl-travel-legend" hidden><i class="tl-swatch tl-swatch-out"></i>กลับคลัง 60 นาที</span><span class="tl-travel-legend" hidden><i class="tl-swatch tl-swatch-depot"></i>ช่วงเติมที่คลัง (ประมาณ)</span><span id="tlReviewLegend" hidden>⚠ ลายมือต้องยืนยัน</span></div><section id="pcuCard" class="pcu-card" aria-label="กราฟปริมาณรถบรรทุกน้ำมันบนถนนสูงสุดรายชั่วโมง" hidden><h2 class="pcu-title">ปริมาณรถบรรทุกน้ำมันบนถนนสูงสุดรายชั่วโมง (PCU)</h2><p class="pcu-subtitle">คำนวณรถพร้อมกันสูงสุดทุก 1 นาที · เวลาเดินทางขามาและขากลับ 60 นาที · รถบรรทุก 2.5 PCU/คัน · Safety Factor 1.10</p><div class="pcu-summary" aria-live="polite"></div><div class="pcu-graphic"></div><div class="pcu-hour-detail" aria-live="polite"></div><div class="pcu-legend"><span><i class="pcu-key pcu-key-normal"></i>ไม่เกินเกณฑ์</span><span><i class="pcu-key pcu-key-high"></i>มากกว่า 38 PCU</span><span><i class="pcu-key pcu-key-limit"></i>เส้นอ้างอิง 38 PCU</span></div><p class="pcu-footnote">แสดงจำนวนรถพร้อมกันสูงสุดที่แปลงเป็น PCU ไม่ใช่อัตราการไหลของจราจร (PCU/ชั่วโมง) และเส้น 38 PCU เป็นค่าอ้างอิงเพื่อบริหารรถ ไม่ใช่เกณฑ์ตัดสิน EIA โดยตรง</p></section>`;
const minutes=s=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(s||''))throw Error('เวลาต้องเป็น HH:mm');return +s.slice(0,2)*60 + +s.slice(3)};

// Use a raster oil-drop marker so full-report PNG exports retain every marker.
function makeOilDropPng(){
 const cv=document.createElement('canvas');cv.width=48;cv.height=60;
 const g=cv.getContext('2d');g.save();g.scale(3,3);
 const p=new Path2D('M8 1 C6 4 2 8 2 12 A6 6 0 0 0 14 12 C14 8 10 4 8 1 Z');
 g.shadowColor='rgba(90,51,24,.45)';g.shadowBlur=2;g.shadowOffsetY=1.5;
 const fill=g.createLinearGradient(3,4,14,17);
 fill.addColorStop(0,'#f8dfb1');fill.addColorStop(.35,'#dbaf78');fill.addColorStop(.72,'#b37c48');fill.addColorStop(1,'#8d582f');
 g.fillStyle=fill;g.fill(p);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
 g.lineWidth=.85;g.strokeStyle='#fff2d8';g.stroke(p);
 g.beginPath();g.moveTo(6.3,6.5);g.quadraticCurveTo(4.1,9.4,5,11.2);
 g.strokeStyle='rgba(255,250,229,.92)';g.lineWidth=1.4;g.lineCap='round';g.stroke();
 g.restore();return cv.toDataURL('image/png');
}
const oilDropPng=makeOilDropPng();

function render(data,note){
if(!Array.isArray(data)||!data.length||data.length>1000)throw Error('ต้องเป็นข้อมูล 1–1,000 แถว');
const counts={},rounds={};let rows=data.map(r=>{const x={...r,plate:String(r.plate||''),province:String(r.province||''),date:String(r.date||'2026-11-16'),volume:Number(r.volume)||0};if(!x.plate)throw Error('ต้องมีทะเบียน');x.start=minutes(x.gateIn);x.finish=x.gateOut?minutes(x.gateOut):null;if(x.finish!==null&&x.finish<x.start)x.finish+=1440;const rawUnload=x.unloading?minutes(x.unloading):null;let candidate=rawUnload;if(candidate!==null&&x.finish!==null&&x.finish>=1440&&candidate<x.start)candidate+=1440;x.unload=(candidate!==null&&x.finish!==null&&candidate>=x.start&&candidate<=x.finish)?candidate:x.start;x.unloadFallback=(rawUnload===null||x.unload!==candidate);x.id=x.date+'|'+Fuel.normalize(x.plate)+'|'+Fuel.normalize(x.province);counts[x.id]=(counts[x.id]||0)+1;return x});
if(new Set(rows.map(r=>r.date)).size>1)throw Error('กรุณาเลือกข้อมูลครั้งละหนึ่งวัน');
const keys=new Set();for(const r of rows){const key=r.id+'|'+r.start;if(keys.has(key))throw Error('พบทะเบียนและเวลาเข้าซ้ำ');keys.add(key)}
rows.sort((a,b)=>a.start-b.start);for(const r of rows)r.round=rounds[r.id]=(rounds[r.id]||0)+1;
// Both views rank EVERY trip by Gate In, with Unloading as the tiebreak.
// Travel mode changes presentation only: rows of the same vehicle stay together.
rows.sort((a,b)=>a.start-b.start||a.unload-b.unload);
rows.forEach((item,index)=>{item.originalOrder=index+1});
const showTravel=document.getElementById('tlShowTravel').checked;
const travelSortControls=document.getElementById('tlTravelSortControls');
travelSortControls.hidden=!showTravel;
if(showTravel){
 const sortKey=document.getElementById('tlTravelSortKey').value;
 const direction=document.getElementById('tlTravelSortDirection').value==='desc'?-1:1;
 // All trips remain on the first row for that plate. Sorting changes the
 // ordering of vehicle groups only, never the order of trips within a group.
 const cycles=new Map();
 for(const r of rows){
  const trips=cycles.get(r.id)||[];
  trips.push(r);cycles.set(r.id,trips);
 }
 const groupMeta=new Map();
 for(const [plate,trips] of cycles){
  const first=trips[0],second=trips[1];
  const chosen=sortKey==='secondIn'?second?.start:sortKey==='secondOut'?second?.finish:first.start;
  groupMeta.set(plate,{chosen:chosen??null,first:first.start,firstUnload:first.unload,firstOrder:first.originalOrder});
 }
 rows.sort((a,b)=>{
  const aa=groupMeta.get(a.id),bb=groupMeta.get(b.id);
  // Vehicles with no second trip (or without Gate Out) always appear last,
  // regardless of ascending / descending selection.
  if(aa.chosen===null&&bb.chosen!==null)return 1;
  if(bb.chosen===null&&aa.chosen!==null)return -1;
  const order=aa.chosen!==null&&bb.chosen!==null?direction*(aa.chosen-bb.chosen):0;
  return order||aa.first-bb.first||aa.firstUnload-bb.firstUnload||aa.firstOrder-bb.firstOrder||a.start-b.start||a.unload-b.unload||a.originalOrder-b.originalOrder;
 });
}
document.getElementById('tlOrderLabel').textContent=showTravel?'(ลำดับ Gate In · จัดกลุ่มตามทะเบียน)':'(ตามเวลา Gate In → Unloading)';
const byTruck=new Map();
const cyclesByTruck=new Map();
for(const row of [...rows].sort((a,b)=>a.start-b.start)){const cycles=cyclesByTruck.get(row.id)||[];cycles.push(row);cyclesByTruck.set(row.id,cycles)}
for(const r of [...rows].sort((a,b)=>a.start-b.start)){
 const prev=byTruck.get(r.id);
 // Depot dwell is inferred, not measured. Only display when the recorded gap can fit both 60-min drives.
 if(prev&&prev.finish!==null){
  const depotStart=prev.finish+60,depotEnd=r.start-60;
  if(depotEnd>=depotStart)r.depot={start:depotStart,end:depotEnd,previous:prev};
 }
 byTruck.set(r.id,r);
}
const baseMin=Math.min(...rows.map(r=>r.start)),baseMax=Math.max(...rows.map(r=>r.finish??r.start),...rows.map(r=>r.unload??r.start));
// Do not extend the chart axis earlier than 06:00, even if the modeled trip begins before that.
const min=Math.max(6*60,Math.floor((showTravel?baseMin-60:baseMin)/60)*60);
const max=Math.max(min+60,Math.ceil((showTravel?Math.max(...rows.map(r=>(r.finish??r.start)+60)):baseMax)/60)*60),span=max-min;
host.querySelectorAll('.tl-travel-legend').forEach(el=>{el.hidden=!showTravel});
const fmt=n=>String(Math.floor(n/60)%24).padStart(2,'0')+':'+String(n%60).padStart(2,'0')+(n>=1440?' +1 วัน':'');
const qty=rows.reduce((s,r)=>s+r.volume,0),durations=rows.filter(r=>r.finish!==null).map(r=>r.finish-r.start),avg=durations.length?Math.round(durations.reduce((a,b)=>a+b)/durations.length):null;
const values=[['⟳','จำนวนรอบรวม',rows.length+' รอบ'],['◕','ปริมาณที่รับรวม',qty?qty.toLocaleString('th-TH',{maximumFractionDigits:2})+' ลิตร':'—'],['▤','ปริมาณเฉลี่ยต่อรอบ',qty?(qty/rows.length).toLocaleString('th-TH',{maximumFractionDigits:1})+' ลิตร/รอบ':'—'],['⇥','เวลาเข้าพื้นที่เร็วสุด',fmt(Math.min(...rows.map(r=>r.start)))+' น.'],['⇤','เวลาออกจากพื้นที่ช้าสุด',durations.length?fmt(Math.max(...rows.filter(r=>r.finish!==null).map(r=>r.finish)))+' น.':'—'],['◷','ระยะเวลาเฉลี่ยในพื้นที่',avg===null?'—':Math.floor(avg/60)+' ชม. '+String(avg%60).padStart(2,'0')+' นาที'],['▰','จำนวนรถบรรทุก',Object.values(counts).filter(n=>n===3).length+' คัน วิ่ง 3 รอบ / '+Object.values(counts).filter(n=>n===2).length+' คัน วิ่ง 2 รอบ / '+Object.values(counts).filter(n=>n===1).length+' คัน วิ่ง 1 รอบ'+(Object.values(counts).some(n=>n>3)?' / '+Object.values(counts).filter(n=>n>3).length+' คัน เกิน 3 รอบ':'')]];
const kpis=document.getElementById('tlKpis');kpis.replaceChildren();for(const [icon,label,value]of values){const card=document.createElement('div');card.className='tl-kpi';const small=document.createElement('div');small.textContent=icon+'  '+label;const strong=document.createElement('strong');strong.textContent=value;card.append(small,strong);kpis.append(card)}
const axis=document.getElementById('tlAxis');axis.replaceChildren();for(let t=min;t<=max;t+=60){const tick=document.createElement('span');tick.style.left=(t-min)/span*100+'%';tick.textContent=fmt(t);axis.append(tick)}
const reviewLegend=document.getElementById('tlReviewLegend');if(reviewLegend)reviewLegend.hidden=!rows.some(r=>r.reviewRequired);
const body=document.getElementById('tlBody');body.replaceChildren();
for(const [i,r] of rows.entries()){
 const tr=document.createElement('tr');
 if(showTravel&&r.round===1&&i>0)tr.classList.add('tl-truck-group-start');
 // Keep the original sheet-wide round identifier: e.g. round 21 remains 21,
 // even if this is the second trip made by a particular vehicle.
 const reportedRound=Number.isInteger(Number(r.trip))&&Number(r.trip)>0?Number(r.trip):r.round;
 for(const v of [r.originalOrder,reportedRound,r.plate+(r.reviewRequired?' ⚠':''),r.gateIn,r.unloadFallback?r.gateIn:r.unloading,r.gateOut||'—',r.volume>0?r.volume.toLocaleString('th-TH',{maximumFractionDigits:2}):'—']){
  const td=document.createElement('td');td.textContent=v;if(r.reviewRequired)td.title=r.sourceNote||'ต้องตรวจทาน';tr.append(td)
 }
 const cell=document.createElement('td');cell.className='tl-chart';cell.style.setProperty('--step',60/span*100+'%');
 if(showTravel&&r.round===1)cell.classList.add('tl-combined-chart');
 // When the checkbox is on, all runs of one plate are drawn along its first
 // row. Other rows retain real gate/unload/round figures, but no duplicate bars.
 const cycles=showTravel?(r.round===1?cyclesByTruck.get(r.id):[]):[r];
 const addSegment=(trip,start,end,cssClass,description,extra={})=>{
  if(!(end>start)||end<=min||start>=max)return null;
  const visibleStart=Math.max(start,min),visibleEnd=Math.min(end,max);
  const segment=document.createElement('div');
  segment.className=cssClass==='tl-unloading-dark'?'tl-unloading-dark '+(counts[trip.id]>=3?'purple':counts[trip.id]===2?'teal':'orange'):'tl-trip-segment '+cssClass;
  segment.style.left=(visibleStart-min)/span*100+'%';
  segment.style.width=(visibleEnd-visibleStart)/span*100+'%';
  segment.title=trip.plate+' · '+description+' · '+fmt(start)+'–'+fmt(end);
  for(const [name,value]of Object.entries(extra))segment.dataset[name]=value;
  cell.append(segment);return segment;
 };
 for(const trip of cycles){
  if(showTravel)addSegment(trip,trip.start-60,trip.start,'tl-trip-in','เดินทางจากคลังมายังโรงไฟฟ้า (ประมาณ 60 นาที)');
  const bar=document.createElement('div');
  bar.className='tl-bar '+(counts[trip.id]>=3?'purple':counts[trip.id]===2?'teal':'orange');
  const visibleStart=Math.max(min,trip.start),visibleEnd=Math.min(max,trip.finish??trip.start);
  bar.style.left=(visibleStart-min)/span*100+'%';
  bar.style.width=Math.max(.2,Math.max(0,visibleEnd-visibleStart)/span*100)+'%';
  if((trip.finish??trip.start)<=min||trip.start>=max)bar.style.display='none';
  const tripRound=Number.isInteger(Number(trip.trip))&&Number(trip.trip)>0?trip.trip:trip.round;
  bar.title=trip.plate+' รอบ '+tripRound+' | '+trip.gateIn+'–'+(trip.gateOut||'ยังไม่ออก');
  cell.append(bar);
  // Highlight the nominal 50-minute unloading window without extending past GateOut.
  if(trip.unload!==null&&trip.finish!==null){
   const darkEnd=Math.min(trip.finish,trip.unload+50);
   if(darkEnd>trip.unload)addSegment(trip,trip.unload,darkEnd,'tl-unloading-dark','ช่วงหลังเริ่ม Unloading (ประมาณ '+(darkEnd-trip.unload)+' นาที)');
  }
  if(showTravel&&trip.finish!==null)addSegment(trip,trip.finish,trip.finish+60,'tl-trip-out','เดินทางจากโรงไฟฟ้ากลับคลัง (ประมาณ 60 นาที)');
  if(showTravel&&trip.depot){
   const dwell=Math.round(trip.depot.end-trip.depot.start);
   // Depot dwell is inferred from GateOut of prior cycle and next GateIn,
   // with two 60-minute drives subtracted. It is not measured fueling time.
   if(dwell>0){
    addSegment(trip,trip.depot.start,trip.depot.end,'tl-trip-depot','เวลาที่คลังโดยประมาณ '+Math.floor(dwell/60)+' ชม. '+String(dwell%60).padStart(2,'0')+' นาที');
    const depotLabel=document.createElement('span');depotLabel.className='tl-depot-duration';
    depotLabel.style.left=((Math.max(trip.depot.start,min)+Math.min(trip.depot.end,max))/2-min)/span*100+'%';
    if(trip.depot.end<=min||trip.depot.start>=max)depotLabel.hidden=true;
    depotLabel.textContent=Math.floor(dwell/60)+' ชม. '+String(dwell%60).padStart(2,'0')+' น.';
    depotLabel.title='เวลาที่คลังโดยประมาณ ไม่ใช่เวลาที่บันทึกการเติมน้ำมันจริง';cell.append(depotLabel);
   }
  }
  if(trip.unload!==null){
   const dot=document.createElement('img');dot.className='tl-drop';dot.src=oilDropPng;dot.alt='';
   dot.setAttribute('aria-label','เวลาเริ่มรับน้ำมันลงถัง');
   dot.style.left=(trip.unload-min)/span*100+'%';
   dot.title=trip.unloadFallback?'Unloading ใช้เวลาเข้าแทน ('+trip.gateIn+')':'Unloading '+trip.unloading;
   if(trip.unload>=min&&trip.unload<=max)cell.append(dot);
  }
 }
 tr.append(cell);body.append(tr);
}
try{if(typeof window.renderPcuChart==='function')window.renderPcuChart(data)}catch(pcuError){console.error('PCU chart',pcuError);const card=document.getElementById('pcuCard');if(card){card.hidden=false;card.querySelector('.pcu-summary').textContent='ไม่สามารถคำนวณกราฟ PCU: '+pcuError.message}}
document.getElementById('tlNote').textContent=note||'ข้อมูลจาก Google Sheets';
}
document.getElementById('tlPrint').onclick=()=>window.print();
const exportPngButton=document.getElementById('tlExportPng');
const exportTimelinePngButton=document.getElementById('tlExportTimelinePng');
exportPngButton.title='บันทึก PNG รวมกราฟ PCU';exportPngButton.setAttribute('aria-label','บันทึก PNG รวมกราฟ PCU');
let pngLibraryPromise=null;
function loadPngLibrary(){
 if(typeof window.html2canvas==='function')return Promise.resolve(window.html2canvas);
 if(pngLibraryPromise)return pngLibraryPromise;
 pngLibraryPromise=new Promise((resolve,reject)=>{
  const sources=['https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js','https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js'];
  function trySource(index){
   if(index>=sources.length){reject(Error('ไม่สามารถโหลดเครื่องมือสร้าง PNG ได้ กรุณาตรวจอินเทอร์เน็ต'));return}
   const script=document.createElement('script');script.src=sources[index];script.async=true;
   script.onload=()=>{if(typeof window.html2canvas==='function')resolve(window.html2canvas);else{script.remove();trySource(index+1)}};
   script.onerror=()=>{script.remove();trySource(index+1)};document.head.append(script);
  }
  trySource(0);
 }).catch(error=>{pngLibraryPromise=null;throw error});
 return pngLibraryPromise;
}
async function exportReportPng(includePcu,button){
 if(!document.querySelector('#tlBody tr')){window.alert('ยังไม่มีข้อมูล Timeline สำหรับบันทึกภาพ');return}
 const oldTitle=button.title;
 exportPngButton.disabled=true;exportTimelinePngButton.disabled=true;button.title='กำลังสร้างไฟล์ PNG';
 try{
  const html2canvas=await loadPngLibrary();
  const source=document.getElementById('nativeTimeline');
  await Promise.all([...source.querySelectorAll('img.tl-drop')].map(img=>img.decode().catch(()=>{})));
  const table=source.querySelector('.tl-table');
  const pcuSvg=includePcu?source.querySelector('.pcu-graphic svg'):null;
  if(document.fonts?.ready)await document.fonts.ready;
  const captureWidth=Math.max(source.clientWidth,table?.scrollWidth||0,pcuSvg?.getBoundingClientRect().width||0,1500)+28;
  closeCalendar();
  const canvas=await html2canvas(source,{
   backgroundColor:'#ffffff',scale:2,useCORS:true,logging:false,
   width:captureWidth,windowWidth:captureWidth,scrollX:0,scrollY:0,
   onclone:clonedDocument=>{
    const cloned=clonedDocument.getElementById('nativeTimeline');
    if(!includePcu)cloned.querySelector('#pcuCard')?.remove();
    cloned.style.width=captureWidth+'px';cloned.style.maxWidth='none';cloned.style.margin='0';
    for(const selector of ['.tl-tools','#tlNote']){
     const element=cloned.querySelector(selector);if(element)element.style.display='none';
    }
    const overflow=cloned.querySelector('.tl-overflow');
    if(overflow){overflow.style.overflow='visible';overflow.style.width='100%'}
    const clonedTable=cloned.querySelector('.tl-table');
    if(clonedTable){clonedTable.style.minWidth='0';clonedTable.style.width='100%'}
    const pcuGraphic=cloned.querySelector('.pcu-graphic');
    if(pcuGraphic){pcuGraphic.style.overflow='visible';pcuGraphic.style.width='100%'}
    const pcuSvg=cloned.querySelector('.pcu-graphic svg');
    if(pcuSvg){pcuSvg.style.minWidth='0';pcuSvg.style.width='100%'}
    // html2canvas may omit CSS repeating-linear-gradient on table cells.
    // Build actual hourly grid elements using the same positions as the X-axis ticks.
    const hourPositions=[...cloned.querySelectorAll('#tlAxis span')].map(tick=>tick.style.left).filter(Boolean);
    cloned.querySelectorAll('td.tl-chart').forEach(cell=>{
     cell.style.backgroundImage='none';
     for(const left of hourPositions){
      const line=clonedDocument.createElement('span');
      line.className='tl-export-hour-grid';
      Object.assign(line.style,{position:'absolute',left,top:'0',bottom:'0',width:'1px',backgroundColor:'#b8c6d5',opacity:'0.72',pointerEvents:'none',zIndex:'0'});
      cell.insertBefore(line,cell.firstChild);
     }
     cell.querySelectorAll('.tl-bar,.tl-drop').forEach(marker=>{
      marker.style.zIndex=marker.classList.contains('tl-drop')?'2':'1';
     });
    });
   }
  });
  const filename='CHN-Diesel-Timeline-'+(document.getElementById('tlDateSelect')?.value||'report')+(includePcu?'-with-PCU':'-Timeline-Only')+'.png';
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('ไม่สามารถสร้างไฟล์ PNG ได้')),'image/png'));
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
 }catch(error){console.error('PNG export failed',error);window.alert('บันทึก PNG ไม่สำเร็จ: '+error.message)}
 finally{exportPngButton.disabled=false;exportTimelinePngButton.disabled=false;button.title=oldTitle}
}
exportPngButton.onclick=()=>exportReportPng(true,exportPngButton);
exportTimelinePngButton.onclick=()=>exportReportPng(false,exportTimelinePngButton);
let sheetRows=[];const select=document.getElementById('tlDateSelect');const refresh=document.getElementById('tlRefresh');
const calButton=document.getElementById('tlCalendarButton'),calPanel=document.getElementById('tlCalendarPanel');
const calGrid=document.getElementById('tlCalGrid'),calMonthLabel=document.getElementById('tlCalMonth');
let calYear=2026,calMonth=10;
const availableDays=()=>new Set([...select.options].map(option=>option.value));
const localDate=iso=>new Date(iso+'T12:00:00+07:00');
const pad2=n=>String(n).padStart(2,'0');
function drawCalendar(){
 const first=new Date(Date.UTC(calYear,calMonth,1));
 calMonthLabel.textContent=first.toLocaleDateString('th-TH',{month:'long',year:'numeric',timeZone:'UTC'});
 calGrid.replaceChildren();
 const weekdays=['อา','จ','อ','พ','พฤ','ศ','ส'];
 weekdays.forEach((day,i)=>{const node=document.createElement('span');node.className='tl-cal-weekday'+(i===0?' sunday':i===6?' saturday':'');node.textContent=day;calGrid.append(node)});
 const offset=first.getUTCDay(),days=new Date(Date.UTC(calYear,calMonth+1,0)).getUTCDate(),allowed=availableDays();
 for(let n=0;n<offset;n++){const blank=document.createElement('span');blank.className='tl-cal-empty';calGrid.append(blank)}
 for(let n=1;n<=days;n++){
  const date=calYear+'-'+pad2(calMonth+1)+'-'+pad2(n),weekday=new Date(Date.UTC(calYear,calMonth,n)).getUTCDay();
  const button=document.createElement('button');button.type='button';button.textContent=String(n);
  button.className='tl-cal-day'+(weekday===0?' sunday':weekday===6?' saturday':'')+(date===select.value?' selected':'');
  button.disabled=!allowed.has(date);
  button.setAttribute('aria-label',localDate(date).toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Bangkok'}));
  button.setAttribute('aria-pressed',String(date===select.value));
  button.onclick=()=>{select.value=date;select.dispatchEvent(new Event('change',{bubbles:true}));closeCalendar()};
  calGrid.append(button);
 }
}
function closeCalendar(){calPanel.hidden=true;calButton.setAttribute('aria-expanded','false')}
calButton.onclick=()=>{if(!calPanel.hidden){closeCalendar();return}const d=select.value;if(d){calYear=+d.slice(0,4);calMonth=+d.slice(5,7)-1}drawCalendar();calPanel.hidden=false;calButton.setAttribute('aria-expanded','true')};
document.getElementById('tlCalPrev').onclick=()=>{const d=new Date(Date.UTC(calYear,calMonth-1,1));calYear=d.getUTCFullYear();calMonth=d.getUTCMonth();drawCalendar()};
document.getElementById('tlCalNext').onclick=()=>{const d=new Date(Date.UTC(calYear,calMonth+1,1));calYear=d.getUTCFullYear();calMonth=d.getUTCMonth();drawCalendar()};
document.addEventListener('pointerdown',event=>{if(!calPanel.hidden&&!event.target.closest('.tl-date-wrap,.tl-calendar-panel'))closeCalendar()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeCalendar()});
document.getElementById('tlShowTravel').addEventListener('change',()=>{if(sheetRows.length&&select.value)showDay()});
for(const id of ['tlTravelSortKey','tlTravelSortDirection']){
 document.getElementById(id).addEventListener('change',()=>{if(sheetRows.length&&select.value&&document.getElementById('tlShowTravel').checked)showDay()});
}

function showDay(){if(select.value){calButton.textContent=localDate(select.value).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Bangkok'})+' ▾';calYear=+select.value.slice(0,4);calMonth=+select.value.slice(5,7)-1;if(!calPanel.hidden)drawCalendar()}const chosen=sheetRows.filter(r=>r.date===select.value);render(chosen,'อ่านจาก Google Sheets · '+new Date().toLocaleTimeString('th-TH',{timeZone:'Asia/Bangkok'})+' น.'+(chosen.some(r=>r.reviewRequired)?' · ⚠ มีรายการที่ต้องยืนยันทะเบียน':''));host.querySelector('.tl-title p').textContent='โรงไฟฟ้าจะนะ จ.สงขลา ｜ วันที่ '+new Date(select.value+'T12:00:00+07:00').toLocaleDateString('th-TH',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Bangkok'})+' ｜ ป้อม 1';}
async function refreshSheet(){refresh.disabled=true;document.getElementById('tlNote').textContent='กำลังอ่าน Google Sheets…';try{const result=await window.FuelSheet.load();const days=[...new Set(result.map(r=>r.date))].sort();if(!days.length)throw Error('ชีตยังไม่มีรายการรถ');const previous=select.value;sheetRows=result;select.replaceChildren(...days.map(day=>{const o=document.createElement('option');o.value=day;o.textContent=day;return o}));select.value=days.includes(previous)?previous:days.at(-1);showDay()}catch(e){document.getElementById('tlNote').textContent='อ่านชีตไม่สำเร็จ: '+e.message+(sheetRows.length?' · กราฟที่เห็นเป็นข้อมูลจากการโหลดครั้งก่อน':'')}finally{refresh.disabled=false}}
select.onchange=showDay;refresh.onclick=refreshSheet;await refreshSheet();
})();
