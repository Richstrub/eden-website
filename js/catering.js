/* Catering questionnaire */
(function(){
const QVER='October 9, 2026';
const SEND_TO=['Tyler@edencny.com','Rich@edencny.com'];
const STORE='eden-questionnaire-v1',THIRD='3rd Floor Event Space';
let Q={};
try{Q=JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){Q={};}
if(!Array.isArray(Q.diet)||!Q.diet.length)Q.diet=[{}];

const suite=[
 {key:'suite.bridal',name:'Bridal Suite Brunch',desc:'Croque madame, scrambled egg and cheese croissant, mini cheese board, crudité with hummus, seasonal vegetable display, macarons and chocolate chip cookies',price:50},
 {key:'suite.groom',name:"Groom's Suite Snacks",desc:'Croque monsieur, roast beef tartine, turkey and roasted garlic aioli on sourdough, ember roasted crackers with basil salsa verde, cookies and brownies',price:50}];
const brunch=[
 {key:'br.classic',name:'Classic Brunch',desc:'Fresh juices, fruit and berries, smoked salmon display, pastries, applewood smoked bacon, ginger and sage sausage, breakfast potatoes, French toast with NY maple syrup',price:65},
 {key:'br.cont',name:'Continental Brunch',desc:'Fresh juices, fruit and berries, house granola and milks, Greek yogurt, pastries, bagels, smoked salmon display',price:52}];
const stations=[
 {key:'st.omelet',name:'Omelet Station',desc:'Whole eggs or egg whites with vegetables, maple ham, turkey, mozzarella and cheddar*',price:25},
 {key:'st.carving',name:'Carving Station',desc:'Ember roasted NY strip loin or pork loin; chimichurri, whole grain mustard, mornay, horseradish aioli',price:35}];
const hot=[
 {key:'cn.well',name:'Beef Wellington',desc:'Béarnaise sauce',price:8},
 {key:'cn.bun',name:'Steamed bun',desc:'Asian brined pork, pickled vegetables, hoisin',price:10},
 {key:'cn.dump',name:'Steamed beef dumplings',desc:'Soy sauce',price:8},
 {key:'cn.fennel',name:'Prosciutto wrapped fennel',desc:'',price:6},
 {key:'cn.mush',name:'Roasted mushroom crostini',desc:'Aioli, chives',price:6},
 {key:'cn.rb',name:'Roast beef',desc:'Chimichurri, crème fraîche, Hawaiian roll',price:8},
 {key:'cn.crab',name:'Crab cake',desc:'Old Bay aioli',price:12},
 {key:'cn.crep',name:'Seafood crépinette',desc:'Preserved lemon aioli',price:12},
 {key:'cn.goy',name:'Grilled oysters',desc:'Hot pepper jam',price:12},
 {key:'cn.oct',name:'Grilled octopus',desc:'Romesco',price:12}];
const cold=[
 {key:'cn.tart',name:'Beef tartare*',desc:'Preserved lemon, crostini',price:8},
 {key:'cn.egg',name:'Masala deviled eggs',desc:'Indian pickle',price:6},
 {key:'cn.brus',name:'Tomato basil bruschetta',desc:'Sourdough baguette',price:7},
 {key:'cn.burr',name:'Burrata',desc:'Tomato jam, focaccia',price:8},
 {key:'cn.tuna',name:'Tuna tartare*',desc:'Cucumber, hoisin, wasabi',price:12},
 {key:'cn.oys',name:'Oysters on the half shell*',desc:'Lemon, horseradish',price:12},
 {key:'cn.shrimp',name:'Shrimp cocktail',desc:'Charred lemon',price:12},
 {key:'cn.crabsal',name:'Crab salad',desc:'Rice cracker',price:12}];
const enh=[
 {key:'en.crud',name:'Vegetable crudité',desc:'Fresh fruits, hummus, crème fraîche, romesco, grilled bread',price:20},
 {key:'en.cheese',name:'Finger Lakes cheese board',desc:'Local cheeses, baguette, crackers, dried fruit, grapes and nuts',price:28},
 {key:'en.mezze',name:'Mezze',desc:'Cured meats, olives, cheeses, tomato and mozzarella salad, hummus, crackers, pita, naan',price:35},
 {key:'en.raw',name:'Chef-attended raw bar',desc:'Shrimp cocktail, oysters on the half shell*, tuna crudo*, mignonette, horseradish, hot sauce, lemons',price:45}];
const tiers=[120,135,165];
const salads=[
 {key:'sa.greens',name:'Heritage blend greens',desc:'Maple ginger vinaigrette, cucumber, grapes, carrots',t:[120,135,165]},
 {key:'sa.beet',name:'Roasted beet salad',desc:'Goat cheese, almond brittle, orange',t:[120,135,165]},
 {key:'sa.carrot',name:'Ember roasted carrot',desc:'Basil salsa verde, fromage blanc, candied hazelnuts',t:[120,135,165]},
 {key:'sa.panz',name:'Panzanella',desc:'Roasted red pepper, heirloom tomato, mozzarella, pickled watermelon',t:[165]}];
const starters=[
 {key:'sr.burr',name:'Baked burrata',desc:'Tomato jam, basil salsa verde, grilled bread',t:[120,135,165]},
 {key:'sr.pear',name:'Poached pear',desc:'Arugula, blue cheese, candied walnuts',t:[120,135,165]},
 {key:'sr.mush',name:'Mushroom toast',desc:'Poached egg*, bacon, grilled bread',t:[120,135,165]},
 {key:'sr.oct',name:'Grilled octopus',desc:'Romesco, marinated olives, fresh basil',t:[135,165]},
 {key:'sr.crab',name:'Crab cake',desc:'Old Bay aioli; roasted corn hash ($135) or charred lemon ($165)',t:[135,165]}];
const entrees=[
 {key:'en.strip',name:'Ember roasted NY strip',desc:'Basil chimichurri',t:[120]},
 {key:'en.tend',name:'Ember roasted tenderloin of beef',desc:'Basil chimichurri, Kashmiri chili butter',t:[135,165]},
 {key:'en.short',name:'Braised beef short rib',desc:'Béarnaise at $120 and $135',t:[120,135,165]},
 {key:'en.duck',name:'Pan roasted duck breast',desc:'Sour cherry gastrique',t:[165]},
 {key:'en.chick',name:'Roasted chicken breast',desc:'Orange honey gastrique',t:[120,135,165]},
 {key:'en.tand',name:'Tandoori chicken',desc:'Indian pickle, raita',t:[135,165]},
 {key:'en.salmon',name:'Fire roasted Atlantic salmon',desc:'Tomato garlic vinaigrette; candied lemon at $165',t:[120,135,165]},
 {key:'en.bronz',name:'Fire roasted branzino',desc:'Verjus–chardonnay butter',t:[135]},
 {key:'en.capp',name:'Goat cheese cappelletti',desc:'Lemon brown butter',t:[120,135,165],veg:true},
 {key:'en.ris',name:'Sweet corn risotto',desc:'Local mushrooms',t:[120,135,165],veg:true},
 {key:'en.caul',name:'Roasted cauliflower',desc:'Red pepper hummus',t:[120,135,165],veg:true}];
const sides=[
 {key:'sd.whip',name:'Whipped potatoes, roasted garlic',t:[120,135,165],cat:'starch'},
 {key:'sd.red',name:'Roasted red potatoes and kale',t:[120,135,165],cat:'starch'},
 {key:'sd.grat',name:'Potato gratin',t:[120,135,165],cat:'starch'},
 {key:'sd.mac',name:'Baked mac and cheese',t:[120,135,165],cat:'starch'},
 {key:'sd.asp',name:'Grilled asparagus, lemon vinaigrette',t:[120,135,165],cat:'veg'},
 {key:'sd.carr',name:'Honey-glazed ember roasted carrots',t:[120,135,165],cat:'veg'},
 {key:'sd.squash',name:'Caramelized onion, zucchini, squash',t:[120,135,165],cat:'veg'},
 {key:'sd.tab',name:'Wheat berry tabbouleh',t:[135,165],cat:'starch'}];
const desserts=[
 {key:'ds.lemon',name:'Lemon tart',desc:'Toasted and baked meringue, candied lemon',price:10},
 {key:'ds.pot',name:'Chocolate pot de crème',desc:'Toasted meringue, strawberry coulis, tuile',price:8},
 {key:'ds.olive',name:'Olive oil cake',desc:'Orange sherbet, chantilly',price:9},
 {key:'ds.brulee',name:'Crème brûlée',desc:'Fresh fruit, chantilly',price:9},
 {key:'ds.apple',name:'Apple crumble',desc:'Granola, crème fraîche sorbet',price:8}];

/*BUFFET-START*/
// Dinner buffet uses the plated menu levels, priced this much less per person
const BUFFET_DISCOUNT=10;
const bfPrice=t=>t?t-BUFFET_DISCOUNT:0;
const bufDesc=(it,t)=>it.key==='en.short'?(t===165?'':'Béarnaise'):it.key==='en.salmon'?(t===165?'Tomato garlic vinaigrette, candied lemon':'Tomato garlic vinaigrette'):it.key==='sr.crab'?(t===165?'Old Bay aioli, charred lemon':'Old Bay aioli, roasted corn hash'):it.desc;
/*BUFFET-END*/

const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=k=>{const v=parseFloat(Q[k]);return isFinite(v)&&v>0?v:0;};
const money=p=>p==null?'Price on request':'$'+p;
const fmt=n=>n.toLocaleString('en-US',{style:'currency',currency:'USD'});
const clean=s=>String(s||'').replace(/\*/g,'');
$('qver').textContent=QVER;

function countList(id,items,unitWord){
  $(id).innerHTML=items.map(it=>`<div class="opt count"><span></span><div><div class="nm">${esc(it.name)}</div><div class="ds">${esc(it.desc||'')}</div></div><div class="pr">${money(it.price)} per person<br><label>${unitWord} <input class="qty" type="number" min="0" inputmode="numeric" data-f="${it.key}.qty" placeholder=" " aria-label="${esc(it.name)} ${unitWord}"></label></div></div>`).join('');
}
function checkList(id,items,per){
  $(id).innerHTML=items.map(it=>`<label class="opt"><input type="checkbox" data-f="q.${it.key}"><div><div class="nm">${esc(it.name)}</div><div class="ds">${esc(it.desc||'')}</div></div><div class="pr">${it.price==null?'Price on request':money(it.price)+' '+per}</div></label>`).join('');
}
// kind: 'radio' (group), 'check' (plated .sel), 'bf' (buffet checkbox); buffet lists ignore menu levels
function courseList(id,items,o){
  $(id).innerHTML=items.map(it=>{
    const input=o.kind==='radio'?`<input type="radio" name="${o.group}" value="${it.key}" data-f="${o.group}"${o.clearable?' data-clear':''}>`
      :o.kind==='bf'?`<input type="checkbox" data-f="bf.${it.key}">`:`<input type="checkbox" data-f="${it.key}.sel">`;
    return `<label class="opt" ${o.buffet?'data-bft':'data-tiers'}="${it.t.join(',')}" data-key="${it.key}">${input}<div><div class="nm">${esc(it.name)}${it.veg?'<span class="tag">vegetarian</span>':''}</div><div class="ds">${esc(it.desc||'')}</div></div><div class="pr"></div></label>`;}).join('');
}
countList('o-suite',suite,'Guests');
countList('o-brunch',brunch,'Guests');
countList('o-stations',stations,'Guests');
checkList('o-hot',hot,'per piece');
checkList('o-cold',cold,'per piece');
checkList('o-enh',enh,'per guest');
countList('o-dessert',desserts,'Servings');
courseList('o-salad',salads,{kind:'radio',group:'q.salad'});
courseList('o-starter',starters,{kind:'radio',group:'q.starter',clearable:true});
courseList('o-entree',entrees,{kind:'check'});
courseList('o-starch',sides.filter(s=>s.cat==='starch'),{kind:'radio',group:'q.starch',clearable:true});
courseList('o-veg',sides.filter(s=>s.cat==='veg'),{kind:'radio',group:'q.veg',clearable:true});
courseList('o-bf-salad',salads,{kind:'bf',buffet:true});
courseList('o-bf-entree',entrees,{kind:'bf',buffet:true});
courseList('o-bf-starch',sides.filter(s=>s.cat==='starch'),{kind:'radio',group:'q.bfStarch',clearable:true,buffet:true});
courseList('o-bf-veg',sides.filter(s=>s.cat==='veg'),{kind:'radio',group:'q.bfVeg',clearable:true,buffet:true});
$('tiers').innerHTML=tiers.map(t=>`<label class="tier"><input type="radio" name="din.tier" value="${t}" data-f="din.tier"><span><b>$${t}</b> per person</span></label>`).join('');
$('bf-tiers').innerHTML=tiers.map(t=>`<label class="tier"><input type="radio" name="bf.tier" value="${t}" data-f="bf.tier"><span><b>$${bfPrice(t)}</b> per person</span></label>`).join('');

function renderDiet(){
  $('diet').querySelector('tbody').innerHTML=Q.diet.map((r,i)=>`<tr><td><input data-d="${i}.name" value="${esc(r.name)}" aria-label="Guest name"></td><td><input data-d="${i}.allergy" value="${esc(r.allergy)}" aria-label="Allergy or restriction"></td><td><input data-d="${i}.note" value="${esc(r.note)}" aria-label="Notes"></td><td><button type="button" class="ghost" data-rm="${i}" aria-label="Remove guest">×</button></td></tr>`).join('');
}
renderDiet();
$('addDiet').addEventListener('click',()=>{Q.diet.push({});renderDiet();save();});
$('diet').addEventListener('click',e=>{const i=e.target.dataset&&e.target.dataset.rm;if(i==null)return;Q.diet.splice(+i,1);if(!Q.diet.length)Q.diet=[{}];renderDiet();save();});

// Answers saved by earlier versions of this questionnaire
if(Q['q.din']==='yes')Q['q.din']='plated';
if(Q['q.starter']==='dessert')Q['q.starter']='';
['starch','veg'].forEach(c=>{if(!Q['q.'+c]){const s=sides.find(s=>s.cat===c&&Q[s.key+'.sel']);if(s)Q['q.'+c]=s.key;}});
sides.forEach(s=>delete Q[s.key+'.sel']);
desserts.forEach(d=>{if(Q['q.'+d.key]){if(!Q[d.key+'.qty'])Q[d.key+'.qty']=String(num('din.guests')||num('ev.expected')||'');delete Q['q.'+d.key];}});

// Restore saved answers
document.querySelectorAll('[data-f]').forEach(el=>{
  const v=Q[el.dataset.f];if(v===undefined)return;
  if(el.type==='radio')el.checked=String(v)===el.value;
  else if(el.type==='checkbox')el.checked=!!v;
  else el.value=v;
});

let t;
function save(){clearTimeout(t);t=setTimeout(()=>{try{localStorage.setItem(STORE,JSON.stringify(Q));}catch(e){}},250);}
function onChange(e){
  const el=e.target;
  if(el.dataset.f){
    const k=el.dataset.f;
    if(el.type==='radio'){if(el.checked)Q[k]=el.value;}
    else Q[k]=el.type==='checkbox'?el.checked:el.value;
  }else if(el.dataset.d){const [i,f]=el.dataset.d.split('.');Q.diet[i][f]=el.value;}
  else return;
  update();save();
}
// Clicking a selected starter or side again clears it (click fires before change)
document.addEventListener('click',e=>{
  const el=e.target;
  if(el.type!=='radio'||!('clear' in el.dataset))return;
  const k=el.dataset.f;
  if(Q[k]===el.value){el.checked=false;Q[k]='';update();save();}
});
document.addEventListener('input',onChange);
document.addEventListener('change',onChange);

const tierNow=()=>parseInt(Q['din.tier'])||0;
const inTier=it=>it.t.includes(tierNow());
const chosenEntrees=()=>entrees.filter(e=>Q[e.key+'.sel']&&inTier(e));
const bfTierNow=()=>parseInt(Q['bf.tier'])||0;
const bfChosen=list=>{const t=bfTierNow();return list.filter(it=>Q['bf.'+it.key]&&(!t||it.t.includes(t)));};
const allMenu=[...salads,...starters,...entrees,...sides];
const anyDessert=()=>desserts.some(d=>num(d.key+'.qty')>0);

function update(){
  const style=Q['q.din']||'';
  const ent=chosenEntrees(),bE=bfChosen(entrees);
  const beefList=style==='plated'?ent:style==='buffet'?bE:[];
  Q['q.hasBeef']=beefList.some(e=>/beef|strip/i.test(e.name))?'yes':'no';
  // data-show="key=value" shows on a match; "key!=value" shows once answered with anything else
  document.querySelectorAll('[data-show]').forEach(el=>{
    const m=el.dataset.show.match(/^([^!=]+)(!?=)(.*)$/);const v=String(Q[m[1]]||'');
    el.hidden=m[2]==='='?v!==m[3]:(v===''||v===m[3]);
  });
  const tier=tierNow();
  $('courses').hidden=!tier;$('tier-hint').hidden=!!tier;
  document.querySelectorAll('[data-tiers]').forEach(r=>{r.hidden=!!tier&&!r.dataset.tiers.split(',').includes(String(tier));});
  const bt=bfTierNow();
  $('bf-courses').hidden=!bt;$('bf-hint').hidden=!!bt;
  document.querySelectorAll('[data-bft]').forEach(r=>{
    r.hidden=!!bt&&!r.dataset.bft.split(',').includes(String(bt));
    const it=allMenu.find(x=>x.key===r.dataset.key);if(it)r.querySelector('.ds').textContent=bufDesc(it,bt)||'';
  });
  document.querySelectorAll('[data-tiers]').forEach(r=>{const it=allMenu.find(x=>x.key===r.dataset.key);if(it&&tier)r.querySelector('.ds').textContent=bufDesc(it,tier)||'';});
  // Suggested dessert servings
  const G=num('ev.expected'),sugg=(style==='plated'?num('din.guests'):style==='buffet'?num('bf.guests'):0)||G;
  desserts.forEach(d=>{const el=document.querySelector(`[data-f="${d.key}.qty"]`);if(el)el.placeholder=sugg?`e.g., ${sugg}`:' ';});
  // Warnings
  const wm=[];
  suite.forEach(s=>{const q=num(s.key+'.qty');if(q>0&&q<10)wm.push(`${s.name} has a 10-guest minimum.`);});
  brunch.forEach(s=>{const q=num(s.key+'.qty');if(q>0&&q<25)wm.push(`${s.name} has a 25-guest minimum.`);});
  $('w-morning').textContent=wm.join(' ');
  const rg=num('rec.guests')||G;
  $('w-rec').textContent=Q['q.rec']==='yes'&&rg&&rg<25?'The reception has a 25-guest minimum.':'';
  const wd=[];
  if(style==='plated'){
    if(!tier)wd.push('Choose a menu level.');
    else{
      const sal=salads.find(s=>s.key===Q['q.salad']&&inTier(s));
      const st=starters.some(s=>s.key===Q['q.starter']&&inTier(s));
      if(!sal)wd.push('Choose a salad.');
      if(!st&&!anyDessert())wd.push('Choose a starter, or leave it blank and choose a dessert in Step 7 to serve in its place.');
      if(!ent.length)wd.push('Choose your entrees.');
      else{if(ent.length>3)wd.push('Choose no more than three entrees.');if(!ent.some(e=>e.veg))wd.push('Include one vegetarian entree.');}
      if(!sides.some(s=>s.key===Q['q.starch']&&inTier(s)))wd.push('Choose one starch side.');
      if(!sides.some(s=>s.key===Q['q.veg']&&inTier(s)))wd.push('Choose one vegetable side.');
    }
  }
  $('w-din').textContent=wd.join(' ');
  const wf=[];
  if(style==='buffet'){
    const bS=bfChosen(salads);
    if(!bt)wf.push('Choose a menu level.');
    if(bS.length<1)wf.push('Choose a salad.');
    if(bS.length>2)wf.push('Choose no more than two salads.');
    if(bE.length<2)wf.push('Choose at least two entrees, including one vegetarian.');
    else{if(bE.length>3)wf.push('Choose no more than three entrees.');if(!bE.some(e=>e.veg))wf.push('Include one vegetarian entree.');}
    const okSide=k=>{const it=sides.find(x=>x.key===Q[k]);return it&&(!bt||it.t.includes(bt));};
    if(!okSide('q.bfStarch'))wf.push('Choose one starch side.');
    if(!okSide('q.bfVeg'))wf.push('Choose one vegetable side.');
  }
  $('w-bf').textContent=wf.join(' ');
  renderEstimate();
}

/* ---------- Map answers onto the BEO form ---------- */
function buildBEO(){
  const D={'bill.svc':'3','bill.tax':'8'};
  const copy=(...ks)=>ks.forEach(k=>{const v=Q[k];if(v!==undefined&&v!==''&&v!==false)D[k]=typeof v==='string'?v.trim():v;});
  copy('ev.contact','ev.client','ev.phone','ev.email','ev.address','ev.name','ev.type','ev.date','ev.start','ev.end','ev.expected','ev.room',
       'rm.style','rm.head','rm.linen','rm.decor','rm.av','rm.vendors','bev.open','bev.close');
  if(Q['ev.room']==='Other')copy('ev.roomAddr');
  D['ev.third']=Q['ev.room']===THIRD;
  if(Q['ev.contact'])D['sig.client']=String(Q['ev.contact']).trim();
  const G=num('ev.expected');
  const roomLbl=Q['ev.room']==='Other'?(String(Q['ev.roomAddr']||'').trim()||'Other'):String(Q['ev.room']||'');
  const style=Q['q.din']||'';
  // Timeline
  if(Q['q.arrive'])D['tl.1.time']=Q['q.arrive'];
  if(Q['q.rec']==='yes'&&Q['q.arrive'])D['tl.2.time']=Q['q.arrive'];
  if((style==='plated'||style==='buffet')&&Q['q.seat'])D['tl.3.time']=Q['q.seat'];
  if(roomLbl){for(let i=0;i<9;i++)D[`tl.${i}.loc`]=roomLbl;D['tl.autoLoc']=roomLbl;}
  // Morning
  if(Q['q.morning']==='yes'){
    [...suite,...brunch,...stations].forEach(it=>{const q=num(it.key+'.qty');if(q)D[it.key+'.qty']=String(q);});
    copy('suite.time','suite.room');
    if(num('st.carving.qty'))D['carv.protein']=Q['carv.protein']||'NY strip loin';
  }
  // Reception
  if(Q['q.rec']==='yes'){
    const rg=num('rec.guests')||G,len=Q['rec.len']==='2'?2:1;
    if(rg)D['rec.guests']=String(rg);
    D['rec.len']=String(len);
    const picks=[...hot,...cold].filter(it=>Q['q.'+it.key]);
    if(picks.length&&rg){const per=Math.ceil(Math.ceil(rg*(len===2?5.5:3.5))/picks.length);picks.forEach(it=>D[it.key+'.qty']=String(per));}
    enh.filter(it=>Q['q.'+it.key]).forEach(it=>{if(rg)D[it.key+'.qty']=String(rg);});
  }
  // Plated dinner
  const tier=tierNow();
  if(style==='plated'&&tier){
    const dg=num('din.guests')||G;
    D['din.tier']=String(tier);
    if(dg)D['din.guests']=String(dg);
    D['din.mode']=Q['din.mode']==='table'?'table':'pre';
    const sal=salads.find(s=>s.key===Q['q.salad']&&inTier(s));if(sal)D[sal.key+'.sel']=true;
    const st=starters.find(s=>s.key===Q['q.starter']&&inTier(s));
    if(st)D[st.key+'.sel']=true;else if(anyDessert())D['din.dessertInstead']=true;
    chosenEntrees().forEach(e=>D[e.key+'.sel']=true);
    sides.filter(s=>(s.key===Q['q.starch']||s.key===Q['q.veg'])&&inTier(s)).forEach(s=>D[s.key+'.sel']=true);
    if(Q['q.hasBeef']==='yes')copy('din.temp');
  }else D['din.tier']='';
  // Dinner buffet
  if(style==='buffet'){
    const bg=num('bf.guests')||G;
    if(bg)D['bf.guests']=String(bg);
    const bt=bfTierNow();if(bt)D['bf.tier']=String(bt);
    [...bfChosen(salads),...bfChosen(entrees)].forEach(it=>D['bf.'+it.key]=true);
    [Q['q.bfStarch'],Q['q.bfVeg']].forEach(k=>{const it=sides.find(x=>x.key===k);if(it&&(!bt||it.t.includes(bt)))D['bf.'+k]=true;});
    if(Q['q.hasBeef']==='yes'&&Q['din.temp'])D['bf.temp']=Q['din.temp'];
  }
  // Desserts
  desserts.forEach(d=>{const q=num(d.key+'.qty');if(q)D[d.key+'.qty']=String(q);});
  // Beverages
  const bar=String(Q['q.bar']||'');
  if(bar&&!/^No bar/.test(bar))D['bv.bar.qty']='1';
  if(Q['q.wine'])D['bv.wine.qty']='1';
  if(Q['q.toast'])D['bv.toast.qty']='1';
  if(Q['q.na'])D['bv.na.qty']='1';
  // Dietary needs
  const diet=Q.diet.filter(r=>r&&(r.name||r.allergy||r.note)).map(r=>({name:(r.name||'').trim(),table:'',allergy:(r.allergy||'').trim(),sub:(r.note||'').trim(),ok:false}));
  while(diet.length<3)diet.push({});
  D.__diet=diet;
  // Notes
  const n=[];
  if(Q.notes&&String(Q.notes).trim())n.push(String(Q.notes).trim());
  const extra=[];
  if(bar)extra.push(`Bar service: ${bar}.`);
  if(Q['q.rec']==='yes'&&[...hot,...cold].some(it=>Q['q.'+it.key]))extra.push('Canapé quantities were estimated from the reception guest count; please confirm.');
  if(extra.length)n.push('From the client questionnaire: '+extra.join(' '));
  if(n.length)D.notes=n.join('\n\n');
  D.__src={version:QVER,estimate:Math.round(estimate(D).total*100)/100};
  return D;
}

/* ---------- Estimate: same math as the BEO billing summary ---------- */
function estimate(D){
  const n=k=>{const v=parseFloat(D[k]);return isFinite(v)&&v>0?v:0;};
  const sum=list=>list.reduce((a,it)=>a+n(it.key+'.qty')*(it.price||0),0);
  const suiteT=sum(suite),brunchT=sum(brunch)+sum(stations);
  let attend=0;stations.forEach(s=>{const q=n(s.key+'.qty');if(q)attend+=Math.ceil(q/35)*150;});
  const canT=sum(hot)+sum(cold),enhT=sum(enh);
  const tier=parseInt(D['din.tier'])||0,dg=n('din.guests');
  const dinT=tier*dg,tableT=tier&&D['din.mode']==='table'?35*dg:0;
  const bfOn=Q['q.din']==='buffet',bg=n('bf.guests'),bp=bfPrice(parseInt(D['bf.tier'])||0);
  const bufT=bfOn?bp*bg:0;
  const dessT=sum(desserts);
  const fb=suiteT+brunchT+canT+enhT+dinT+tableT+bufT+dessT;
  const rental=D['ev.third']&&fb<=2500?250:0;
  const svcPct=n('bill.svc'),taxPct=n('bill.tax');
  const sub=fb+attend+rental,svc=fb*svcPct/100,tax=(sub+svc)*taxPct/100,total=sub+svc+tax;
  const quoted=[];
  if(['bv.bar','bv.wine','bv.toast','bv.na'].some(k=>n(k+'.qty')))quoted.push('beverage service');
  const lines=[['In-suite dining',suiteT],['Brunch and stations',brunchT],['Chef attendant fees',attend],['Reception canapés',canT],['Reception displays',enhT],
    [tier?`Plated dinner ($${tier} × ${dg})`:'Plated dinner',dinT],['Tableside entree selection',tableT],[bp?`Dinner buffet ($${bp} × ${bg})`:'Dinner buffet',bufT],
    ['Desserts',dessT],['Third-floor room fee',rental]].filter(l=>l[1]);
  return {lines,sub,svc,tax,total,svcPct,taxPct,quoted};
}
function renderEstimate(){
  const E=estimate(buildBEO());
  const has=E.lines.length>0;
  $('estEmpty').hidden=has;
  $('estLines').innerHTML=has?E.lines.map(([l,v])=>`<dt>${esc(l)}</dt><dd>${typeof v==='number'?fmt(v):esc(v)}</dd>`).join('')+
    `<dt class="subt">Subtotal</dt><dd class="subt">${fmt(E.sub)}</dd><dt>Service charge (${E.svcPct}%)</dt><dd>${fmt(E.svc)}</dd><dt>Sales tax (${E.taxPct}%)</dt><dd>${fmt(E.tax)}</dd>`:'';
  $('estTotal').textContent=fmt(E.total);$('estTotal2').textContent=fmt(E.total);
  $('estNote').textContent='Estimate only. Final pricing is confirmed on your banquet event order.'+(E.quoted.length?` Not included: ${E.quoted.join(' and ')}, priced by your event manager.`:'');
}

function missing(needEmail){
  const m=[];
  if(!Q['ev.contact'])m.push('your name');
  if(needEmail&&!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(Q['ev.email']||'').trim()))m.push('your email address');
  else if(!Q['ev.email']&&!Q['ev.phone'])m.push('an email or phone number');
  if(!Q['ev.date'])m.push('the event date');
  if(!num('ev.expected'))m.push('the expected number of guests');
  return m;
}
function longDate(d){if(!d)return '';const p=String(d).split('-').map(Number);if(p.length!==3||!p[0])return d;return new Date(p[0],p[1]-1,p[2]).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});}

