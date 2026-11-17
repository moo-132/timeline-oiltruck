const fs=require('node:fs');
const html=fs.readFileSync('dist/index.html','utf8');
const gas=html.replace('<link rel="stylesheet" href="timeline.css">','<style>'+fs.readFileSync('dist/timeline.css','utf8')+'</style>').replace(/<script src="([^"]+)" defer><\/script>/g,(_,name)=>'<script>'+fs.readFileSync('dist/'+name,'utf8')+'</script>');
fs.writeFileSync('google-apps-script/Index.html',gas);
fs.writeFileSync('dist/Index.html',gas);
fs.copyFileSync('README.txt','dist/README.txt');
console.log('Built Google Sheets dashboard package');
