// Regression guard: export must build explicit hourly lines rather than rely on CSS gradients.
const assert=require('node:assert/strict');
const fs=require('node:fs');
for(const path of ['dist/timeline.js','dist/index.html','google-apps-script/Index.html']){
 const source=fs.readFileSync(path,'utf8');
 assert(source.includes("cloned.querySelectorAll('#tlAxis span')"),path+' must derive gridlines from axis ticks');
 assert(source.includes("cloned.querySelectorAll('td.tl-chart')"),path+' must render grids for all timeline rows');
 assert(source.includes("cell.insertBefore(line,cell.firstChild)"),path+' must place grid behind bars');
 assert(source.includes("marker.style.zIndex=marker.classList.contains('tl-drop')?'2':'1'"),path+' must place bars and drops above gridlines');
 assert(source.includes("backgroundColor:'#ffffff',scale:2"),path+' must export high-resolution PNG');
}
console.log('PNG export time-grid regression checks: PASS');
