// Real-browser smoke test: live date selection, SVG labels and full-report PNG export.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright-core');
const {PNG}=require('pngjs');
const trips=require('./pcu-2026-11-19.json');
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>fs.existsSync(p));
if(!chrome)throw Error('System Chromium/Chrome not found on runner');
const out=path.resolve('tests/pcu-browser.png'),pngFile=path.resolve('tests/pcu-export.png');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chrome,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:1700,height:950}});
  const page=await context.newPage();
  page.on('pageerror',error=>{console.error('Browser page error:',error)});
  await page.route(/fonts\.googleapis\.com/,route=>route.abort());
  await page.route(/gviz\/tq/,route=>{
   const url=new URL(route.request().url());
   const tx=url.searchParams.get('tqx')||'';
   const callback=/responseHandler:([^;]+)/.exec(tx)?.[1];
   if(!callback)throw Error('Missing JSONP callback');
   const rows=trips.map((r,i)=>({c:[{v:'2026-11-19'},{v:r.plate||'TEST-'+i},{v:r.province||'สงขลา'},{v:r.gateIn},{v:r.gateOut},{v:i+1},{v:r.gateIn},{v:42000},{v:i+1},{v:'ยืนยันทะเบียนแล้ว'}]}));
   rows.unshift({c:[{v:'2026-11-18'},{v:'TEST-ONLY'},{v:'สงขลา'},{v:'12:00'},{v:'13:00'},{v:1},{v:'12:00'},{v:42000},{v:1},{v:'ยืนยันทะเบียนแล้ว'}]});
   return route.fulfill({status:200,contentType:'application/javascript',body:callback+'('+JSON.stringify({status:'ok',table:{rows}})+');'});
  });
  await page.goto(pathToFileURL(path.resolve('dist/index.html')).href,{waitUntil:'domcontentloaded'});
  await page.locator('#tlBody tr').first().waitFor({timeout:20000});
  assert.equal(await page.locator('#tlBody tr').count(),36);
  assert.equal(await page.locator('#pcuCard .pcu-graphic rect').count(),12);
  const values=await page.locator('#pcuCard .pcu-bar-value').allTextContents();
  assert.equal(values[0],'41.25');assert.equal(values[5],'35.75');
  assert.equal(await page.locator('#pcuCard .pcu-bar-over').count(),1);
  await page.locator('#tlDateSelect').evaluate(select=>{select.value='2026-11-18';select.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.equal(await page.locator('#tlBody tr').count(),1);
  await page.locator('#tlDateSelect').evaluate(select=>{select.value='2026-11-19';select.dispatchEvent(new Event('change',{bubbles:true}))});
  assert.equal(await page.locator('#tlBody tr').count(),36);
  assert.equal(await page.locator('img.tl-drop').count(),36);
  assert.deepEqual(await page.locator('#tlBody tr td.tl-seq-cell').evaluateAll(cells=>cells.map(cell=>cell.dataset.tripLabel)),Array.from({length:36},(_,i)=>'เที่ยว '+(i+1)),'each leftmost cell must display the source trip number');
  // Calendar must visibly include both weekend columns and allow only dates from WebData.
  await page.locator('#tlCalendarButton').click();
  assert.equal(await page.locator('.tl-cal-weekday').count(),7);
  assert.equal(await page.locator('.tl-cal-weekday.sunday').count(),1);
  assert.equal(await page.locator('.tl-cal-weekday.saturday').count(),1);
  assert.equal(await page.locator('.tl-cal-day:not(:disabled)').count(),2);
  assert.equal(await page.locator('#tlCalendarPanel').isVisible(),true);
  await page.locator('#tlCalPrev').click();
  assert.equal(await page.locator('.tl-cal-day:not(:disabled)').count(),0);
  await page.locator('#tlCalNext').click();
  await page.locator('.tl-cal-day:not(:disabled)').filter({hasText:/^18$/}).click();
  assert.equal(await page.locator('#tlBody tr').count(),1);
  await page.locator('#tlCalendarButton').click();
  await page.locator('.tl-cal-day:not(:disabled)').filter({hasText:/^19$/}).click();
  assert.equal(await page.locator('#tlBody tr').count(),36);
  // Optional travel bands and inferred depot dwell do not affect existing PCU numbers.
  assert.equal(await page.locator('.tl-trip-segment').count(),0);
  assert.equal(await page.locator('.tl-bar').count(),36);
  assert.equal(await page.locator('.tl-depot-duration').count(),0);
  const originalOrder=await page.locator('#tlBody tr td:nth-child(3)').allTextContents();
  assert.equal(await page.locator('#tlTravelSortControls').isVisible(),true,'sorting controls must remain visible when checkbox is off');
  assert.equal(await page.locator('#tlOrderLabel').textContent(),'(เรียงตามเกณฑ์ที่เลือก · แสดงแยกเที่ยว)');
  const originalRowIdentity=await page.locator('#tlBody tr').evaluateAll(trs=>trs.map(tr=>({plate:tr.cells[2].textContent.trim(),gateIn:tr.cells[3].textContent.trim(),unloading:tr.cells[4].textContent.trim(),number:Number(tr.cells[0].textContent)})));
  assert.deepEqual(originalRowIdentity.map(r=>r.gateIn),[...originalRowIdentity.map(r=>r.gateIn)].sort(),'unchecked view must sort all rows by Gate In ascending');
  for(let i=1;i<originalRowIdentity.length;i++){
   const prev=originalRowIdentity[i-1],curr=originalRowIdentity[i];
   if(prev.gateIn===curr.gateIn)assert(prev.unloading<=curr.unloading,'unchecked view must use Unloading when Gate In is tied');
  }
  assert.deepEqual(originalRowIdentity.map(r=>r.number),Array.from({length:36},(_,i)=>i+1),'unchecked view must number rows in Gate In order');
  const gateInRanks=new Map(
    [...originalRowIdentity].sort((a,b)=>a.gateIn.localeCompare(b.gateIn)||a.number-b.number)
      .map((r,i)=>[r.plate+'|'+r.gateIn,i+1])
  );
  await page.locator('#tlShowTravel').check();
  assert.equal(await page.locator('#tlAxis span').first().textContent(),'06:00','timeline axis cannot start before 06:00');
  const inboundBounds=await page.locator('.tl-trip-in').evaluateAll(elements=>elements.map(el=>({left:parseFloat(el.style.left),width:parseFloat(el.style.width)})));
  assert(inboundBounds.every(item=>item.left>=0&&item.width>=0&&item.left+item.width<=100.01),'pre-06:00 travel spans must be clipped to chart bounds');
  assert(inboundBounds.some(item=>item.left===0),'travel starting before 06:00 should still show its portion after 06:00');
  assert.equal(await page.locator('#tlOrderLabel').textContent(),'(ลำดับ Gate In · จัดกลุ่มตามทะเบียน)');
  const grouped=await page.locator('#tlBody tr').evaluateAll(trs=>trs.map(tr=>({plate:tr.cells[2].textContent.trim(),gateIn:tr.cells[3].textContent.trim(),order:Number(tr.cells[0].textContent),round:Number(tr.cells[1].textContent)})));
  for(const row of grouped)assert.equal(row.order,gateInRanks.get(row.plate+'|'+row.gateIn),'sequence number must use Gate In rank');
  assert.deepEqual(grouped.map(r=>r.order).sort((a,b)=>a-b),Array.from({length:36},(_,i)=>i+1),'arrival ranks must be unique and complete');
  const groupedTrips=new Map();
  const groupStarts=[],seenPlates=new Set();
  let previousPlate=null;
  for(const row of grouped){
   if(row.plate!==previousPlate){
    assert(!seenPlates.has(row.plate),'all trips for one vehicle must be consecutive');
    seenPlates.add(row.plate);groupStarts.push(row);
    previousPlate=row.plate;
   }
   const list=groupedTrips.get(row.plate)||[];list.push(row.round);groupedTrips.set(row.plate,list);
  }
  assert.deepEqual(groupStarts.map(r=>r.gateIn),[...groupStarts.map(r=>r.gateIn)].sort(),'vehicle groups should follow first Gate In');
  for(const plate of seenPlates){
   const withinGroup=grouped.filter(r=>r.plate===plate);
   assert.deepEqual(withinGroup.map(r=>r.gateIn),[...withinGroup.map(r=>r.gateIn)].sort(),'each vehicle must list trips in Gate In order');
  }
  assert.equal(grouped.length,36);
  const leftTripLabels=await page.locator('#tlBody tr td.tl-seq-cell').evaluateAll(cells=>cells.map(cell=>cell.dataset.tripLabel));
  assert.deepEqual(leftTripLabels,grouped.map(r=>'เที่ยว '+r.round),'leftmost badges must follow each trip after grouping');
  assert.equal(groupedTrips.size,19);
  assert([...groupedTrips.values()].some(rounds=>rounds.length===3),'fixture must cover 3-trip truck');
  const originalTripMap=new Map();
  trips.forEach((trip,index)=>{const key=trip.plate;const list=originalTripMap.get(key)||[];list.push(index+1);originalTripMap.set(key,list)});
  for(const [plate,rounds] of groupedTrips)assert.deepEqual(rounds,originalTripMap.get(plate),'round column must preserve the original sheet values');
  assert([...groupedTrips.values()].some(rounds=>rounds[1]>=20),'fixture must contain later sheet rounds shown under a truck\'s second trip');
  assert.equal(await page.locator('.tl-truck-group-start').count(),groupedTrips.size-1);
  assert.equal(await page.locator('.tl-trip-in').count(),36);
  assert.equal(await page.locator('.tl-trip-out').count(),36);
  assert.equal(await page.locator('.tl-trip-depot').count(),17);
  assert.equal(await page.locator('.tl-trip-join').count(),0);
  assert.equal(await page.locator('.tl-combined-chart').count(),19);
  assert.equal(await page.locator('.tl-combined-chart .tl-bar').count(),36);
  assert.equal(await page.locator('.tl-combined-chart .tl-drop').count(),36);
  assert.equal(await page.locator('.tl-depot-duration').count(),17);
  assert.equal(await page.locator('.tl-unloading-dark').count(),36);
  const appearance=await page.evaluate(()=>{
   const get=(selector)=>{const node=document.querySelector(selector),css=getComputedStyle(node);return {height:parseFloat(css.height),top:parseFloat(css.top),color:css.backgroundColor}};
   return {plant:get('.tl-combined-chart .tl-bar'),incoming:get('.tl-combined-chart .tl-trip-in'),outgoing:get('.tl-combined-chart .tl-trip-out'),depot:get('.tl-combined-chart .tl-trip-depot'),dark:get('.tl-combined-chart .tl-unloading-dark')};
  });
  assert(appearance.plant.height>=18,'residence bar should be prominent');
  assert.equal(appearance.incoming.height,appearance.outgoing.height);
  assert.equal(appearance.incoming.height,appearance.depot.height);
  assert.equal(appearance.incoming.top,appearance.outgoing.top);
  assert.equal(appearance.incoming.top,appearance.depot.top);
  assert(appearance.plant.height>appearance.incoming.height,'in-plant bars must be thicker than trip/depot bands');
  assert.equal(appearance.dark.height,appearance.plant.height);
  assert.notEqual(appearance.dark.color,'rgba(20, 49, 94, 0.53)','unloading should use toned variant of truck color');
  const laneCounts=await page.locator('#tlBody tr').evaluateAll(trs=>trs.map(tr=>({plate:tr.cells[2].textContent.trim(),bars:tr.querySelectorAll('.tl-bar').length})));
  for(const [plate,rounds] of groupedTrips){
   const lines=laneCounts.filter(r=>r.plate===plate);
   assert.equal(lines[0].bars,rounds.length,'all the bars for a plate belong to its first row');
   assert(lines.slice(1).every(r=>r.bars===0),'later trip rows keep only source fields');
  }
  const depotLabels=await page.locator('.tl-depot-duration').allTextContents();
  assert(depotLabels.every(v=>/^\d+ ชม\. \d\d น\.$/.test(v)),'depot label must show hours and minutes');
  assert.equal((await page.locator('#pcuCard .pcu-bar-value').allTextContents())[0],'41.25');
  // Travel-only sorting controls retain plate groups and their combined bars.
  assert.equal(await page.locator('#tlTravelSortControls').isVisible(),true);
  assert.equal(await page.locator('#tlTravelSortKey').inputValue(),'firstIn');
  assert.equal(await page.locator('#tlTravelSortDirection').inputValue(),'asc');
  for(const key of ['firstIn','secondIn','secondOut']){
   await page.locator('#tlTravelSortKey').selectOption(key);
   for(const direction of ['asc','desc']){
    await page.locator('#tlTravelSortDirection').selectOption(direction);
    const groupOrder=await page.locator('#tlBody tr').evaluateAll(trs=>{
     const groups=[],seen=new Set();
     for(const tr of trs){
      const plate=tr.cells[2].textContent.trim();
      if(groups.length&&groups[groups.length-1].plate===plate){
       groups[groups.length-1].runs.push(tr);
      }else{
       if(seen.has(plate))throw Error('vehicle trip rows became separated: '+plate);
       seen.add(plate);
       groups.push({plate,runs:[tr]});
      }
     }
     return groups.map(g=>({
      plate:g.plate,
      firstIn:g.runs[0].cells[3].textContent.trim(),
      secondIn:g.runs[1]?.cells[3].textContent.trim()||null,
      secondOut:g.runs[1]?.cells[5].textContent.trim()||null,
      bars:g.runs.map(tr=>tr.querySelectorAll('.tl-bar').length)
     }));
    });
    assert.equal(groupOrder.length,19,'all 19 vehicles must retain separate groups');
    for(const group of groupOrder){
     assert(group.bars[0]>=1,'first row must contain the combined vehicle timeline');
     assert(group.bars.slice(1).every(n=>n===0),'later rows must not duplicate timeline bars');
    }
    const values=groupOrder.map(g=>g[key]==='—'?null:g[key]);
    const available=values.filter(v=>v!==null);
    assert.deepEqual(available,[...available].sort((a,b)=>direction==='asc'?a.localeCompare(b):b.localeCompare(a)),'sort order for '+key+' '+direction);
    assert(values.slice(available.length).every(v=>v===null),'missing second trip must always sort last');
   }
  }
  await page.locator('#tlTravelSortKey').selectOption('firstIn');
  await page.locator('#tlTravelSortDirection').selectOption('asc');
  await page.locator('#tlShowTravel').uncheck();
  assert.equal(await page.locator('#tlOrderLabel').textContent(),'(เรียงตามเกณฑ์ที่เลือก · แสดงแยกเที่ยว)');
  assert.deepEqual(await page.locator('#tlBody tr td:nth-child(3)').allTextContents(),originalOrder,'unchecking restores Gate In chronological table');
  assert.equal(await page.locator('.tl-trip-segment').count(),0);
  // Sorting must also work while travel overlays are disabled.
  await page.locator('#tlTravelSortKey').selectOption('secondIn');
  await page.locator('#tlTravelSortDirection').selectOption('desc');
  assert.equal(await page.locator('#tlTravelSortControls').isVisible(),true);
  assert.equal(await page.locator('.tl-trip-segment').count(),0);
  const uncheckedGroups=await page.locator('#tlBody tr').evaluateAll(trs=>{
    const groups=[];
    for(const tr of trs){
      const plate=tr.cells[2].textContent.trim();
      let last=groups[groups.length-1];
      if(!last||last.plate!==plate){last={plate,gateIns:[]};groups.push(last)}
      last.gateIns.push(tr.cells[3].textContent.trim());
    }
    return groups;
  });
  const secondIns=uncheckedGroups.map(g=>g.gateIns[1]??null);
  const knownSecondIns=secondIns.filter(Boolean);
  assert.deepEqual(knownSecondIns,[...knownSecondIns].sort().reverse(),'unchecked mode should sort second-trip Gate In descending');
  assert(secondIns.slice(knownSecondIns.length).every(v=>v===null),'vehicles missing trip two remain last without overlay');
  await page.locator('#tlTravelSortKey').selectOption('firstIn');
  await page.locator('#tlTravelSortDirection').selectOption('asc');
  assert.deepEqual(await page.locator('#tlBody tr td:nth-child(3)').allTextContents(),originalOrder,'returning to default restores chronological Gate In order');
  await page.locator('#tlShowTravel').check();

  await page.screenshot({path:out,fullPage:true});
  await page.addScriptTag({path:require.resolve('html2canvas/dist/html2canvas.min.js')});
  await page.evaluate(()=>{
   const original=window.html2canvas;
   window.__exportClones=[];
   window.html2canvas=(source,options)=>original(source,{...options,onclone(doc){
    options.onclone(doc);
    window.__exportClones.push({hasPCU:!!doc.getElementById('pcuCard'),rows:doc.querySelectorAll('#tlBody tr').length});
   }});
  });
  assert.equal(await page.locator('#tlExportPng').count(),1);
  assert.equal(await page.locator('#tlExportTimelinePng').count(),1);
  const [download]=await Promise.all([page.waitForEvent('download',{timeout:35000}),page.locator('#tlExportPng').click()]);
  assert(download.suggestedFilename().endsWith('-with-PCU.png'));
  await fs.promises.copyFile(await download.path(),pngFile);
  const image=PNG.sync.read(fs.readFileSync(pngFile));
  assert(image.width>=2700,'Export width must include full timeline and PCU chart');
  assert(image.height>=1400,'Export height must include timeline and PCU chart');
  const [timelineDownload]=await Promise.all([page.waitForEvent('download',{timeout:35000}),page.locator('#tlExportTimelinePng').click()]);
  assert(timelineDownload.suggestedFilename().endsWith('-Timeline-Only.png'));
  const timelineFile=path.resolve('tests/timeline-only-export.png');
  await fs.promises.copyFile(await timelineDownload.path(),timelineFile);
  const timelineImage=PNG.sync.read(fs.readFileSync(timelineFile));
  assert(timelineImage.width>=2700,'Timeline-only image must include the full table');
  assert(timelineImage.height<image.height-150,'Timeline-only PNG must be shorter than the image including PCU');
  assert.deepEqual(await page.evaluate(()=>window.__exportClones.map(item=>item.hasPCU)),[true,false],'PCU should only be removed in the second export clone');
  assert.deepEqual(await page.evaluate(()=>window.__exportClones.map(item=>item.rows)),[36,36],'Both PNGs should retain all truck rows');
  const chartVisible=await page.locator('#pcuCard').isVisible();
  assert(chartVisible,'PCU remains visible on the live page after both exports');
  console.log('Browser PCU PASS: calendar weekends, travel/depot bands and joins, 12 bars, date switch, 36 oil drops and both PNG exports '+image.width+'x'+image.height+' vs '+timelineImage.width+'x'+timelineImage.height);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
