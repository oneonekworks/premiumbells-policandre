// Europe map, engraved style, for the homepage map story. Same projection as v6.2 (conic conformal, parallels 38/54, rotate -12, centre 46.2N), scaled to a W×H box.
const fs=require('fs');const d3=require('/opt/npm-tools/node_modules/d3-geo');
const src=fs.readFileSync(__dirname+'/topojson-client.js','utf8'); const g={}; new Function('global','self','window',src)(g,g,g); const topojson=g.topojson||globalThis.topojson;
const w=JSON.parse(fs.readFileSync(__dirname+'/countries-50m.json'));
const [W,H,K,OX,OY]=process.argv.slice(2).map(Number); // K = scale vs the old 800×603 map; (OX,OY) = where old (0,0) lands
const p=d3.geoConicConformal().parallels([38,54]).rotate([-12,0]).center([0,46.2]).scale(1418.495683339442*K).translate([435.3708751396813*K+OX,308.4075131178568*K+OY]).clipExtent([[0,0],[W,H]]);
const path=d3.geoPath(p).digits(1);
const C=topojson.feature(w,w.objects.countries);
const out={land:path(topojson.feature(w,w.objects.land)),borders:path(topojson.mesh(w,w.objects.countries,(a,b)=>a!==b)),hl:['724','642','498','300','056'].map(id=>path(C.features.find(f=>f.id===id)))};
fs.writeFileSync(__dirname+'/new_paths.json',JSON.stringify(out));
// sanity: compare to old with K=1
console.log(out.land.length,out.borders.length,out.hl.map(x=>x.length).join(','));
