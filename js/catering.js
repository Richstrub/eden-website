/* Catering questionnaire */
(function(){
const QVER='October 9, 2026';
const SEND_TO=['Tyler@edencny.com','Rich@edencny.com'];
const STORE='eden-questionnaire-v1',THIRD='3rd Floor Event Space';
// A guest's private link from our event team (#plan-<code>) opens the full questionnaire, already filled in.
// Without one, the page is the short inquiry form (steps 1 and 2).
const PLAN=(location.hash.match(/^#plan-([a-f0-9]{64})$/)||[])[1]||'';
const STORE_KEY=PLAN?STORE+'-plan-'+PLAN.slice(0,16):STORE;
if(PLAN)document.getElementById('cater').classList.replace('q-intake','q-plan');
let Q={};
try{Q=JSON.parse(localStorage.getItem(STORE_KEY)||'{}')||{};}catch(e){Q={};}
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
// Type of event: tick all that apply; kept as one line ("Wedding, Dinner") so the staff site and BEO read it as before
const TYPE_BOXES=[...document.querySelectorAll('#evTypes [data-t]')];
function restoreTypes(){const on=String(Q['ev.type']||'').split(/\s*,\s*/).filter(Boolean);TYPE_BOXES.forEach(b=>{b.checked=on.includes(b.dataset.t);});}
TYPE_BOXES.forEach(b=>b.addEventListener('change',()=>{Q['ev.type']=TYPE_BOXES.filter(x=>x.checked).map(x=>x.dataset.t).join(', ');const h=document.querySelector('[data-f="ev.type"]');if(h)h.value=Q['ev.type'];update();save();}));
function restore(){
  restoreTypes();
  document.querySelectorAll('[data-f]').forEach(el=>{
    const v=Q[el.dataset.f];
    if(el.type==='radio')el.checked=v!==undefined&&String(v)===el.value;
    else if(el.type==='checkbox')el.checked=!!v;
    else if(v!==undefined)el.value=v;
  });
}
restore();

let t;
function save(){clearTimeout(t);t=setTimeout(()=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(Q));}catch(e){}},250);}
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
// tapping the greyed-out à la carte option says how to unlock it
$('alaPill').addEventListener('click',()=>{const i=$('alaPill').querySelector('input');if(i&&i.disabled)$('w-ala').textContent='À la carte is available in the Restaurant or the 3rd Floor Event Space. To choose it, set “Where would you like to hold it?” in Step 2 to one of those.';});
document.addEventListener('change',onChange);

const tierNow=()=>parseInt(Q['din.tier'])||0;
const inTier=it=>it.t.includes(tierNow());
const chosenEntrees=()=>entrees.filter(e=>Q[e.key+'.sel']&&inTier(e));
const bfTierNow=()=>parseInt(Q['bf.tier'])||0;
const bfChosen=list=>{const t=bfTierNow();return list.filter(it=>Q['bf.'+it.key]&&(!t||it.t.includes(t)));};
const allMenu=[...salads,...starters,...entrees,...sides];
const anyDessert=()=>desserts.some(d=>num(d.key+'.qty')>0);

// À la carte dinner is offered only in the Restaurant and the 3rd Floor Event Space
const ALA_ROOMS=['Restaurant',THIRD];
let alaCleared=false;
/* Bar packages. Every package: $75 setup and $15 per bartender per hour, one bartender plus one for every 30 guests.
   Open bar per guest: beer and wine $16 the first hour, $12 each hour after; with cocktails $18, then $16.
   Cash bar: each guest pays their own tab at the end of the meal. Consumption bar: the host pays the tab at the end.
   No beverage service at Palladian Hall. The bar menu is offered only with an à la carte dinner in the Restaurant. */
const BAR={setup:75,perBartender:15,guestsPer:30,pkgs:{
  menu:{name:'Our bar menu'},'open-bw':{name:'Open bar: beer and wine',first:16,after:12},
  'open-full':{name:'Open bar: beer, wine and cocktails',first:18,after:16},cash:{name:'Cash bar'},cons:{name:'Consumption bar'}}};
const PALLADIAN='Palladian Hall';
function barHours(a,b){a=String(a||'');b=String(b||'');if(!/^\d\d:\d\d/.test(a)||!/^\d\d:\d\d/.test(b))return 0;
  const m=x=>+x.slice(0,2)*60+ +x.slice(3,5);let d=m(b)-m(a);if(d<=0)d+=1440;return Math.ceil(d/60);}
// the bar's cost from a set of answers: fees (setup, bartenders), food-and-beverage charges, and what is billed later
function barPrice(key,G,open,close){
  const P=BAR.pkgs[key],r={lines:[],fees:0,fb:0,later:'',n:0,h:0,pp:0};
  if(!P)return r;
  if(key==='menu'){r.later='drinks from our bar menu, billed as ordered';return r;}
  const h=barHours(open,close),n=1+Math.floor((G||0)/BAR.guestsPer);r.n=n;r.h=h;
  r.fees=BAR.setup+(h?n*h*BAR.perBartender:0);
  r.lines.push(['Bar setup',BAR.setup]);
  if(h)r.lines.push([`Bartenders (${n} × ${h} hr × $${BAR.perBartender})`,n*h*BAR.perBartender]);
  else r.later='bartenders (add the bar opening and closing times to include them)';
  if(P.first&&h){r.pp=P.first+P.after*(h-1);r.fb=r.pp*(G||0);r.lines.push([`${P.name} (${G||0} guests × $${r.pp})`,r.fb]);}
  else if(P.first)r.later='the open bar (add the bar opening and closing times to include it)';
  if(key==='cash')r.later='cash bar tabs, paid by each guest at the end of the meal';
  if(key==='cons')r.later='the consumption bar tab, due from you at the end of the meal';
  return r;
}
function update(){
  const room=String(Q['ev.room']||'');
  Q['q.alaOk']=ALA_ROOMS.includes(room)?'yes':'no';
  if(Q['q.din']==='ala'&&Q['q.alaOk']!=='yes'){
    Q['q.din']='';alaCleared=true;
    document.querySelectorAll('[data-f="q.din"]').forEach(r=>{r.checked=false;});
  }else if(Q['q.din'])alaCleared=false;
  Q['q.alaThird']=Q['q.din']==='ala'&&room===THIRD?'yes':'no';
  // always listed, so guests know it exists; it can be chosen once the location (Step 2) is the Restaurant or the 3rd floor
  const alaIn=document.querySelector('#alaPill input');
  if(alaIn){alaIn.disabled=Q['q.alaOk']!=='yes';$('alaPill').classList.toggle('off',alaIn.disabled);
    $('alaPill').title=alaIn.disabled?'Choose the Restaurant or the 3rd Floor Event Space in Step 2 to order à la carte':'';}
  $('w-ala').textContent=alaCleared?'À la carte is only available in the Restaurant or the 3rd Floor Event Space, so your dinner choice was cleared. Please choose another, or change the location in Step 2.':'';
  const style=Q['q.din']||'';
  // Dessert (Step 7) is offered with a plated dinner or a dinner buffet only
  Q['q.dinMeal']=style==='plated'||style==='buffet'?'yes':'no';
  const ent=chosenEntrees(),bE=bfChosen(entrees);
  const beefList=style==='plated'?ent:style==='buffet'?bE:[];
  Q['q.hasBeef']=beefList.some(e=>/beef|strip/i.test(e.name))?'yes':'no';
  // Beverages: none at Palladian Hall; our bar menu only with an à la carte dinner in the Restaurant
  Q['q.barOk']=room&&room===PALLADIAN?'no':'yes';
  const menuOk=style==='ala'&&room==='Restaurant',bs=$('qBar');
  if(bs){
    const has=!!bs.querySelector('option[value="menu"]');
    if(menuOk&&!has)bs.insertBefore(new Option('Our bar menu (with à la carte dinner)','menu'),bs.options[1]);
    if(!menuOk&&has)bs.querySelector('option[value="menu"]').remove();
    const clearBar=Q['q.barOk']!=='yes'||(Q['q.bar']&&!BAR.pkgs[Q['q.bar']])||(Q['q.bar']==='menu'&&!menuOk);
    if(clearBar){Q['q.bar']='';bs.value='';}
    if(Q['q.barOk']!=='yes')['q.wine','q.toast','q.na','bev.open','bev.close'].forEach(k=>{Q[k]=k.startsWith('bev')?'':false;const el=document.querySelector(`[data-f="${k}"]`);if(el){if(el.type==='checkbox')el.checked=false;else el.value='';}});
    document.querySelectorAll('#barTerms [data-bar]').forEach(li=>{li.hidden=li.dataset.bar==='menu'&&!menuOk;li.classList.toggle('on',li.dataset.bar===Q['q.bar']);});
    const bp=barPrice(Q['q.bar'],num('ev.expected'),Q['bev.open'],Q['bev.close']),bc=$('barCalc');
    let t='';
    if(Q['q.bar']&&Q['q.bar']!=='menu'){
      t=bp.h?`${bp.n} bartender${bp.n>1?'s':''} for ${bp.h} hour${bp.h>1?'s':''}: $${BAR.setup} setup + $${bp.n*bp.h*BAR.perBartender} bartenders`:`Add your bar opening and closing times to see the bar cost.`;
      if(bp.h&&bp.pp)t+=` + $${bp.pp} per guest × ${num('ev.expected')||0} guests = $${(bp.fees+bp.fb).toLocaleString('en-US')}`;
      else if(bp.h)t+=` = $${bp.fees.toLocaleString('en-US')}`;
      if(bp.h)t+='.';
      if(!num('ev.expected'))t+=' Add your expected guest count in Step 2 for an accurate number.';
    }
    if(bc){bc.textContent=t;bc.hidden=!t;}
  }
  // data-show="key=value" shows on a match; "key!=value" shows once answered with anything else
  document.querySelectorAll('[data-show]').forEach(el=>{
    const m=el.dataset.show.match(/^([^!=]+)(!?=)(.*)$/);const v=String(Q[m[1]]||'');
    el.hidden=m[2]==='='?v!==m[3]:(v===''||v===m[3]);
  });
  // number the steps that are showing, so hiding Dessert doesn't leave a gap
  let sn=0;document.querySelectorAll('#q > section.block .step').forEach(s=>{const sec=s.closest('section');if(sec.hidden||getComputedStyle(sec).display==='none')return;s.textContent='STEP '+(++sn);});
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
  if((style==='plated'||style==='buffet'||style==='ala')&&Q['q.seat'])D['tl.3.time']=Q['q.seat'];
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
  // À la carte (Restaurant or 3rd floor only)
  if(style==='ala'&&ALA_ROOMS.includes(String(Q['ev.room']||'')))D['ev.alacarte']=true;
  // Desserts
  if(style==='plated'||style==='buffet')desserts.forEach(d=>{const q=num(d.key+'.qty');if(q)D[d.key+'.qty']=String(q);});
  // Beverages
  const barOk=String(Q['ev.room']||'')!==PALLADIAN,barKey=barOk&&BAR.pkgs[Q['q.bar']]?String(Q['q.bar']):'';
  const bar=barKey?BAR.pkgs[barKey].name:'';
  if(!barOk){delete D['bev.open'];delete D['bev.close'];}
  if(barKey)D['bev.pkg']=barKey;
  if(barOk&&Q['q.wine'])D['bv.wine.qty']='1';
  if(barOk&&Q['q.toast'])D['bv.toast.qty']='1';
  if(barOk&&Q['q.na'])D['bv.na.qty']='1';
  // Dietary needs
  const diet=Q.diet.filter(r=>r&&(r.name||r.allergy||r.note)).map(r=>({name:(r.name||'').trim(),table:'',allergy:(r.allergy||'').trim(),sub:(r.note||'').trim(),ok:false}));
  while(diet.length<3)diet.push({});
  D.__diet=diet;
  // Notes
  const n=[];
  if(Q.notes&&String(Q.notes).trim())n.push(String(Q.notes).trim());
  const extra=[];
  if(D['ev.alacarte'])extra.push(D['ev.third']?'Dinner: à la carte from the restaurant menu. The guest was told the 3rd Floor Event Space has a $2,500 food and beverage minimum, or a $250 room fee.':'Dinner: à la carte from the restaurant menu.');
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
  const bar=barPrice(D['bev.pkg'],n('ev.expected'),D['bev.open'],D['bev.close']);
  const fb=suiteT+brunchT+canT+enhT+dinT+tableT+bufT+dessT+bar.fb;
  // à la carte is billed on what guests order, so the third-floor minimum can't be judged yet: shown as a reminder instead
  const ala=!!D['ev.alacarte'];
  const rental=D['ev.third']&&!ala&&fb<=2500?250:0;
  const svcPct=n('bill.svc'),taxPct=n('bill.tax');
  const sub=fb+attend+rental+bar.fees,svc=fb*svcPct/100,tax=(sub+svc)*taxPct/100,total=sub+svc+tax;
  const quoted=[];
  if(ala)quoted.push('à la carte dinner (billed on what your guests order)');
  if(bar.later)quoted.push(bar.later);
  if(['bv.wine','bv.toast','bv.na'].some(k=>n(k+'.qty')))quoted.push('wine service, toast and non-alcoholic beverages');
  const lines=[['In-suite dining',suiteT],['Brunch and stations',brunchT],['Chef attendant fees',attend],['Reception canapés',canT],['Reception displays',enhT],
    [tier?`Plated dinner ($${tier} × ${dg})`:'Plated dinner',dinT],['Tableside entree selection',tableT],[bp?`Dinner buffet ($${bp} × ${bg})`:'Dinner buffet',bufT],
    ['Desserts',dessT],...bar.lines,['Third-floor room fee',rental],['À la carte dinner',ala?'Billed as ordered':0],['3rd floor minimum',ala&&D['ev.third']?'$2,500, or $250 room fee':0]].filter(l=>l[1]);
  return {lines,sub,svc,tax,total,svcPct,taxPct,quoted};
}
function renderEstimate(){
  const E=estimate(buildBEO());
  const has=E.lines.length>0;
  $('estEmpty').hidden=has;
  $('estLines').innerHTML=has?E.lines.map(([l,v])=>`<dt>${esc(l)}</dt><dd>${typeof v==='number'?fmt(v):esc(v)}</dd>`).join('')+
    `<dt class="subt">Subtotal</dt><dd class="subt">${fmt(E.sub)}</dd><dt>Service charge (${E.svcPct}%)</dt><dd>${fmt(E.svc)}</dd><dt>Sales tax (${E.taxPct}%)</dt><dd>${fmt(E.tax)}</dd>`:'';
  $('estTotal').textContent=fmt(E.total);$('estTotal2').textContent=fmt(E.total);
  $('estNote').textContent='Estimate only. Final pricing is confirmed on your banquet event order.'+(E.quoted.length?` Not included: ${E.quoted.join('; ')}.`:'');
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
  const style=Q['q.din']==='plated'?`Plated dinner${tierNow()?` ($${tierNow()} per person)`:''}`:Q['q.din']==='buffet'?`Dinner buffet${bfTierNow()?` ($${bfPrice(bfTierNow())} per person)`:''}`:Q['q.din']==='ala'?'À la carte from the restaurant menu':'No dinner';
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

/* ---------- Sending (through the staff site) ----------
   The short form (steps 1 and 2) sends an inquiry to the staff site's Catering & BEOs page. Our event team then
   emails the guest a private link (#plan-…) that opens this full questionnaire, already filled in, which they
   finish and send back. Bots are screened out by Cloudflare Turnstile (only shown if it needs to check), a hidden
   field people never see, a too-fast check, and limits on the server. If the staff site can't be reached, the
   guest is offered email instead. */
const CF=window.EDEN_CONFIG||{};
const SVC=CF.staffSite?String(CF.staffSite).replace(/\/?$/,'/'):'';
const STARTED='eden-questionnaire-started';
function started(){let v=0;try{v=+localStorage.getItem(STARTED)||0;}catch(e){}return v;}
function markStarted(){if(started())return;try{localStorage.setItem(STARTED,String(Date.now()));}catch(e){}}
document.addEventListener('change',e=>{if(e.target&&(e.target.dataset.f||e.target.dataset.d))markStarted();});
document.addEventListener('input',e=>{if(e.target&&(e.target.dataset.f||e.target.dataset.d))markStarted();});
let online=null,onlineP=null,tsId=null,tsToken='',tsErr='',tsAsked=false;
function getOnline(){
  if(onlineP)return onlineP;
  if(!SVC||!window.fetch)return onlineP=Promise.resolve({ready:false});
  onlineP=fetch(SVC+'inquiry/config',{cache:'no-store'}).then(r=>r.ok?r.json():{ready:false}).catch(()=>({ready:false})).then(c=>{
    online=c||{ready:false};
    if(online.ready&&online.turnstile)loadTurnstile(online.turnstile);
    return online;
  });
  return onlineP;
}
function loadTurnstile(key){
  const render=()=>{try{tsId=window.turnstile.render('#qTs',{sitekey:key,appearance:'interaction-only',action:'catering',
    callback:t=>{tsToken=t;tsErr='';},'expired-callback':()=>{tsToken='';},'error-callback':c=>{tsToken='';tsErr=String(c||'error');return true;}});}catch(e){tsErr='render';}};
  if(window.turnstile){render();return;}
  window.__edenTs=render;
  const sc=document.createElement('script');sc.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__edenTs';sc.async=true;sc.defer=true;sc.onerror=()=>{tsErr='load';};
  document.head.appendChild(sc);
}
function waitToken(ms){return new Promise(res=>{const t0=Date.now();(function chk(){if(tsToken||Date.now()-t0>ms)return res(tsToken);setTimeout(chk,200);})();});}
// only on the catering page, so the rest of the site loads exactly as before
function onCater(){return location.hash==='#catering';}
if(!PLAN&&onCater())getOnline();
window.addEventListener('hashchange',()=>{
  const p=(location.hash.match(/^#plan-([a-f0-9]{64})$/)||[])[1]||'';
  if(p&&p!==PLAN){location.reload();return;}
  if(!PLAN&&onCater())getOnline();
});

/* The short form sends only steps 1 and 2 */
const INTAKE_KEYS=[...document.querySelectorAll('#q > section.block:not(.q-full):not(#send) [data-f]')].map(el=>el.dataset.f);
function intakeAnswers(){const a={};INTAKE_KEYS.forEach(k=>{if(Q[k]!==undefined&&Q[k]!=='')a[k]=Q[k];});return a;}

/* What they chose, in words, for the event team */
const NAMES={};
[[suite,'Morning'],[brunch,'Morning'],[stations,'Morning'],[hot,'Reception'],[cold,'Reception'],[enh,'Reception'],[salads,'Dinner'],[starters,'Dinner'],[entrees,'Dinner'],[sides,'Dinner'],[desserts,'Desserts']]
  .forEach(([list,sec])=>list.forEach(it=>{NAMES[it.key]=[sec,clean(it.name)];}));
function summary(D){
  const out={},add=(sec,line)=>{(out[sec]=out[sec]||[]).push(line);};
  if(D['rec.guests'])add('Reception',`${D['rec.guests']} guests, ${D['rec.len']==='2'?'2 hours':'1 hour'}`);
  if(D['din.tier'])add('Dinner',`Plated dinner, $${D['din.tier']} per person, ${D['din.guests']||'?'} guests${D['din.mode']==='table'?', entrees chosen tableside':''}`);
  if(D['ev.alacarte'])add('Dinner',D['ev.third']?'À la carte from the restaurant menu ($2,500 minimum on the 3rd floor, or $250 room fee)':'À la carte from the restaurant menu');
  if(D['bf.guests']&&Q['q.din']==='buffet')add('Dinner',`Dinner buffet${D['bf.tier']?`, $${bfPrice(+D['bf.tier'])} per person`:''}, ${D['bf.guests']} guests`);
  Object.keys(D).forEach(k=>{
    let m;
    if((m=k.match(/^(.*)\.qty$/))&&NAMES[m[1]]&&!/^bv\./.test(k))add(NAMES[m[1]][0],`${NAMES[m[1]][1]} × ${D[k]}`);
    else if((m=k.match(/^(.*)\.sel$/))&&NAMES[m[1]]&&D[k]===true)add(NAMES[m[1]][0],NAMES[m[1]][1]);
    else if((m=k.match(/^bf\.(.*)$/))&&NAMES[m[1]]&&D[k]===true)add('Dinner',NAMES[m[1]][1]+' (buffet)');
  });
  if(D['din.temp']||D['bf.temp'])add('Dinner','Beef cooked '+(D['din.temp']||D['bf.temp']));
  const bev=[];const bar=BAR.pkgs[Q['q.bar']]?BAR.pkgs[Q['q.bar']].name:'';if(bar)bev.push(bar);if(Q['q.wine'])bev.push('Wine service with dinner');if(Q['q.toast'])bev.push('Champagne toast');if(Q['q.na'])bev.push('Non-alcoholic beverages');
  bev.forEach(b=>add('Beverages',b));
  Q.diet.filter(r=>r&&(r.name||r.allergy||r.note)).forEach(r=>add('Allergies and dietary needs',[r.name,r.allergy,r.note].filter(Boolean).join(' · ')));
  ['rm.style','rm.head','rm.linen','rm.decor','rm.av','rm.vendors'].forEach(k=>{if(Q[k])add('Room and setup',String(Q[k]).trim());});
  return Object.keys(out).map(k=>[k,out[k]]);
}

function finished(html){showDlg(html+'<div class="actions"><button type="button" data-act="close">Done</button></div>');}
async function post(path,body){
  let r=null,j={};
  try{r=await fetch(SVC+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});j=await r.json().catch(()=>({}));}catch(e){r=null;}
  if(!r||r.status>=500){try{console.warn('Eden questionnaire: sending failed',r&&r.status,j);}catch(e){}}
  return {r,j};
}
async function busy(fn){const sb=$('sendBtn'),label=sb.textContent;sb.disabled=true;sb.textContent='Sending…';try{await fn();}finally{sb.disabled=false;sb.textContent=label;}}

// If the staff site can't be reached: email the inquiry instead
function intakeMail(note){
  const date=longDate(Q['ev.date']);
  const subject=`Event inquiry: ${(Q['ev.name']||Q['ev.contact']||'Event').trim()}${date?' – '+date:''}`;
  const body=['Hello,','','I’d like to plan an event at Eden.','',`Name: ${Q['ev.contact']||''}`,`Organization: ${Q['ev.client']||''}`,`Phone: ${Q['ev.phone']||''}`,`Email: ${Q['ev.email']||''}`,
    `Event: ${Q['ev.name']||''}`,`Type: ${Q['ev.type']||''}`,`Date: ${date}`,`Time: ${[Q['ev.start'],Q['ev.end']].filter(Boolean).join(' – ')}`,`Expected guests: ${Q['ev.expected']||''}`,
    `Location: ${Q['ev.room']==='Other'?(Q['ev.roomAddr']||'Off-site'):(Q['ev.room']||'')}`,'','Thank you,',Q['ev.contact']||''].join('\n');
  const mailto=`mailto:${SEND_TO.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  dlg._body=subject+'\n\n'+body;
  finished(`<h2 id="sendTitle">Email us your inquiry</h2>${note?`<p class="q-note dlg-note">${esc(note)}</p>`:''}
    <p>Send your details to our event team at:<br>${addrHtml()}</p>
    <p class="dlg-row"><a class="mail-alt" href="${esc(mailto)}" target="_blank" rel="noopener">Open in my email app</a><button type="button" data-act="copy" class="ghost">Copy addresses</button><button type="button" data-act="copybody" class="ghost">Copy a message</button></p>`);
}

async function sendIntake(){
  const st=$('status'),wf=$('w-final');
  // Cloudflare's quick "are you a person" check. A guest is never stuck here: if the check can't run on their
  // device (blocked, failed to load, error) the inquiry is still sent and our team reviews it.
  if(online.turnstile&&!tsToken&&!tsErr){
    try{if(window.turnstile&&tsId!=null)window.turnstile.execute(tsId);}catch(e){}
    st.textContent='Sending…';
    await waitToken(8000);
    const box=$('qTs'),shown=!!(box&&box.querySelector('iframe')&&box.offsetHeight>20);
    if(!tsToken&&!tsErr&&shown&&!tsAsked){tsAsked=true;st.textContent='';wf.textContent='Please tick the box above the Send button, then press Send again.';return;}
  }
  st.textContent='Sending…';
  const {r,j}=await post('inquiry',{hp:$('qHp').value,elapsed:started()?Date.now()-started():0,token:tsToken,tsErr:tsToken?'':(tsErr||'none'),answers:intakeAnswers()});
  if(!r||r.status>=500){intakeMail('We couldn’t send your inquiry online just now, so here’s how to email it to us instead.');return;}
  if(j.ok){
    wf.textContent='';
    finished(`<h2 id="sendTitle">Thank you</h2>
      <p>We’ve received your inquiry. Our event team will email you at <b>${esc(String(Q['ev.email']||'').trim())}</b> with a link to plan your menu and details, already filled in with what you sent.</p>`);
    st.textContent='Sent. Thank you!';
    try{localStorage.removeItem(STARTED);}catch(e){}
    return;
  }
  if(j.error==='verify'){tsToken='';try{if(window.turnstile&&tsId!=null)window.turnstile.reset(tsId);}catch(e){}}
  wf.textContent=j.message||'Something went wrong. Please try again.';
}

async function sendPlan(){
  const st=$('status'),wf=$('w-final');
  const D=buildBEO(),E=estimate(D);
  const {r,j}=await post('plan',{t:PLAN,answers:Q,beo:D,estimate:Math.round(E.total*100)/100,summary:summary(D)});
  if(!r||r.status>=500){fileFlow('We couldn’t send your selections online just now, so here’s another way to get them to us.');return;}
  if(j.ok){
    wf.textContent='';
    finished(`<h2 id="sendTitle">Thank you</h2>
      <p>${j.again?'Your changes are':'Your selections are'} on their way to our event team. Your event manager will be in touch to confirm details and pricing with a banquet event order.</p>
      <p class="q-note">You can come back to this link to make changes until your event is confirmed.</p>`);
    st.textContent=j.again?'Changes sent. Thank you!':'Sent. Thank you!';
    return;
  }
  wf.textContent=j.message||'Something went wrong. Please try again.';
}

$('sendBtn').addEventListener('click',async()=>{
  const wf=$('w-final');
  const m=missing(true);
  if(m.length){wf.textContent=`Please add ${m.join(', ')}.`;return;}
  wf.textContent='';
  if(PLAN)return busy(sendPlan);
  await getOnline();
  if(online&&online.ready)return busy(sendIntake);
  intakeMail();
});

/* The full questionnaire from a guest's private link: fill in what they've told us so far */
(function(){
  if(!PLAN)return;
  const bar=$('qPlanbar'),sb=$('sendBtn');
  $('qLede').textContent='Plan the menu and details for your event. Your estimate updates as you choose. When you’re done, send your selections to us, and your event manager will follow up with a banquet event order to confirm. Your answers save in this browser as you go.';
  $('sendH').textContent='Send your selections';
  $('sendNote').textContent='Your event manager will review your selections and follow up with a banquet event order and final pricing.';
  sb.textContent='Send my selections';
  $('clearBtn').hidden=true;
  const say=(html,err)=>{bar.innerHTML=html;bar.hidden=false;bar.classList.toggle('err',!!err);};
  say('Loading your event details…');
  if(!SVC){say('We couldn’t open your questionnaire here. Please write to us at events@edencny.com.',true);sb.disabled=true;return;}
  fetch(SVC+'plan?t='+PLAN,{cache:'no-store'}).then(r=>r.json().catch(()=>({}))).catch(()=>({error:'network'})).then(j=>{
    if(!j.ok){
      say(j.error==='network'?'We couldn’t reach our event system just now. Please try again in a few minutes.':'We couldn’t open your questionnaire. The link may be incomplete or out of date. Please use the link in our email, or write to us at events@edencny.com.',true);
      sb.disabled=true;return;
    }
    let local=null;try{local=JSON.parse(localStorage.getItem(STORE_KEY)||'null');}catch(e){}
    if(!local||!Object.keys(local).some(k=>k!=='diet')){Q=Object.assign({},j.answers||{});if(!Array.isArray(Q.diet)||!Q.diet.length)Q.diet=[{}];save();}
    restore();renderDiet();update();
    const first=esc(String(Q['ev.contact']||'').trim().split(' ')[0]);
    if(j.locked){say(`${first?'Hi '+first+'. ':''}Your event details are already with our team, so this questionnaire can’t be changed here anymore. To make a change, reply to our email or write to events@edencny.com.`);sb.disabled=true;return;}
    say(`<b>Welcome${first?', '+first:''}.</b> We’ve filled in what you told us. Finish the rest whenever you’re ready and send it to us.${j.done?' You’ve sent this before; sending again updates it.':''}`);
  });
})();

$('clearBtn').addEventListener('click',()=>{
  const cb=$('clearBtn');
  if(!cb.dataset.sure){cb.dataset.sure='1';cb.textContent='Tap again to clear everything';setTimeout(()=>{delete cb.dataset.sure;cb.textContent='Start over';},4000);return;}
  delete cb.dataset.sure;cb.textContent='Start over';
  Q={diet:[{}]};try{localStorage.removeItem(STORE_KEY);localStorage.removeItem(STARTED);}catch(e){}
  TYPE_BOXES.forEach(b=>{b.checked=false;});
  document.querySelectorAll('[data-f]').forEach(el=>{if(el.type==='radio'||el.type==='checkbox')el.checked=false;else if(el.tagName==='SELECT')el.selectedIndex=0;else el.value='';});
  renderDiet();update();$('status').textContent='Answers cleared.';$('w-final').textContent='';
});

update();
})();
