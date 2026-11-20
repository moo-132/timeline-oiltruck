/* Pure minute-by-minute vehicle occupancy calculation, independent of the DOM and Sheets. */
(function(root){
 'use strict';
 const FACTOR=2.5,SAFETY=1.1,LIMIT=38,TRAVEL_MINUTES=60;
 const toMinute=value=>{
  const text=String(value??'').trim(),match=/^([01]\\d|2[0-3]):([0-5]\\d)(?::[0-5]\\d)?$/.exec(text);
  return match?Number(match[1])*60+Number(match[2]):null;
 };
 const label=minute=>String(Math.floor(minute/60)%24).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');
 function calculate(rows){
  if(!Array.isArray(rows))throw Error('ข้อมูลรถต้องเป็น Array');
  // Intervals are [start,end), so a gate arrival or departure is never double-counted.
  const trips=rows.map(r=>{
   const arrival=toMinute(r.gateIn),rawExit=toMinute(r.gateOut);
   if(arrival===null||rawExit===null)return null;
   return {arrival,departure:rawExit<arrival?rawExit+1440:rawExit};
  }).filter(Boolean);
  const hours=[];
  for(let hour=6;hour<18;hour++){
   let best={incoming:0,outgoing:0,total:-1,minute:hour*60};
   for(let minute=hour*60;minute<(hour+1)*60;minute++){
    let incoming=0,outgoing=0;
    for(const t of trips){
     if(minute>=t.arrival-TRAVEL_MINUTES&&minute<t.arrival)incoming++;
     if(minute>=t.departure&&minute<t.departure+TRAVEL_MINUTES)outgoing++;
    }
    const total=incoming+outgoing;
    if(total>best.total)best={incoming,outgoing,total,minute};
   }
   hours.push({
    hour,range:label(hour*60)+'–'+label((hour+1)*60),time:label(best.minute),
    incoming:best.incoming,outgoing:best.outgoing,total:best.total,
    pcu:best.total*FACTOR,pcuWithSafety:Math.round(best.total*FACTOR*SAFETY*100)/100,
    exceedsLimit:best.total*FACTOR*SAFETY>LIMIT
   });
  }
  return hours;
 }
 root.FuelPCU={calculate,toMinute,FACTOR,SAFETY,LIMIT,TRAVEL_MINUTES};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.FuelPCU;
})(typeof globalThis!=='undefined'?globalThis:this);
