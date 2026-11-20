// PCU unit and real-data regression tests; this fixture is NOT loaded by the website.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const P=require('./dist/pcu.js');
const input=require('./tests/pcu-2026-11-19.json');
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
 const scripts=[...source.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert(scripts.length>=5,'Expected inline pure PCU and chart modules in '+filename);
 scripts.forEach((m,i)=>new vm.Script(m[1],{filename:filename+':script-'+i}));
 assert(source.includes('id="pcuCard"'),filename+' must include PCU card');
 assert(source.includes('root.renderPcuChart=render;'),filename+' must render live PCU chart');
 assert(source.includes('pcuGraphic.style.overflow=\'visible\''),filename+' must export PCU chart uncut');
}
console.log('PCU PASS: 36 real trips on 19 Nov; 06:00=41.25 and 11:00=35.75; minute boundaries, safe factors, embedded script syntax');
