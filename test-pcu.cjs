// PCU unit and real-data regression tests; this fixture is NOT loaded by the website.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const P=require('./dist/pcu.js');
const input=[{"gateIn":"06:31","gateOut":"08:20"},{"gateIn":"06:37","gateOut":"08:19"},{"gateIn":"06:37","gateOut":"08:16"},{"gateIn":"06:41","gateOut":"09:53"},{"gateIn":"06:41","gateOut":"09:13"},{"gateIn":"06:45","gateOut":"08:15"},{"gateIn":"06:45","gateOut":"08:15"},{"gateIn":"06:45","gateOut":"09:10"},{"gateIn":"06:47","gateOut":"09:18"},{"gateIn":"06:49","gateOut":"09:20"},{"gateIn":"06:50","gateOut":"10:03"},{"gateIn":"06:51","gateOut":"10:15"},{"gateIn":"06:51","gateOut":"10:52"},{"gateIn":"06:55","gateOut":"10:12"},{"gateIn":"06:56","gateOut":"10:24"},{"gateIn":"08:47","gateOut":"11:08"},{"gateIn":"08:44","gateOut":"11:00"},{"gateIn":"08:56","gateOut":"11:11"},{"gateIn":"11:06","gateOut":"12:11"},{"gateIn":"11:16","gateOut":"12:19"},{"gateIn":"11:36","gateOut":"12:39"},{"gateIn":"11:46","gateOut":"12:53"},{"gateIn":"11:48","gateOut":"13:05"},{"gateIn":"12:00","gateOut":"13:11"},{"gateIn":"12:16","gateOut":"13:24"},{"gateIn":"12:07","gateOut":"13:44"},{"gateIn":"12:50","gateOut":"13:52"},{"gateIn":"13:18","gateOut":"14:23"},{"gateIn":"13:26","gateOut":"14:35"},{"gateIn":"13:57","gateOut":"15:06"},{"gateIn":"14:02","gateOut":"15:12"},{"gateIn":"14:18","gateOut":"15:22"},{"gateIn":"14:30","gateOut":"15:44"},{"gateIn":"14:36","gateOut":"15:41"},{"gateIn":"14:58","gateOut":"16:07"},{"gateIn":"15:22","gateOut":"16:28"}];
assert.equal(input.length,36,'WebData 19 Nov 2026 must have 36 trips');
const hours=P.calculate(input);
assert.equal(hours.length,12);
assert.equal(hours[0].total,15);assert.equal(hours[0].incoming,15);assert.equal(hours[0].outgoing,0);
assert.equal(hours[0].time,'06:00');assert.equal(hours[0].pcuWithSafety,41.25);
assert.equal(hours[5].total,13);assert.equal(hours[5].incoming,6);assert.equal(hours[5].outgoing,7);
assert.equal(hours[5].time,'11:11');assert.equal(hours[5].pcuWithSafety,35.75);
assert.equal(hours[0].exceedsLimit,true);assert.equal(hours[5].exceedsLimit,false);
for(const h of hours){
 assert.equal(h.incoming+h.outgoing,h.total,'direction totals from same minute');
 assert.equal(h.pcuWithSafety,Math.round(h.total*2.5*1.1*100)/100);
 assert(h.minute===undefined || Number.isInteger(h.minute));
}
// Include one-minute overlap at 06:00; exclude one-minute boundary at 18:00.
let edge=P.calculate([{gateIn:'06:30',gateOut:'17:30'}]);
assert.equal(edge[0].incoming,1);assert.equal(edge[0].time,'06:00');
assert.equal(edge[11].outgoing,1);assert.equal(edge[11].time,'17:30');
edge=P.calculate([{gateIn:'07:00',gateOut:'18:00'}]);
assert.equal(edge[0].incoming,1);assert.equal(edge[11].outgoing,0);
// Tie: choose earliest minute, not the later equal peak.
edge=P.calculate([{gateIn:'06:50',gateOut:'09:00'}]);
assert.equal(edge[0].time,'06:00');
// The source and its two embedded HTML distributions must include valid JavaScript.
for(const filename of ['dist/index.html','google-apps-script/Index.html']){
 const source=fs.readFileSync(filename,'utf8');
 const scripts=[...source.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)];
 assert(scripts.length>=5,'Expected inline pure PCU and chart modules in '+filename);
 scripts.forEach((m,i)=>new vm.Script(m[1],{filename:filename+':script-'+i}));
 assert(source.includes('id="pcuCard"'),filename+' must include PCU card');
 assert(source.includes('root.renderPcuChart=render;'),filename+' must render live PCU chart');
 assert(source.includes('pcuGraphic.style.overflow=\'visible\''),filename+' must export PCU chart uncut');
}
console.log('PCU PASS: 36 real trips on 19 Nov; 06:00=41.25 and 11:00=35.75; minute boundaries, safe factors, embedded script syntax');
