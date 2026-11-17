const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('dist/sheet-live.js', 'utf8');
const win = {};
const rows = [{ c: [
  { v: '2026-11-16' }, { v: '71-6040' }, { v: 'ปทุมธานี' },
  { v: '06:04' }, { v: '08:11' }, { v: 1 }, { v: '07:15' },
  { v: '41,971.63' }, { v: 1 }, { v: 'ยืนยันแล้ว' }
] }];
const document = {
  head: { append(script) {
    const name = [...new URL(script.src).searchParams.get('tqx').matchAll(/responseHandler:([^;]+)/g)][0][1];
    win[name]({ status: 'ok', table: { rows } });
  } },
  createElement() { return { remove() {} }; }
};
vm.runInNewContext(source, { window: win, document, setTimeout, clearTimeout, Date, Promise, Error, URL, Number, String, Array });
win.FuelSheet.load().then(result => {
  assert.equal(result[0].date, '2026-11-16');
  assert.equal(result[0].volume, 41971.63);
  assert.equal(result[0].gateIn, '06:04');
  console.log('Sheets feed parser: PASS');
}).catch(e => { console.error(e); process.exitCode = 1; });
