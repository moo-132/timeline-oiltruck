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
  await page.route(/fonts\\.googleapis\\.com/,route=>route.abort());
  await page.route(/gviz\\/tq/,route=>{
   const url=new URL(route.request().url());
   const tx=url.searchParams.get('tqx')||'';
   const callback=/responseHandler:([^;]+)/.exec(tx)?.[1];
   if(!callback)throw Error('Missing JSONP callback');
   const rows=trips.map((r,i)=>({c:[{v:'2026-11-19'},{v:'TEST-'+i},{v:'สงขลา'},{v:r.gateIn},{v:r.gateOut},{v:1},{v:r.gateIn},{v:42000},{v:i+1},{v:'ยืนยันทะเบียนแล้ว'}]}));
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
  await page.locator('#tlDateSelect').selectOption('2026-11-18');
  assert.equal(await page.locator('#tlBody tr').count(),1);
  await page.locator('#tlDateSelect').selectOption('2026-11-19');
  assert.equal(await page.locator('#tlBody tr').count(),36);
  assert.equal(await page.locator('img.tl-drop').count(),36);
  await page.screenshot({path:out,fullPage:true});
  await page.addScriptTag({path:require.resolve('html2canvas/dist/html2canvas.min.js')});
  const [download]=await Promise.all([page.waitForEvent('download',{timeout:35000}),page.locator('#tlExportPng').click()]);
  await fs.promises.copyFile(await download.path(),pngFile);
  const image=PNG.sync.read(fs.readFileSync(pngFile));
  assert(image.width>=2700,'Export width must include full timeline and PCU chart');
  assert(image.height>=1400,'Export height must include timeline and PCU chart');
  const chartVisible=await page.locator('#pcuCard').isVisible();
  assert(chartVisible,'PCU card is visible');
  console.log('Browser PCU PASS: 12 bars, Thai chart DOM, date switch, 36 oil drops and PNG '+image.width+'x'+image.height);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