/* ---------- Send my selections ----------
   Phones and tablets: the share menu attaches the file to a new email automatically.
   Computers: browsers can't attach files to an email for you, so the file is saved and a
   pop-up walks the client through attaching it (plus a share-menu option where supported). */
const dlg=$('sendDlg'),dlgBody=$('sendBody');
function showDlg(html){dlgBody.innerHTML=html;try{if(!dlg.open)dlg.showModal();}catch(e){dlg.setAttribute('open','');}}
dlg.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const act=b.dataset.act;
  if(act==='close')dlg.close();
  else if(act==='copy'){try{await navigator.clipboard.writeText(SEND_TO.join(', '));b.textContent='Copied';}catch(_){b.textContent=SEND_TO.join(', ');}}
  else if(act==='save'&&dlg._save)dlg._save(b);
  else if(act==='copybody'){try{await navigator.clipboard.writeText(dlg._body||'');b.textContent='Message copied';}catch(_){b.textContent='Select and copy from your email instead';}}
});
const addrHtml=()=>SEND_TO.map(a=>`<span class="addr">${esc(a)}</span>`).join('<br>');

async function fileFlow(note){
  const st=$('status');
  const D=buildBEO(),E=estimate(D);
  const label=(Q['ev.name']||Q['ev.contact']||'Event').trim();
  const name=('Eden selections - '+label).replace(/[\\/:*?"<>|]+/g,'').replace(/\s+/g,' ').trim()+'.json';
  const blob=new Blob([JSON.stringify({eden:'beo-questionnaire',v:2,version:QVER,saved:new Date().toISOString(),beo:D,answers:Q},null,1)],{type:'application/json'});
  const file=new File([blob],name,{type:'application/json'});
  const date=longDate(Q['ev.date']);
  const style=Q['q.din']==='plated'?`Plated dinner${tierNow()?` ($${tierNow()} per person)`:''}`:Q['q.din']==='buffet'?`Dinner buffet${bfTierNow()?` ($${bfPrice(bfTierNow())} per person)`:''}`:'No dinner';
  const subject=`Event selections: ${label}${date?' – '+date:''}`;
  const body=['Hi Tyler and Rich,','',`Attached are my event selections from the Eden questionnaire (file: ${name}).`,'',
    `Name: ${Q['ev.contact']||''}`,`Phone: ${Q['ev.phone']||''}`,`Email: ${Q['ev.email']||''}`,`Event: ${Q['ev.name']||''}`,`Date: ${date}`,
    `Expected guests: ${Q['ev.expected']||''}`,`Location: ${Q['ev.room']==='Other'?(Q['ev.roomAddr']||'Off-site'):(Q['ev.room']||'')}`,`Dinner: ${style}`,
    `Estimated total: ${fmt(E.total)}${E.quoted.length?` (not including ${E.quoted.join(' and ')})`:''}`,'','Thank you,',Q['ev.contact']||''].join('\n');
  const mailto=`mailto:${SEND_TO.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  dlg._save=async btn=>{
    let dl=null;try{dl=window.claude&&await claude.use('downloads');}catch(_){}
    if(!dl){btn.textContent='Saving isn\'t available here';btn.disabled=true;return;}
    try{await dl.save({filename:name,data:blob});btn.textContent='Saved ✓';st.textContent=`Saved “${name}”. Attach it to an email to Eden and send it.`;}
    catch(e){if(e&&e.code==='declined')btn.textContent='Save my file';else if(e&&e.code==='rate_limited')btn.textContent='Try again in a moment';else{btn.textContent='Saving isn\'t available here';btn.disabled=true;}}
  };
  dlg._body=subject+'\n\n'+body;
  showDlg(`<h2 id="sendTitle">Send your selections to Eden</h2>
    <ol class="steps">
      <li><b>Save your selections file.</b><br><button type="button" data-act="save" style="margin-top:8px">Save my file</button><br><span class="q-note">“${esc(name)}”</span></li>
      <li><b>Start an email to our event team</b> at:<br>${addrHtml()}<br><span class="dlg-row"><button type="button" data-act="copy" class="ghost">Copy addresses</button><button type="button" data-act="copybody" class="ghost">Copy a message</button><a class="mail-alt" href="${esc(mailto)}" target="_blank" rel="noopener">Open in my email app</a></span></li>
      <li><b>Attach the file and send.</b> Your event manager will be in touch to confirm details and pricing.</li>
    </ol>
    <div class="actions"><button type="button" data-act="close">Done</button></div>`);
  if(note)dlgBody.insertAdjacentHTML('afterbegin',`<p class="q-note dlg-note">${esc(note)}</p>`);
  st.textContent='Your answers are ready to send. Follow the steps to email them to Eden.';
}

/* ---------- Sending online (through the staff site), with bot screening ----------
   When the staff site's inquiry service is switched on, "Send my selections" sends the answers directly.
   Bots are screened out by Cloudflare Turnstile (only shown if it needs to check), a hidden field people
   never see, a too-fast check, and limits on the server. If online sending isn't available, the
   questionnaire falls back to saving a file to email, as before. */
const CF=window.EDEN_CONFIG||{};
const SVC=CF.staffSite?String(CF.staffSite).replace(/\/?$/,'/'):'';
const STARTED='eden-questionnaire-started';
function started(){let v=0;try{v=+localStorage.getItem(STARTED)||0;}catch(e){}return v;}
function markStarted(){if(started())return;try{localStorage.setItem(STARTED,String(Date.now()));}catch(e){}}
document.addEventListener('change',e=>{if(e.target&&(e.target.dataset.f||e.target.dataset.d))markStarted();});
document.addEventListener('input',e=>{if(e.target&&(e.target.dataset.f||e.target.dataset.d))markStarted();});
let online=null,onlineP=null,tsId=null,tsToken='';
function getOnline(){
  if(onlineP)return onlineP;
  if(!SVC||!window.fetch)return onlineP=Promise.resolve({ready:false});
  onlineP=fetch(SVC+'inquiry/config',{cache:'no-store'}).then(r=>r.ok?r.json():{ready:false}).catch(()=>({ready:false})).then(c=>{
    online=c||{ready:false};
    if(online.ready){
      $('sendNote').textContent=online.confirm
        ?'When you send your selections, we’ll email you a link to confirm your address. Once you click it, your selections go straight to our event team, and your event manager will follow up with a banquet event order and final pricing.'
        :'Your selections go straight to our event team. Your event manager will review them and follow up with a banquet event order and final pricing.';
      if(online.turnstile)loadTurnstile(online.turnstile);
    }
    return online;
  });
  return onlineP;
}
function loadTurnstile(key){
  const render=()=>{try{tsId=window.turnstile.render('#qTs',{sitekey:key,appearance:'interaction-only',action:'catering',
    callback:t=>{tsToken=t;},'expired-callback':()=>{tsToken='';},'error-callback':()=>{tsToken='';}});}catch(e){}};
  if(window.turnstile){render();return;}
  window.__edenTs=render;
  const sc=document.createElement('script');sc.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__edenTs';sc.async=true;sc.defer=true;
  document.head.appendChild(sc);
}
function waitToken(ms){return new Promise(res=>{const t0=Date.now();(function chk(){if(tsToken||Date.now()-t0>ms)return res(tsToken);setTimeout(chk,200);})();});}
// only on the catering page, so the rest of the site loads exactly as before
function onCater(){return location.hash==='#catering';}
if(onCater())getOnline();
window.addEventListener('hashchange',()=>{if(onCater())getOnline();});

/* What they chose, in words, for the event team */
const NAMES={};
[[suite,'Morning'],[brunch,'Morning'],[stations,'Morning'],[hot,'Reception'],[cold,'Reception'],[enh,'Reception'],[salads,'Dinner'],[starters,'Dinner'],[entrees,'Dinner'],[sides,'Dinner'],[desserts,'Desserts']]
  .forEach(([list,sec])=>list.forEach(it=>{NAMES[it.key]=[sec,clean(it.name)];}));
function summary(D){
  const out={},add=(sec,line)=>{(out[sec]=out[sec]||[]).push(line);};
  if(D['rec.guests'])add('Reception',`${D['rec.guests']} guests, ${D['rec.len']==='2'?'2 hours':'1 hour'}`);
  if(D['din.tier'])add('Dinner',`Plated dinner, $${D['din.tier']} per person, ${D['din.guests']||'?'} guests${D['din.mode']==='table'?', entrees chosen tableside':''}`);
  if(D['bf.guests']&&Q['q.din']==='buffet')add('Dinner',`Dinner buffet${D['bf.tier']?`, $${bfPrice(+D['bf.tier'])} per person`:''}, ${D['bf.guests']} guests`);
  Object.keys(D).forEach(k=>{
    let m;
    if((m=k.match(/^(.*)\.qty$/))&&NAMES[m[1]]&&!/^bv\./.test(k))add(NAMES[m[1]][0],`${NAMES[m[1]][1]} × ${D[k]}`);
    else if((m=k.match(/^(.*)\.sel$/))&&NAMES[m[1]]&&D[k]===true)add(NAMES[m[1]][0],NAMES[m[1]][1]);
    else if((m=k.match(/^bf\.(.*)$/))&&NAMES[m[1]]&&D[k]===true)add('Dinner',NAMES[m[1]][1]+' (buffet)');
  });
  if(D['din.temp']||D['bf.temp'])add('Dinner','Beef cooked '+(D['din.temp']||D['bf.temp']));
  const bev=[];const bar=String(Q['q.bar']||'');if(bar)bev.push(bar);if(Q['q.wine'])bev.push('Wine service with dinner');if(Q['q.toast'])bev.push('Champagne toast');if(Q['q.na'])bev.push('Non-alcoholic beverages');
  bev.forEach(b=>add('Beverages',b));
  Q.diet.filter(r=>r&&(r.name||r.allergy||r.note)).forEach(r=>add('Allergies and dietary needs',[r.name,r.allergy,r.note].filter(Boolean).join(' · ')));
  ['rm.style','rm.head','rm.linen','rm.decor','rm.av','rm.vendors'].forEach(k=>{if(Q[k])add('Room and setup',String(Q[k]).trim());});
  return Object.keys(out).map(k=>[k,out[k]]);
}

async function sendOnline(){
  const st=$('status'),sb=$('sendBtn'),wf=$('w-final');
  const D=buildBEO(),E=estimate(D);
  sb.disabled=true;sb.textContent='Sending…';
  try{
    if(online.turnstile&&!tsToken){
      try{if(window.turnstile&&tsId!=null)window.turnstile.execute(tsId);}catch(e){}
      await waitToken(8000);
      if(!tsToken){wf.textContent='Please complete the quick check above the Send button, then send again.';return;}
    }
    const body={hp:$('qHp').value,elapsed:started()?Date.now()-started():0,token:tsToken,ack:$('qAck').checked,
      answers:Q,beo:D,estimate:Math.round(E.total*100)/100,summary:summary(D)};
    let r=null,j={};
    try{r=await fetch(SVC+'inquiry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});j=await r.json().catch(()=>({}));}catch(e){r=null;}
    if(!r||r.status>=500){try{console.warn('Eden questionnaire: online sending failed',r&&r.status,j);}catch(e){}
      fileFlow('We couldn’t send your selections online just now, so here’s the other way to get them to us.');return;}
    if(j.ok){
      wf.textContent='';
      const em=esc(String(Q['ev.email']||'').trim());
      if(j.confirm)showDlg(`<h2 id="sendTitle">Check your email</h2>
        <p>We sent a link to <b>${em}</b>. Click <b>Confirm my inquiry</b> in that email, and your selections go straight to our event team.</p>
        <p class="q-note">Don’t see it in a few minutes? Check your spam or promotions folder, or email us at events@edencny.com.</p>
        <div class="actions"><button type="button" data-act="close">Done</button></div>`);
      else showDlg(`<h2 id="sendTitle">Thank you</h2>
        <p>Your selections are on their way to our event team. Your event manager will be in touch to confirm details and pricing.</p>
        <div class="actions"><button type="button" data-act="close">Done</button></div>`);
      st.textContent=j.confirm?`Almost done: confirm your email (${String(Q['ev.email']||'').trim()}) to send your selections.`:'Sent. Thank you!';
      return;
    }
    if(j.error==='verify'){tsToken='';try{if(window.turnstile&&tsId!=null)window.turnstile.reset(tsId);}catch(e){}}
    wf.textContent=j.message||'Something went wrong. Please try again.';
  }finally{sb.disabled=false;sb.textContent='Send my selections';}
}

$('sendBtn').addEventListener('click',async()=>{
  const wf=$('w-final');
  await getOnline();
  const m=missing(!!(online&&online.ready));
  if(!$('qAck').checked)m.push('a check in the box above the Send button');
  if(online&&online.ready){
    if(m.length){wf.textContent=`Please add ${m.join(', ')}.`;return;}
    return sendOnline();
  }
  const sb=$('sendBtn');
  wf.textContent=m.length?`Please add ${m.join(', ')} so we can reach you about your event.`:'';
  if(m.length&&!sb.dataset.anyway){sb.dataset.anyway='1';sb.textContent='Send anyway';return;}
  delete sb.dataset.anyway;sb.textContent='Send my selections';
  fileFlow();
});

/* The guest clicked "Confirm my inquiry" in their email: edencny.com/#confirm-… */
(function(){
  const m=location.hash.match(/^#confirm-([a-f0-9]{40,80})$/);
  if(!m||!SVC)return;
  history.replaceState(null,'','#catering');   // before the page decides what to show
  const show=html=>{const go=()=>showDlg(html);if(document.readyState==='complete')setTimeout(go,50);else window.addEventListener('load',()=>setTimeout(go,50));};
  fetch(SVC+'confirm',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({t:m[1]})})
    .then(r=>r.json().catch(()=>({}))).catch(()=>({error:'network'})).then(j=>{
      if(j.ok)show(`<h2 id="sendTitle">${j.already?'Already confirmed':'Thank you'+(j.name?', '+esc(j.name):'')}</h2>
        <p>${j.already?'We already have your selections.':'Your email is confirmed and your selections are on their way to our event team.'} Your event manager will be in touch to confirm details and pricing.</p>
        <div class="actions"><button type="button" data-act="close">Done</button></div>`);
      else show(`<h2 id="sendTitle">We couldn’t confirm that link</h2>
        <p>${j.error==='expired'?'The link has expired.':'The link may be incomplete or out of date.'} Please send your selections again, or email us at events@edencny.com.</p>
        <div class="actions"><button type="button" data-act="close">Done</button></div>`);
    });
})();


$('clearBtn').addEventListener('click',()=>{
  const cb=$('clearBtn');
  if(!cb.dataset.sure){cb.dataset.sure='1';cb.textContent='Tap again to clear everything';setTimeout(()=>{delete cb.dataset.sure;cb.textContent='Start over';},4000);return;}
  delete cb.dataset.sure;cb.textContent='Start over';
  Q={diet:[{}]};try{localStorage.removeItem(STORE);localStorage.removeItem(STARTED);}catch(e){}
  $('qAck').checked=false;
  document.querySelectorAll('[data-f]').forEach(el=>{if(el.type==='radio'||el.type==='checkbox')el.checked=false;else if(el.tagName==='SELECT')el.selectedIndex=0;else el.value='';});
  renderDiet();update();$('status').textContent='Answers cleared.';$('w-final').textContent='';
});

update();
})();
