/* SVG/HTML PCU dashboard; no image snapshots or hardcoded date data. */
(function(root){
 'use strict';
 const ns='http://www.w3.org/2000/svg';
 const svgElement=(name,attrs={},text)=>{
  const node=document.createElementNS(ns,name);
  Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));
  if(text!==undefined)node.textContent=String(text);
  return node;
 };
 const fmt=n=>Number(n).toLocaleString('th-TH',{maximumFractionDigits:2});
 function render(rows){
  const host=document.getElementById('pcuCard');
  if(!host||!root.FuelPCU)return;
  const hours=root.FuelPCU.calculate(rows);
  const limit=root.FuelPCU.LIMIT;
  const maxValue=Math.max(limit,...hours.map(x=>x.pcuWithSafety));
  const yMax=Math.max(45,Math.ceil((maxValue+5)/10)*10);
  const left=72,top=36,bottom=294,plotHeight=bottom-top,group=104,barWidth=48,width=left+group*12+34;
  const yOf=v=>bottom-v/yMax*plotHeight;
  const summary=host.querySelector('.pcu-summary');
  const chart=host.querySelector('.pcu-graphic');
  const details=host.querySelector('.pcu-hour-detail');
  const exceed=hours.filter(x=>x.exceedsLimit);
  const max=Math.max(...hours.map(x=>x.pcuWithSafety));
  summary.textContent='สูงสุด '+fmt(max)+' PCU (รวม SF 1.10) · เกินเส้นอ้างอิง '+exceed.length+' ช่วงเวลา · รถ '+rows.length+' เที่ยว';
  chart.replaceChildren();
  const svg=svgElement('svg',{viewBox:'0 0 '+width+' 465',role:'img','aria-label':'ปริมาณรถบรรทุกน้ำมันบนถนนสูงสุดรายชั่วโมง และเส้นอ้างอิง 38 PCU'});
  // Use actual SVG strokes rather than CSS-only backgrounds so PNG export includes the lines.
  for(let tick=0;tick<=yMax;tick+=10){
   const y=yOf(tick);
   svg.append(svgElement('line',{x1:left,y1:y,x2:width-14,y2:y,stroke:'#e6edf5','stroke-width':1}));
   svg.append(svgElement('text',{x:left-12,y:y+5,'text-anchor':'end',class:'pcu-y-label'},tick));
  }
  const thresholdY=yOf(limit);
  svg.append(svgElement('line',{x1:left,y1:thresholdY,x2:width-14,y2:thresholdY,stroke:'#d93642','stroke-width':2.3,'stroke-dasharray':'9 6',class:'pcu-threshold'}));
  svg.append(svgElement('text',{x:width-16,y:thresholdY-8,'text-anchor':'end',class:'pcu-limit-label'},'เกณฑ์อ้างอิง 38 PCU'));
  hours.forEach((item,index)=>{
   const cx=left+group*index+group/2;
   const y=yOf(item.pcuWithSafety);
   const bar=svgElement('rect',{x:cx-barWidth/2,y,width:barWidth,height:Math.max(0,bottom-y),rx:10,class:item.exceedsLimit?'pcu-bar-over':'pcu-bar-normal',tabindex:0});
   bar.append(svgElement('title',{},item.range+' น. | สูงสุด '+item.time+' น. | ขามา '+item.incoming+' คัน | ขากลับ '+item.outgoing+' คัน | รวม '+item.total+' คัน | PCU '+fmt(item.pcu)+' | รวม SF '+fmt(item.pcuWithSafety)));
   bar.addEventListener('pointerenter',()=>showDetail(item,details));
   bar.addEventListener('focus',()=>showDetail(item,details));
   svg.append(bar);
   svg.append(svgElement('text',{x:cx,y:Math.max(21,y-9),'text-anchor':'middle',class:'pcu-bar-value'},fmt(item.pcuWithSafety)));
   svg.append(svgElement('text',{x:cx,y:bottom+28,'text-anchor':'middle',class:'pcu-x-label'},String(item.hour).padStart(2,'0')+':00'));
   svg.append(svgElement('text',{x:cx,y:bottom+52,'text-anchor':'middle',class:'pcu-count-line'},'มา '+item.incoming+' | กลับ '+item.outgoing));
   svg.append(svgElement('text',{x:cx,y:bottom+72,'text-anchor':'middle',class:'pcu-total-line'},'รวม '+item.total+' คัน'));
   svg.append(svgElement('text',{x:cx,y:bottom+91,'text-anchor':'middle',class:'pcu-peak-line'},'สูงสุด '+item.time));
  });
  const axis=svgElement('text',{x:18,y:20,class:'pcu-axis-label'},'PCU รวม SF 1.10');
  svg.append(axis);
  chart.append(svg);
  showDetail(hours.reduce((a,b)=>a.pcuWithSafety>=b.pcuWithSafety?a:b),details);
  host.hidden=false;
 }
 function showDetail(item,node){
  if(!node)return;
  node.textContent=item.range+' น. · ค่าสูงสุดเวลา '+item.time+' น. · ขามา '+item.incoming+' คัน · ขากลับ '+item.outgoing+' คัน · รวม '+item.total+' คัน · PCU '+fmt(item.pcu)+' · รวม Safety Factor 1.10 = '+fmt(item.pcuWithSafety)+' PCU';
 }
 root.renderPcuChart=render;
})(typeof globalThis!=='undefined'?globalThis:this);
