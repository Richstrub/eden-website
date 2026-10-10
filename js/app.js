(function(){
  var toggle=document.getElementById('menuToggle'),drawer=document.getElementById('drawer');
  var fire=(function(){
    var cv=document.getElementById('fire'),g=cv.getContext('2d'),raf=null,W=0,H=0,orbs=[],motes=[],t0=0;
    var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var tones=[[176,112,63],[224,154,94],[140,74,38],[201,163,106],[110,52,30]];
    function fit(){var d=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0)}
    function seed(){
      orbs=[];motes=[];
      for(var i=0;i<6;i++)orbs.push({c:tones[i%tones.length],ax:.15+Math.random()*.7,ay:.35+Math.random()*.6,rx:.12+Math.random()*.18,ry:.06+Math.random()*.12,sp:.00006+Math.random()*.00008,ph:Math.random()*6.28,r:.45+Math.random()*.35,a:.32+Math.random()*.22});
      var n=Math.round(W*H/9000);
      for(i=0;i<n;i++)motes.push({x:Math.random()*W,y:Math.random()*H,vy:.06+Math.random()*.18,dx:Math.random()*6.28,s:.5+Math.random()*1.2,tw:Math.random()*6.28,ts:.001+Math.random()*.002});
    }
    function draw(now){
      var t=now-t0;
      g.globalCompositeOperation='source-over';
      g.fillStyle='#09090b';g.fillRect(0,0,W,H);
      g.globalCompositeOperation='lighter';
      var m=Math.max(W,H);
      orbs.forEach(function(o){
        var x=W*(o.ax+o.rx*Math.sin(t*o.sp+o.ph)),y=H*(o.ay+o.ry*Math.cos(t*o.sp*1.3+o.ph)),r=m*o.r;
        var breath=.85+.15*Math.sin(t*.0004+o.ph);
        var gr=g.createRadialGradient(x,y,0,x,y,r);
        gr.addColorStop(0,'rgba('+o.c+','+(o.a*breath).toFixed(3)+')');
        gr.addColorStop(.5,'rgba('+o.c+','+(o.a*.25*breath).toFixed(3)+')');
        gr.addColorStop(1,'rgba('+o.c+',0)');
        g.fillStyle=gr;g.fillRect(0,0,W,H);
      });
      motes.forEach(function(q){
        q.y-=q.vy;q.dx+=.004;var x=q.x+Math.sin(q.dx)*8;
        if(q.y<-4){q.y=H+4;q.x=Math.random()*W}
        var a=.25+.55*(.5+.5*Math.sin(t*q.ts+q.tw));
        g.fillStyle='rgba(236,204,150,'+a.toFixed(3)+')';
        g.beginPath();g.arc(x,q.y,q.s,0,6.283);g.fill();
      });
      if(!still)raf=requestAnimationFrame(draw);
    }
    return{start:function(){fit();seed();cancelAnimationFrame(raf);t0=performance.now();draw(t0+(still?8000:0))},
      stop:function(){cancelAnimationFrame(raf);raf=null},
      resize:function(){if(raf){fit();seed()}}};
  })();
  window.addEventListener('resize',fire.resize);
  function setDrawer(open){drawer.hidden=!open;toggle.setAttribute('aria-expanded',open);document.body.style.overflow=open?'hidden':'';if(open)fire.start();else fire.stop()}
  toggle.addEventListener('click',function(){setDrawer(drawer.hidden)});
  drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setDrawer(false)})});

  document.querySelectorAll('[role="tablist"]').forEach(function(list){
    var tabs=list.querySelectorAll('.tab');
    tabs.forEach(function(t){
      t.addEventListener('click',function(){
        tabs.forEach(function(x){x.setAttribute('aria-selected','false');document.getElementById(x.dataset.tab).hidden=true});
        t.setAttribute('aria-selected','true');document.getElementById(t.dataset.tab).hidden=false;
      });
    });
  });

  document.querySelectorAll('[data-copy]').forEach(function(b){
    var label=b.textContent;
    b.addEventListener('click',function(){
      var el=document.getElementById(b.dataset.copy),text=el.textContent.trim();
      function done(){b.textContent='Copied';setTimeout(function(){b.textContent=label},1600)}
      function fallback(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected';setTimeout(function(){b.textContent=label},1600)}
      try{navigator.clipboard.writeText(text).then(done,fallback)}catch(e){fallback()}
    });
  });

  /* scroll choreography */
  (function(){
    var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var header=document.getElementById('siteHeader'),bar=document.getElementById('progress');
    var hero=document.getElementById('home'),heroInner=document.getElementById('heroInner'),embers=document.getElementById('embers');
    var cat=document.getElementById('catering-info');
    var ticking=false;
    function update(){
      ticking=false;
      var y=window.scrollY||window.pageYOffset,vh=window.innerHeight,hh=hero.offsetHeight;
      header.classList.toggle('solid',y>hh-90);
      var max=document.documentElement.scrollHeight-vh;bar.style.transform='scaleX('+(max>0?y/max:0).toFixed(4)+')';
      if(still)return;
      if(y<hh*1.1){
        var k=Math.min(1,y/hh);
        heroInner.style.transform='translateY('+(y*.42).toFixed(1)+'px) scale('+(1-k*.08).toFixed(4)+')';
        heroInner.style.opacity=(1-k*1.25).toFixed(3);
        embers.style.transform='translateY('+(y*.6).toFixed(1)+'px)';
      }
      var r=cat.getBoundingClientRect();
      if(r.bottom>0&&r.top<vh)cat.style.setProperty('--py',((r.top-vh/2)*-.25).toFixed(1)+'px');
    }
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
    window.addEventListener('resize',update);
    update();

    if(still||!('IntersectionObserver' in window))return;
    var sel='#about .narrow, .about-copy > p, .member, .motto, #menu .narrow, #menu .tabs, .mg, .allergy, .catering .inner, #partners .narrow, #partners .tabs, .partner, #journal .narrow, .journal li, #contact .narrow, .visit > div, .note';
    var els=[].slice.call(document.querySelectorAll(sel));
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('pre');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
    var vh=window.innerHeight;
    els.forEach(function(el){
      el.classList.add('rv');
      if(!el.offsetParent)return;
      if(el.getBoundingClientRect().top<vh*.92)return;
      var sib=[].indexOf.call(el.parentNode.children,el);
      el.style.transitionDelay=(Math.min(sib,6)*90)+'ms';
      el.classList.add('pre');io.observe(el);
    });
    // panels revealed by tab clicks play a quick stagger
    document.querySelectorAll('.tab').forEach(function(t){t.addEventListener('click',function(){
      var panel=document.getElementById(t.dataset.tab);
      [].forEach.call(panel.querySelectorAll('.mg, .partner'),function(el,i){
        el.classList.add('rv','pre');el.style.transitionDelay=(i*90)+'ms';
        requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.remove('pre')})});
      });
    })});
  })();

  /* ---------- live menu ---------- */
  var seed=window.EDEN_MENU_SEED||{tabs:[]};
  var menuData=seed, menuRef=null, dbOK=false;
  /* render after renderMenu is defined */
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  /* wine browsing: one list, several ways to look at it */
  var WINE_MODES=[['style','Style'],['country','Country'],['appellation','Appellation'],['grape','Grape'],['glass','By the Glass'],['bottle','Bottles']];
  var siteWineMode='style';
  function isWine(it){return it.appellation!==undefined||it.grape!==undefined||it.country!==undefined}
  function shown(it){return !it.hidden&&(it.name||it.price)}
  function wineItem(it,mode){ // display copy: source line and price built from the wine's fields
    if(!isWine(it))return it;
    var o={name:it.name,desc:it.desc,app:it.appellation||'',country:it.country||''};
    var bits=[];
    if(mode==='country'||mode==='style'||mode==='grape'||mode==='glass'||mode==='bottle'){if(it.appellation)bits.push(it.appellation)}
    if(mode==='appellation'&&it.grape)bits.push(it.grape);
    if(mode==='country'&&it.grape)bits.push(it.grape);
    if(it.som)bits.push('Sommelier selection');
    if(mode==='glass'){o.price=it.glass||'';if(it.bottle)bits.push('Bottle '+it.bottle)}
    else{o.price=it.bottle||(it.glass?it.glass+' glass':it.price);if(it.glass&&it.bottle)bits.push('By the glass '+it.glass)}
    o.src=bits.join(' · ');return o;
  }
  function wineGroups(t,mode){
    var groups=(t.groups||[]).map(function(g){return{title:g.title,note:g.note,noteAfter:g.noteAfter,items:(g.items||[]).filter(shown)}}).filter(function(g){return g.items.length});
    if(mode==='style')return groups.map(function(g){return{title:g.title,note:g.note,noteAfter:g.noteAfter,items:g.items.map(function(it){return wineItem(it,mode)})}});
    var all=[];groups.forEach(function(g){g.items.forEach(function(it){all.push({it:it,style:g.title})})});
    var num=function(p){var n=parseFloat(String(p||'').replace(/[^0-9.]/g,''));return isNaN(n)?1e9:n};
    if(mode==='glass'||mode==='bottle'){
      return groups.map(function(g){
        var items=g.items.filter(function(it){return mode==='glass'?!!it.glass:!!it.bottle});
        items=items.slice().sort(function(x,y){return num(mode==='glass'?x.glass:x.bottle)-num(mode==='glass'?y.glass:y.bottle)});
        return{title:g.title,note:'',items:items.map(function(it){return wineItem(it,mode)})};
      }).filter(function(g){return g.items.length}).map(function(g,i){if(i===0)g.note=mode==='glass'?'Wines poured by the glass, priced per glass, lowest to highest.':'Bottles, lowest to highest price.';return g});
    }
    var key=mode==='country'?function(x){return x.it.country||'Other'}:mode==='grape'?function(x){return x.it.grape||'Other'}:function(x){return x.it.appellation||'Other'};
    var map={},order=[];
    all.forEach(function(x){var k=key(x);if(!map[k]){map[k]=[];order.push(k)}map[k].push(x)});
    if(mode==='country'){order.sort(function(p,q){return map[q].length-map[p].length||p.localeCompare(q)})}
    else if(mode==='appellation'){order.sort(function(p,q){var cp=(map[p][0].it.country||''),cq=(map[q][0].it.country||'');return cp.localeCompare(cq)||p.localeCompare(q)})}
    else order.sort(function(p,q){return p.localeCompare(q)});
    return order.map(function(k){
      var items=map[k].slice().sort(function(x,y){return (x.it.appellation||'').localeCompare(y.it.appellation||'')||x.it.name.replace(/^(NV|\d{4}) /,'').localeCompare(y.it.name.replace(/^(NV|\d{4}) /,''))});
      return{title:k,note:'',items:items.map(function(x){return wineItem(x.it,mode)})};
    });
  }
  function hasWine(t){return (t.groups||[]).some(function(g){return (g.items||[]).some(isWine)})}
  var SUB_LABEL={style:'Styles',country:'Countries',appellation:'Appellations',grape:'Grapes'};
  function grapeLinks(groups,idp,cls,mode){
    var h='<div class="'+cls+'"><div class="wn-sublabel">'+(SUB_LABEL[mode]||'Jump to')+'</div>',lastC=null;
    groups.forEach(function(g,i){
      var items=(g.items||[]).filter(shown);if(!items.length)return;
      var label=g.title;
      if(mode==='appellation'){ // appellations are listed country by country, so group the links the same way
        var c=items[0].country||'';
        if(c&&c!==lastC){h+='<div class="wn-country">'+esc(c)+'</div>';lastC=c}
        var suf=', '+c;if(c&&label.length>suf.length&&label.slice(-suf.length)===suf)label=label.slice(0,-suf.length);
      }
      h+='<a href="#'+idp+i+'" data-target="'+idp+i+'">'+esc(label)+'</a>';
    });
    return h+'</div>';
  }
  function wineNav(mode,cls,groups,idp){
    var h='<div class="'+cls+'" role="toolbar" aria-label="Browse wines by"><span class="wn-label">Browse by</span>';
    WINE_MODES.forEach(function(m){h+='<button type="button" data-mode="'+m[0]+'" aria-pressed="'+(m[0]===mode)+'">'+m[1]+'</button>'});
    if(SUB_LABEL[mode]&&groups)h+=grapeLinks(groups,idp,'wn-sub',mode);
    return h+'</div>';
  }
  function groupsHTML(groups,idp){
    var h='';
    groups.forEach(function(g,gi){
      var items=(g.items||[]).filter(shown);if(!items.length)return;
      h+='<div class="mg"'+(idp?' id="'+idp+gi+'"':'')+'><h3 class="mg-title">'+esc(g.title)+'</h3>';
      if(g.note)h+='<p class="mg-note">'+esc(g.note)+'</p>';
      h+='<ul class="ml">';
      items.forEach(function(it){
        h+='<li class="mi"'+(it.country?' data-country="'+esc(it.country)+'" data-app="'+esc(it.app||'')+'"':'')+'><div class="mi-head"><span class="mi-name">'+esc(it.name)+'</span><span class="mi-dots"></span><span class="mi-price">'+esc(it.price)+'</span></div>';
        if(it.src)h+='<div class="mi-src">'+esc(it.src)+'</div>';
        if(it.desc)h+='<div class="mi-desc">'+esc(it.desc)+'</div>';
        h+='</li>';
      });
      h+='</ul>';
      if(g.noteAfter)h+='<p class="mg-note">'+esc(g.noteAfter)+'</p>';
      h+='</div>';
    });
    return h;
  }
  function panelInner(t){
    if(hasWine(t)){var wg=wineGroups(t,siteWineMode);return '<div class="wine-layout">'+wineNav(siteWineMode,'wine-nav',wg,'wg-')+'<div class="wine-body">'+((siteWineMode==='country'||siteWineMode==='appellation')?'<div class="wm" aria-hidden="true"></div>':'')+groupsHTML(wg,'wg-')+'</div></div>';}
    return groupsHTML(t.groups||[]);
  }
  function bindWineNav(panel,t){
    panel.querySelectorAll('.wine-nav button').forEach(function(b){b.onclick=function(){
      siteWineMode=b.dataset.mode;panel.innerHTML=panelInner(t);bindWineNav(panel,t);setTimeout(spySite,0);
      var lay=panel.querySelector('.wine-layout');var top=lay.getBoundingClientRect().top;if(top<0||top>window.innerHeight*.5)window.scrollTo({top:lay.getBoundingClientRect().top+window.scrollY-90});
    }});
    panel.querySelectorAll('.wn-sub a').forEach(function(a){a.onclick=function(e){e.preventDefault();var el=document.getElementById(a.dataset.target);if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-96,behavior:'smooth'})}});
  }


  /* country watermark: the outline of the country being read, with its appellation marked */
  var MAPS=window.EDEN_MAPS||{};
  var reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fadeTo(el,to,ms,done){
    var from=parseFloat(getComputedStyle(el).opacity);if(isNaN(from))from=to?0:1;
    if(el._fade){try{el._fade.cancel()}catch(e){}}
    el.style.opacity=to;
    if(reduceMotion||!el.animate){if(done)done();return}
    var a=el.animate([{opacity:from},{opacity:to}],{duration:ms,easing:'ease-in-out'});el._fade=a;
    a.onfinish=function(){el._fade=null;if(done)done()};
  }
  function wmUpdate(slot,country,app){
    if(!slot)return;
    var m=MAPS[country];
    if(slot.dataset.country!==country){
      slot.dataset.country=country||'';slot.dataset.app='';
      [].forEach.call(slot.querySelectorAll('svg:not(.out)'),function(old){old.classList.add('out');fadeTo(old,0,1200,function(){if(old.parentNode)old.parentNode.removeChild(old)})});
      if(!m)return;
      var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 '+m.w+' '+m.h);svg.style.opacity=0;
      var cid='wmc'+Math.random().toString(36).slice(2,8);
      svg.innerHTML='<defs><clipPath id="'+cid+'"><path d="'+m.d+'"/></clipPath></defs><path class="wm-land" d="'+m.d+'"/>'+
        (m.topo?'<path class="wm-topo" clip-path="url(#'+cid+')" d="'+m.topo+'"/>':'')+(m.frame?'<path class="wm-frame" d="'+m.frame+'"/>':'')+'<g class="wm-marks"></g>';
      slot.appendChild(svg);
      fadeTo(svg,1,1200);
    }
    var svg2=slot.querySelector('svg:not(.out)');if(!svg2||!m)return;
    if(slot.dataset.app===app)return;slot.dataset.app=app||'';
    var marks=svg2.querySelector('.wm-marks');
    [].forEach.call(marks.querySelectorAll('.wm-mark:not(.gone)'),function(o){o.classList.add('gone');fadeTo(o,0,1100,function(){if(o.parentNode)o.parentNode.removeChild(o)})});
    var p=m.pts[app];if(!p)return;
    var right=p[0]<m.w*.62,name=esc(app.split(', ')[0]);
    var g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','wm-mark');g.style.opacity=0;
    g.innerHTML='<circle class="wm-glow" cx="'+p[0]+'" cy="'+p[1]+'" r="42"/><circle class="wm-ring" cx="'+p[0]+'" cy="'+p[1]+'" r="15"/><circle class="wm-dot" cx="'+p[0]+'" cy="'+p[1]+'" r="4.5"/>'+
      '<text class="wm-label" x="'+(p[0]+(right?24:-24))+'" y="'+(p[1]+5)+'" text-anchor="'+(right?'start':'end')+'">'+name+'</text>';
    marks.appendChild(g);
    fadeTo(g,1,1100);
  }
  function wmFrom(items,line,slot){
    if(!slot||!items.length)return;
    var first=items[0].getBoundingClientRect(),last=items[items.length-1].getBoundingClientRect();
    var inside=first.top<=line+40&&last.bottom>=line-40;
    slot.classList.toggle('off',!inside);
    var cur=null;
    for(var i=0;i<items.length;i++){if(items[i].getBoundingClientRect().top<=line)cur=items[i];else break}
    if(!cur)cur=items[0];
    wmUpdate(slot,cur.dataset.country,cur.dataset.app);
  }
  /* highlight the section a guest is reading in the jump links */
  function markActive(links,cur,box){
    links.forEach(function(a){a.classList.toggle('active',a===cur)});
    if(!cur||!box||!links.length)return;
    var br=box.getBoundingClientRect(),cr=cur.getBoundingClientRect();
    if(box.scrollHeight>box.clientHeight+2){
      if(cr.top<br.top+40||cr.bottom>br.bottom-40)box.scrollTop+=(cr.top-br.top)-box.clientHeight/2;
    }else if(box.scrollWidth>box.clientWidth+2){
      if(cr.left<br.left+40||cr.right>br.right-40)box.scrollLeft+=(cr.left-br.left)-box.clientWidth/2;
    }
  }
  function spySite(){
    var panel=document.querySelector('.wine-panel:not([hidden])');if(!panel)return;
    var links=[].slice.call(panel.querySelectorAll('.wn-sub a'));
    var line=window.innerWidth<=820?170:140,cur=links[0];
    links.forEach(function(a){var el=document.getElementById(a.dataset.target);if(el&&el.getBoundingClientRect().top<=line)cur=a});
    var last=links.length&&document.getElementById(links[links.length-1].dataset.target);
    if(last&&(window.innerHeight+window.scrollY)>=document.documentElement.scrollHeight-4&&last.getBoundingClientRect().top<window.innerHeight)cur=links[links.length-1];
    markActive(links,cur,panel.querySelector('.wine-nav'));
    if(siteWineMode==='country'||siteWineMode==='appellation')wmFrom(panel.querySelectorAll('.mi[data-country]'),window.innerHeight*.5,panel.querySelector('.wm'));
  }
  function spyPad(){
    var wc=document.getElementById('padWcol'),main=document.getElementById('padMain');
    var links=[].slice.call(wc.querySelectorAll('.wc-sub a'));
    var top=main.getBoundingClientRect().top+80,cur=links[0];
    links.forEach(function(a){var el=document.getElementById(a.dataset.target);if(el&&el.getBoundingClientRect().top<=top)cur=a});
    if(links.length&&main.scrollTop+main.clientHeight>=main.scrollHeight-4)cur=links[links.length-1];
    markActive(links,cur,wc);
    if(pad.wineMode==='country'||pad.wineMode==='appellation')wmFrom(main.querySelectorAll('.pad-item[data-country]'),main.getBoundingClientRect().top+main.clientHeight*.5,main.querySelector('.wm'));
  }
  var spyTick=false;
  window.addEventListener('scroll',function(){if(!spyTick){spyTick=true;requestAnimationFrame(function(){spyTick=false;spySite()})}},{passive:true});
  document.getElementById('padMain').addEventListener('scroll',function(){if(!spyTick){spyTick=true;requestAnimationFrame(function(){spyTick=false;spyPad()})}},{passive:true});
  function renderMenu(d){
    var mount=document.getElementById('menuMount');
    var cur=mount.querySelector('.tab[aria-selected="true"]'),curId=cur?cur.dataset.tab:null;
    var tabs=d.tabs||[];
    if(!tabs.some(function(t){return t.id===curId}))curId=tabs.length?tabs[0].id:null;
    var h='<div class="tabs" role="tablist" aria-label="Menu">';
    tabs.forEach(function(t){h+='<button class="tab" id="t-'+esc(t.id)+'" role="tab" aria-selected="'+(t.id===curId)+'" aria-controls="'+esc(t.id)+'" data-tab="'+esc(t.id)+'">'+esc(t.label)+'</button>'});
    h+='</div>';
    tabs.forEach(function(t){
      h+='<div class="panel mpanel'+(hasWine(t)?' wine-panel':'')+'" id="'+esc(t.id)+'" role="tabpanel" aria-labelledby="t-'+esc(t.id)+'"'+(t.id===curId?'':' hidden')+'>'+panelInner(t)+'</div>';
    });
    if(d.allergy)h+='<p class="allergy">'+esc(d.allergy)+'</p>';
    mount.innerHTML=h;
    tabs.forEach(function(t){if(hasWine(t))bindWineNav(document.getElementById(t.id),t)});
    setTimeout(spySite,0);
    var btns=mount.querySelectorAll('.tab');
    btns.forEach(function(b){b.addEventListener('click',function(){
      btns.forEach(function(x){x.setAttribute('aria-selected','false');document.getElementById(x.dataset.tab).hidden=true});
      b.setAttribute('aria-selected','true');document.getElementById(b.dataset.tab).hidden=false;spySite();
    })});
  }
  renderMenu(menuData);

  function renderSupper(sp){
    if(!sp)return;
    function txt(id,v){var el=document.getElementById(id);if(el)el.textContent=v||''}
    txt('spEyebrow',sp.eyebrow);txt('spDate',sp.date);txt('spIntro',sp.intro);txt('spMenuHeading',sp.menuHeading);txt('spRes',sp.resText);
    document.getElementById('spTitle').innerHTML=esc(sp.title).replace(' × ',' <span>×</span> ');
    var h='',n=0;
    (sp.courses||[]).forEach(function(c){
      if(c.hidden||!c.name)return;n++;
      h+='<li class="sp-course"><div class="sp-num">'+(n<10?'0':'')+n+'</div><div class="sp-dish"><h3>'+esc(c.name)+'</h3>'+(c.desc?'<p>'+esc(c.desc)+'</p>':'')+'</div>';
      if(c.w1)h+='<div class="sp-wine"><span class="eyebrow">'+esc(sp.tier1)+'</span><p>'+esc(c.w1)+'</p></div>';else h+='<div></div>';
      if(c.w2)h+='<div class="sp-wine"><span class="eyebrow">'+esc(sp.tier2)+'</span><p>'+esc(c.w2)+'</p></div>';else h+='<div></div>';
      h+='</li>';
    });
    document.getElementById('spList').innerHTML=h;
    document.getElementById('spNotes').innerHTML=(sp.notes||[]).filter(Boolean).map(function(x){return '<li>'+esc(x)+'</li>'}).join('');
    var cta=document.getElementById('spCta');
    if(sp.ctaLabel&&sp.ctaUrl){cta.hidden=false;cta.textContent=sp.ctaLabel;cta.href=/^https?:\/\//.test(sp.ctaUrl)?sp.ctaUrl:'https://'+sp.ctaUrl}else cta.hidden=true;
  }
  renderSupper(menuData.supper);
  function stamp(ts){
    var el=document.getElementById('menuLive');
    if(!ts){el.hidden=true;return}
    var d=new Date(ts);
    el.textContent='Menu updated '+d.toLocaleDateString(undefined,{month:'long',day:'numeric'})+' at '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
    el.hidden=false;
  }



  /* the iPad menu presents itself as its own app: its own name and Home Screen icon */
  var siteTitle=document.title,padIconUrl=null;
  function padIcon(){
    if(location.protocol!=='file:')return 'assets/icons/eden-menu-icon.png'; // real file: iOS Home Screen icons need a URL
    if(padIconUrl)return padIconUrl;
    try{
      var cv=document.createElement('canvas');cv.width=cv.height=180;var g=cv.getContext('2d');
      g.fillStyle='#0f1215';g.fillRect(0,0,180,180);
      var gr=g.createRadialGradient(90,200,0,90,200,170);gr.addColorStop(0,'rgba(224,154,94,.55)');gr.addColorStop(.5,'rgba(176,112,63,.18)');gr.addColorStop(1,'rgba(15,18,21,0)');
      g.fillStyle=gr;g.fillRect(0,0,180,180);
      g.fillStyle='#f3eee5';g.font='300 40px "Cormorant Garamond", Georgia, serif';g.textAlign='center';g.textBaseline='middle';
      g.fillText('E D E N',90,84);
      g.fillStyle='#e09a5e';g.font='500 11px Jost, Arial, sans-serif';g.fillText('M E N U',90,118);
      padIconUrl=cv.toDataURL('image/png');
    }catch(e){padIconUrl=''}
    return padIconUrl;
  }
  function setLink(rel,href){
    var l=document.head.querySelector('link[rel="'+rel+'"][data-eden]');
    if(!href){if(l)l.remove();return}
    if(!l){l=document.createElement('link');l.rel=rel;l.setAttribute('data-eden','');document.head.appendChild(l)}
    l.href=href;
  }
  function setMeta(name,content){
    var m=document.head.querySelector('meta[name="'+name+'"][data-eden]');
    if(content==null){if(m)m.remove();return}
    if(!m){m=document.createElement('meta');m.name=name;m.setAttribute('data-eden','');document.head.appendChild(m)}
    m.content=content;
  }
  function padIdentity(on){
    document.title=on?'Eden Menu':siteTitle;
    setLink('apple-touch-icon',on?padIcon():null);
    setLink('icon',on?padIcon():null);
    setMeta('apple-mobile-web-app-title',on?'Eden Menu':null);
    setMeta('apple-mobile-web-app-capable',on?'yes':null);
    setMeta('apple-mobile-web-app-status-bar-style',on?'black-translucent':null);
    setMeta('theme-color',on?'#0f1215':null);
  }
  /* ---------- iPad table menu ---------- */
  var pad={el:document.getElementById('ipad'),tab:null,idle:null};
  function renderPad(d,keepScroll){
    var tabs=(d.tabs||[]).filter(function(t){return (t.groups||[]).some(function(g){return (g.items||[]).some(function(it){return !it.hidden&&(it.name||it.price)})})});
    if(!tabs.some(function(t){return t.id===pad.tab}))pad.tab=tabs.length?tabs[0].id:null;
    var nav=document.getElementById('padTabs');nav.innerHTML='';
    tabs.forEach(function(t){var b=document.createElement('button');b.textContent=t.label;b.setAttribute('aria-current',t.id===pad.tab);
      b.onclick=function(){if(pad.tab===t.id)return;pad.tab=t.id;renderPad(menuData);var m=document.getElementById('padMain');m.scrollTop=0;m.classList.remove('fade');void m.offsetWidth;m.classList.add('fade')};nav.appendChild(b)});
    document.getElementById('padAllergy').textContent=d.allergy||'';
    var u=document.getElementById('padUpdated');
    if(d.updatedAt){var dt=new Date(d.updatedAt);u.textContent='Updated '+dt.toLocaleDateString(undefined,{month:'short',day:'numeric'})+', '+dt.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}else u.textContent='';
    var t=tabs.filter(function(x){return x.id===pad.tab})[0],main=document.getElementById('padMain'),st=main.scrollTop;
    if(!t){main.innerHTML='';return}
    var vis=function(g){return (g.items||[]).filter(function(it){return !it.hidden&&(it.name||it.price)})};
    var wine=hasWine(t);if(!pad.wineMode)pad.wineMode='style';
    var gs=(wine?wineGroups(t,pad.wineMode):(t.groups||[])).filter(function(g){return vis(g).length});
    var total=gs.reduce(function(n,g){return n+vis(g).length},0),big=total>40;
    var h='<h2>'+esc(t.label)+'</h2><div class="pad-rule"></div>';
    if(!wine&&big&&gs.length>1&&gs.length<=10){h+='<div class="pad-jump">';gs.forEach(function(g,i){h+='<button data-g="pg'+i+'">'+esc(g.title)+'</button>'});h+='</div>'}
    
    if(wine&&(pad.wineMode==='country'||pad.wineMode==='appellation'))h+='<div class="wm" aria-hidden="true"></div>';
    h+='<div class="pad-grid'+(big?' stack':'')+'">';
    gs.forEach(function(g,gi){
      var items=vis(g);
      h+='<div class="pad-group" id="pg'+gi+'"><div class="pad-gt">'+esc(g.title)+'</div>';
      if(g.note)h+='<p class="pad-note">'+esc(g.note)+'</p>';
      if(big)h+='<div class="pad-items">';
      items.forEach(function(it){
        h+='<div class="pad-item"'+(it.country?' data-country="'+esc(it.country)+'" data-app="'+esc(it.app||'')+'"':'')+'><div class="pad-ih"><span class="pad-name">'+esc(it.name)+'</span><span class="pad-dots"></span><span class="pad-price">'+esc(it.price)+'</span></div>';
        if(it.src)h+='<div class="pad-src">'+esc(it.src)+'</div>';
        if(it.desc)h+='<div class="pad-desc">'+esc(it.desc)+'</div>';
        h+='</div>';
      });
      if(big)h+='</div>';
      if(g.noteAfter)h+='<p class="pad-note">'+esc(g.noteAfter)+'</p>';
      h+='</div>';
    });
    main.innerHTML=h+'</div>';
    var wc=document.getElementById('padWcol');
    pad.el.classList.toggle('wine',wine);wc.hidden=!wine;
    if(wine){
      var wh='<div class="wc-label">Browse by</div>';
      WINE_MODES.forEach(function(m){wh+='<button type="button" data-mode="'+m[0]+'" aria-pressed="'+(m[0]===pad.wineMode)+'">'+m[1]+'</button>'});
      if(SUB_LABEL[pad.wineMode])wh+=grapeLinks(gs,'pg','wc-sub',pad.wineMode);
      wc.innerHTML=wh;
      setTimeout(spyPad,0);
      wc.querySelectorAll('.wc-sub a').forEach(function(a){a.onclick=function(e){e.preventDefault();padScrollTo(document.getElementById(a.dataset.target))}});
      wc.querySelectorAll('button').forEach(function(b){b.onclick=function(){if(pad.wineMode===b.dataset.mode)return;pad.wineMode=b.dataset.mode;renderPad(menuData);main.scrollTop=0;main.classList.remove('fade');void main.offsetWidth;main.classList.add('fade')}});
    }
    main.querySelectorAll('.pad-jump button').forEach(function(b){b.onclick=function(){padScrollTo(document.getElementById(b.dataset.g))}});
    if(keepScroll)main.scrollTop=st;
  }
  function padScrollTo(el){ // bring a section's heading to the top of the menu, measured on screen so nested layouts can't throw it off
    if(!el)return;var main=document.getElementById('padMain');
    main.scrollTo({top:main.scrollTop+el.getBoundingClientRect().top-main.getBoundingClientRect().top-24,behavior:'smooth'});
  }
  function padIdle(){ // after 3 quiet minutes, return to the first page for the next guest
    clearTimeout(pad.idle);
    pad.idle=setTimeout(function(){if(pad.el.hidden)return;pad.tab=null;pad.wineMode='style';renderPad(menuData);document.getElementById('padMain').scrollTop=0},180000);
  }
  ['pointerdown','touchstart','scroll','wheel'].forEach(function(ev){pad.el.addEventListener(ev,padIdle,{passive:true,capture:true})});
  (function(){var taps=[];document.getElementById('padBrand').addEventListener('click',function(){
    var now=Date.now();taps=taps.filter(function(t){return now-t<3000});taps.push(now);
    if(taps.length>=5){taps=[];location.hash='#exit-ipad'}
  })})();
  /* ---------- storage: the menu is split into small documents, so an edit only sends what changed ---------- */
  var store={db:null,meta:null,groups:{},supper:undefined,have:{meta:false,groups:false,supper:false},saved:{}};
  function newGid(){return 'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  function splitMenu(d){
    var out={meta:{version:2,allergy:d.allergy||'',tabs:[]},groups:{},supper:d.supper||null};
    (d.tabs||[]).forEach(function(t){
      var gids=[];
      (t.groups||[]).forEach(function(g){if(!g.id)g.id=newGid();gids.push(g.id);
        out.groups[g.id]={title:g.title||'',note:g.note||'',noteAfter:g.noteAfter||'',items:g.items||[]}});
      out.meta.tabs.push({id:t.id,label:t.label,gids:gids});
    });
    return out;
  }
  function assembleMenu(){
    var m=store.meta;if(!m||!m.tabs)return null;
    if(m.tabs.length&&!m.tabs[0].gids)return m; // older single-document menu
    if(!store.have.groups)return null;
    return{allergy:m.allergy,updatedAt:m.updatedAt,supper:store.supper||m.supper,
      tabs:m.tabs.map(function(t){return{id:t.id,label:t.label,groups:(t.gids||[]).filter(function(id){return store.groups[id]}).map(function(id){var g=store.groups[id];return{id:id,title:g.title,note:g.note,noteAfter:g.noteAfter,items:g.items||[]}})}})};
  }
  function baseline(d){
    var p=splitMenu(clone(d));store.saved={meta:JSON.stringify(p.meta),supper:JSON.stringify(p.supper)};
    Object.keys(p.groups).forEach(function(id){store.saved['g:'+id]=JSON.stringify(p.groups[id])});
  }
  var applyT=null;
  function applyStore(pending){
    clearTimeout(applyT);applyT=setTimeout(function(){
      var d=assembleMenu();if(!d)return;
      menuData=clone(d);renderMenu(menuData);renderSupper(menuData.supper);stamp(d.updatedAt);if(!pad.el.hidden)renderPad(menuData,true);
      if(!ed.dirty&&!ed.saving&&!pending){
        baseline(menuData);
        if(!ed.el.hidden){var a=document.activeElement;if(!(a&&ed.el.contains(a)&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'))){ed.draft=clone(menuData);edRender()}}
      }
    },40);
  }

  /* ---------- editor ---------- */
  var ed={el:document.getElementById('editor'),tab:0,draft:null,dirty:false,saving:false,canWrite:false,timer:null};
  function clone(o){return JSON.parse(JSON.stringify(o))}
  function status(text,cls){var s=document.getElementById('edStatus');s.textContent=text;s.className='ed-status'+(cls?' '+cls:'')}
  function markDirty(){ed.dirty=true;status('Unsaved changes. Publishing automatically…','dirty');clearTimeout(ed.timer);ed.timer=setTimeout(save,600)}
  function edRender(){
    var d=ed.draft,side=document.getElementById('edTabs'),main=document.getElementById('edMain');
    if(ed.tab!=='supper'&&ed.tab>=d.tabs.length)ed.tab=0;
    side.innerHTML='';
    d.tabs.forEach(function(t,i){var b=document.createElement('button');b.textContent=t.label||'Untitled';b.setAttribute('aria-current',i===ed.tab);b.onclick=function(){ed.tab=i;edRender()};side.appendChild(b)});
    var sb=document.createElement('button');sb.className='ed-side-sup';sb.textContent='Supper Club';sb.setAttribute('aria-current',ed.tab==='supper');sb.onclick=function(){ed.tab='supper';edRender()};side.appendChild(sb);
    main.innerHTML='';
    if(ed.tab==='supper'){edSupper(main);return}
    var t=d.tabs[ed.tab];
    var h=document.createElement('h2');h.textContent=t.label||'Untitled';main.appendChild(h);
    var tn=document.createElement('div');tn.className='ed-tabname';tn.appendChild(field('Tab name',t.label,function(v){t.label=v;h.textContent=v||'Untitled';side.children[ed.tab].textContent=v||'Untitled'}));main.appendChild(tn);
    t.groups.forEach(function(g,gi){
      var box=document.createElement('section');box.className='ed-group';
      var head=document.createElement('div');head.className='ed-ghead';
      head.appendChild(field('Section',g.title,function(v){g.title=v}));
      var nh=g.items.filter(function(x){return x.hidden}).length;
      var gb=document.createElement('div');gb.className='ed-gbtns';
      gb.appendChild(btn('↑','Move section up',function(){if(gi>0){t.groups.splice(gi-1,0,t.groups.splice(gi,1)[0]);markDirty();edRender()}}));
      gb.appendChild(btn('↓','Move section down',function(){if(gi<t.groups.length-1){t.groups.splice(gi+1,0,t.groups.splice(gi,1)[0]);markDirty();edRender()}}));
      gb.appendChild(confirmBtn('Delete section',function(){t.groups.splice(gi,1);markDirty();edRender()}));
      head.appendChild(gb);box.appendChild(head);
      if(nh){var hn=document.createElement('p');hn.className='ed-hnote';hn.textContent=nh+(nh===1?' item is':' items are')+' hidden from the website in this section.';box.appendChild(hn)}
      var notes=document.createElement('div');notes.className='ed-notes';
      notes.appendChild(field('Note above items (optional)',g.note,function(v){g.note=v}));
      notes.appendChild(field('Note below items (optional)',g.noteAfter,function(v){g.noteAfter=v}));
      box.appendChild(notes);
      var list=document.createElement('div');
      g.items.forEach(function(it,ii){
        var row=document.createElement('div');row.className='ed-item'+(it.hidden?' is-hidden':'');
        if(isWine(it)){
          row.classList.add('ed-wine');
          var nm=field('Wine',it.name,function(v){it.name=v});nm.classList.add('wide');row.appendChild(nm);
          row.appendChild(field('Country',it.country,function(v){it.country=v}));
          row.appendChild(field('Appellation',it.appellation,function(v){it.appellation=v}));
          row.appendChild(field('Grape',it.grape,function(v){it.grape=v}));
          row.appendChild(field('Bottle price',it.bottle,function(v){it.bottle=v;it.price=v||(it.glass?it.glass+' glass':'')}));
          row.appendChild(field('Glass price',it.glass,function(v){if(v)it.glass=v;else delete it.glass;if(!it.bottle)it.price=v?v+' glass':''}));
          var wd=field('Tasting note',it.desc,function(v){it.desc=v});wd.classList.add('desc');row.appendChild(wd);
        }else{
        row.appendChild(field('Dish / drink',it.name,function(v){it.name=v}));
        row.appendChild(field('Farm or producer',it.src,function(v){it.src=v}));
        var dsc=field('Description',it.desc,function(v){it.desc=v});dsc.classList.add('desc');row.appendChild(dsc);
        row.appendChild(field('Price',it.price,function(v){it.price=v}));
        }
        var ib=document.createElement('div');ib.className='ed-ibtns';
        var hb=btn(it.hidden?'Show':'Hide',it.hidden?'Show on website':'Hide from website',function(){it.hidden=!it.hidden;if(!it.hidden)delete it.hidden;markDirty();edRender()});hb.classList.add('ed-hide');if(it.hidden)hb.classList.add('on');ib.appendChild(hb);
        ib.appendChild(btn('↑','Move up',function(){if(ii>0){g.items.splice(ii-1,0,g.items.splice(ii,1)[0]);markDirty();edRender()}}));
        ib.appendChild(btn('↓','Move down',function(){if(ii<g.items.length-1){g.items.splice(ii+1,0,g.items.splice(ii,1)[0]);markDirty();edRender()}}));
        ib.appendChild(confirmBtn('✕',function(){g.items.splice(ii,1);markDirty();edRender()},'Remove item'));
        row.appendChild(ib);list.appendChild(row);
      });
      box.appendChild(list);
      var foot=document.createElement('div');foot.className='ed-gfoot';
      foot.appendChild(btn('+ Add item','Add item',function(){g.items.push(hasWine(t)?{name:'',country:'',appellation:'',grape:'',bottle:'',desc:'',price:''}:{name:'',src:'',desc:'',price:''});markDirty();edRender();var ins=box.querySelectorAll('.ed-item input');if(ins.length)ins[ins.length-4].focus()}));
      box.appendChild(foot);main.appendChild(box);
    });
    var ag=btn('+ Add section','Add section',function(){t.groups.push({id:newGid(),title:'New section',note:'',noteAfter:'',items:[{name:'',src:'',desc:'',price:''}]});markDirty();edRender();main.scrollTop=main.scrollHeight});
    ag.classList.add('ed-addgroup');main.appendChild(ag);
    var al=document.createElement('div');al.className='ed-allergy';al.appendChild(field('Allergy notice (shown under every tab)',d.allergy,function(v){d.allergy=v}));main.appendChild(al);
  }

  function area(label,val,onchange){
    var w=document.createElement('label');w.className='ed-field';
    var sp=document.createElement('span');sp.textContent=label;w.appendChild(sp);
    var i=document.createElement('textarea');i.rows=3;i.value=val||'';i.disabled=!ed.canWrite;
    i.addEventListener('input',function(){onchange(i.value);markDirty()});
    w.appendChild(i);return w;
  }
  function edSupper(main){
    var d=ed.draft;
    if(!d.supper)d.supper={eyebrow:'Eden Supper Club',title:'',date:'',intro:'',menuHeading:'',tier1:'Pairing I',tier2:'Pairing II',courses:[],resText:'',notes:[],ctaLabel:'',ctaUrl:''};
    var sp=d.supper;
    var h=document.createElement('h2');h.textContent='Supper Club page';main.appendChild(h);
    var intro=document.createElement('p');intro.className='ed-help';intro.textContent='Everything on the Supper Club page. Changes publish to the website automatically.';main.appendChild(intro);
    function box(title){var b=document.createElement('section');b.className='ed-group';var hd=document.createElement('div');hd.className='ed-ghead';var t=document.createElement('h3');t.className='ed-boxtitle';t.textContent=title;hd.appendChild(t);b.appendChild(hd);var body=document.createElement('div');body.className='ed-boxbody';b.appendChild(body);main.appendChild(b);return body}
    var top=box('Top of page');
    top.appendChild(field('Small heading',sp.eyebrow,function(v){sp.eyebrow=v}));
    top.appendChild(field('Event title',sp.title,function(v){sp.title=v}));
    top.appendChild(field('Dates and times',sp.date,function(v){sp.date=v}));
    top.appendChild(area('Introduction',sp.intro,function(v){sp.intro=v}));
    var mb=box('Courses');
    var row1=document.createElement('div');row1.className='ed-notes';
    row1.appendChild(field('Menu heading',sp.menuHeading,function(v){sp.menuHeading=v}));
    var tiers=document.createElement('div');tiers.className='ed-notes';tiers.style.padding='0';tiers.style.border='0';
    tiers.appendChild(field('First pairing label',sp.tier1,function(v){sp.tier1=v}));
    tiers.appendChild(field('Second pairing label',sp.tier2,function(v){sp.tier2=v}));
    row1.appendChild(tiers);mb.parentNode.insertBefore(row1,mb);
    sp.courses.forEach(function(c,ci){
      var row=document.createElement('div');row.className='ed-item ed-course'+(c.hidden?' is-hidden':'');
      row.appendChild(field('Course',c.name,function(v){c.name=v}));
      row.appendChild(field('Description',c.desc,function(v){c.desc=v}));
      row.appendChild(field(sp.tier1||'First pairing',c.w1,function(v){c.w1=v}));
      row.appendChild(field(sp.tier2||'Second pairing',c.w2,function(v){c.w2=v}));
      var ib=document.createElement('div');ib.className='ed-ibtns';
      var hb=btn(c.hidden?'Show':'Hide',c.hidden?'Show on website':'Hide from website',function(){c.hidden=!c.hidden;if(!c.hidden)delete c.hidden;markDirty();edRender()});hb.classList.add('ed-hide');if(c.hidden)hb.classList.add('on');ib.appendChild(hb);
      ib.appendChild(btn('↑','Move up',function(){if(ci>0){sp.courses.splice(ci-1,0,sp.courses.splice(ci,1)[0]);markDirty();edRender()}}));
      ib.appendChild(btn('↓','Move down',function(){if(ci<sp.courses.length-1){sp.courses.splice(ci+1,0,sp.courses.splice(ci,1)[0]);markDirty();edRender()}}));
      ib.appendChild(confirmBtn('✕',function(){sp.courses.splice(ci,1);markDirty();edRender()},'Remove course'));
      row.appendChild(ib);mb.appendChild(row);
    });
    var addc=document.createElement('div');addc.className='ed-gfoot';
    addc.appendChild(btn('+ Add course','Add course',function(){sp.courses.push({name:'',desc:'',w1:'',w2:''});markDirty();edRender()}));
    mb.appendChild(addc);
    var rb=box('Reservations');
    rb.appendChild(area('Message',sp.resText,function(v){sp.resText=v}));
    (sp.notes=sp.notes||[]).forEach(function(n,ni){
      var r=document.createElement('div');r.className='ed-noterow';
      r.appendChild(field('Detail '+(ni+1),n,function(v){sp.notes[ni]=v}));
      r.appendChild(confirmBtn('✕',function(){sp.notes.splice(ni,1);markDirty();edRender()},'Remove detail'));
      rb.appendChild(r);
    });
    rb.appendChild(btn('+ Add detail','Add detail',function(){sp.notes.push('');markDirty();edRender()}));
    var cta=document.createElement('div');cta.className='ed-notes';cta.style.padding='12px 0 0';cta.style.border='0';
    cta.appendChild(field('Button text',sp.ctaLabel,function(v){sp.ctaLabel=v}));
    cta.appendChild(field('Button link (e.g. an OpenTable booking page)',sp.ctaUrl,function(v){sp.ctaUrl=v}));
    rb.appendChild(cta);
  }
  function field(label,val,onchange){
    var w=document.createElement('label');w.className='ed-field';
    var sp=document.createElement('span');sp.textContent=label;w.appendChild(sp);
    var i=document.createElement('input');i.value=val||'';i.disabled=!ed.canWrite;
    i.addEventListener('input',function(){onchange(i.value);markDirty()});
    w.appendChild(i);return w;
  }
  function btn(text,label,fn){var b=document.createElement('button');b.type='button';b.className='ed-btn small';b.textContent=text;b.setAttribute('aria-label',label);b.disabled=!ed.canWrite;b.onclick=fn;return b}
  function confirmBtn(text,fn,label){
    var b=btn(text,label||text,function(){
      if(b.dataset.armed){fn();return}
      b.dataset.armed='1';b.textContent='Confirm';
      setTimeout(function(){if(b.isConnected){delete b.dataset.armed;b.textContent=text}},3000);
    });
    b.classList.add('danger');return b;
  }
  function save(){
    clearTimeout(ed.timer);
    if(!ed.dirty||!store.db)return Promise.resolve();
    if(ed.saving){ed.timer=setTimeout(save,300);return Promise.resolve()}
    ed.saving=true;ed.dirty=false;status('Publishing…');
    var p=splitMenu(ed.draft),db=store.db,jobs=[],done={};
    Object.keys(p.groups).forEach(function(id){
      var str=JSON.stringify(p.groups[id]);
      if(str!==store.saved['g:'+id]){jobs.push(db.doc('site/menu/groups/'+id).set(p.groups[id]));done['g:'+id]=str}
    });
    Object.keys(store.saved).forEach(function(k){
      if(k.indexOf('g:')===0&&!p.groups[k.slice(2)]){jobs.push(db.doc('site/menu/groups/'+k.slice(2)).delete());done[k]=null}
    });
    var sup=JSON.stringify(p.supper);
    if(sup!==store.saved.supper&&p.supper){jobs.push(db.doc('site/supper').set(p.supper));done.supper=sup}
    var meta=p.meta;meta.updatedAt=Date.now();
    jobs.push(db.doc('site/menu').set(meta));done.meta=JSON.stringify(p.meta);
    return Promise.all(jobs).then(function(){
      Object.keys(done).forEach(function(k){if(done[k]===null)delete store.saved[k];else store.saved[k]=done[k]});
      ed.saving=false;
      if(!ed.dirty)status('Published. Live on the website.','ok');
    },function(e){
      ed.saving=false;ed.dirty=true;
      status(e&&e.code==='invalid_argument'?'You don\'t have permission to change the menu.':'Couldn\'t publish. Check your connection; trying again shortly.','err');
      if(!(e&&e.code==='invalid_argument'))ed.timer=setTimeout(save,5000);
    });
  }
  document.getElementById('edSave').onclick=function(){ed.dirty=true;save()};
  document.getElementById('edView').onclick=function(){save();history.replaceState(null,'','#menu');closeEditor();document.getElementById('menu').scrollIntoView()};
  function openEditor(){
    ed.draft=clone(menuData);ed.tab=0;ed.el.hidden=false;document.body.style.overflow='hidden';
    if(!dbOK){ed.canWrite=false;edRender();status('The menu editor is not connected yet. See \u201cMenu editor setup\u201d in the README.','err');document.getElementById('edSave').disabled=true;return}
    edRender();status(ed.canWrite?'Ready. Changes publish to the website automatically.':'View only. You don\'t have permission to change the menu.',ed.canWrite?'':'err');
    document.getElementById('edSave').disabled=!ed.canWrite;
  }
  function closeEditor(){ed.el.hidden=true;document.body.style.overflow=''}
  var supperEl=document.getElementById('supper');
  function route(){
    var h=location.hash;
    if(h==='#editor'){
      var CF=window.EDEN_CONFIG||{};
      if(String(CF.backend).toLowerCase()==='supabase'){ // editing lives on the staff site now
        if(CF.staffSite){location.href=CF.staffSite;return}
        history.replaceState(null,'','#home');h='#home';
      }else{openEditor();return}
    }
    if(!ed.el.hidden)closeEditor();
    var kiosk=false;try{kiosk=localStorage.getItem('eden-ipad-menu')==='1'}catch(e){}
    if(h==='#ipad'){try{localStorage.setItem('eden-ipad-menu','1')}catch(e){}kiosk=true}
    var onPad=(h==='#ipad')||(kiosk&&h!=='#editor'&&h!=='#exit-ipad');
    if(h==='#exit-ipad'){try{localStorage.removeItem('eden-ipad-menu')}catch(e){}history.replaceState(null,'','#home');h='#home';}
    pad.el.hidden=!onPad;document.body.classList.toggle('on-ipad',onPad);
    if(onPad){renderPad(menuData);padIdle();}
    padIdentity(onPad);
    var onCater=(h==='#catering');
    var caterEl=document.getElementById('cater'),wasCater=!caterEl.hidden;
    caterEl.hidden=!onCater;document.body.classList.toggle('on-cater',onCater);
    if(onCater&&!wasCater)window.scrollTo(0,0);
    var onSup=(h==='#supper'||h==='#supper-menu');
    var was=!supperEl.hidden;
    supperEl.hidden=!onSup;document.body.classList.toggle('on-supper',onSup);
    if(onSup){if(!was)window.scrollTo(0,0);if(h==='#supper-menu')document.getElementById('supper-menu').scrollIntoView();}
    else if(was||(wasCater&&!onCater)){var t=h&&h.length>1&&document.getElementById(h.slice(1));if(t)t.scrollIntoView();else window.scrollTo(0,0)}
    window.dispatchEvent(new Event('scroll'));
  }
  window.addEventListener('hashchange',route);
  window.addEventListener('beforeunload',function(e){if(ed.dirty){save();e.preventDefault();e.returnValue=''}});

  (async function(){
    try{
      var db=await claude.use('db'),user=await claude.use('user');
      if(user){
        var can=await user.can('data.write'),edit=await user.canEdit();
        ed.canWrite=edit||can===true;
        if(ed.canWrite)document.getElementById('editLink').hidden=false;
      }
      if(db){
        dbOK=true;store.db=db;menuRef=db.doc('site/menu');
        menuRef.onSnapshot(function(snap){
          store.have.meta=true;store.meta=snap.exists?snap.data():null;applyStore(snap.metadata.hasPendingWrites);
        },function(){});
        db.collection('site/menu/groups').onSnapshot(function(q){
          var g={};q.docs.forEach(function(doc){g[doc.id]=doc.data()});store.groups=g;store.have.groups=true;applyStore(q.metadata.hasPendingWrites);
        },function(){});
        db.doc('site/supper').onSnapshot(function(snap){
          store.have.supper=true;store.supper=snap.exists?snap.data():undefined;applyStore(snap.metadata.hasPendingWrites);
        },function(){});
      }
    }catch(e){}
    route();
  })();
  route();

  document.getElementById('yr').textContent=new Date().getFullYear();

  /* hearth: breathing coal glow, slow lit smoke, rare golden glints */
  function hearth(c,opts){
  opts=opts||{};
  var ctx=c.getContext('2d');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W,H,dpr,puffs=[],glints=[],last=0,clock=0,running=true;
  // one soft puff sprite, drawn once and reused
  var sprite=document.createElement('canvas');sprite.width=sprite.height=256;
  (function(){var g=sprite.getContext('2d'),r=g.createRadialGradient(128,128,0,128,128,128);
    r.addColorStop(0,'rgba(255,255,255,.55)');r.addColorStop(.35,'rgba(255,255,255,.28)');r.addColorStop(.7,'rgba(255,255,255,.08)');r.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=r;g.fillRect(0,0,256,256)})();
  var tinted={};
  function tint(rgb){ // cache a warm-tinted copy of the sprite
    if(tinted[rgb])return tinted[rgb];
    var t=document.createElement('canvas');t.width=t.height=256;var g=t.getContext('2d');
    g.drawImage(sprite,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgb('+rgb+')';g.fillRect(0,0,256,256);
    return tinted[rgb]=t;
  }
  var SMOKE=tint('214,186,160'),SMOKE_LIT=tint('236,170,110');
  function size(){dpr=Math.min(window.devicePixelRatio||1,2);W=c.clientWidth;H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  function puff(init){
    var r=50+Math.random()*90;
    return{x:W*(.05+.9*Math.random()),y:init?H*(.2+.85*Math.random()):H+r*.4,r:r,grow:8+Math.random()*14,
      vy:-(9+Math.random()*12),vx:(Math.random()-.5)*6,rot:Math.random()*6.28,vr:(Math.random()-.5)*.08,
      a:.035+Math.random()*.045,seed:Math.random()*100};
  }
  function glint(){return{x:W*(.1+.8*Math.random()),y:H+4,vy:-(16+Math.random()*14),vx:(Math.random()-.5)*6,life:0,max:5+Math.random()*4,s:.6+Math.random()*.7,seed:Math.random()*100}}
  function step(dt){
    clock+=dt;
    var target=Math.round(W/38);
    while(puffs.length<target)puffs.push(puff(false));
    puffs.forEach(function(p,i){
      p.vx+=Math.sin(clock*.25+p.seed)*1.5*dt;
      p.x+=p.vx*dt+Math.sin(clock*.4+p.seed+p.y*.004)*6*dt;p.y+=p.vy*dt;p.r+=p.grow*dt;p.rot+=p.vr*dt;
      if(p.y+p.r<-20)puffs[i]=puff(false);
    });
    if(Math.random()<dt*.45)glints.push(glint());
    for(var j=glints.length-1;j>=0;j--){var g=glints[j];g.life+=dt;g.x+=(g.vx+Math.sin(clock*.9+g.seed)*8)*dt;g.y+=g.vy*dt;if(g.life>g.max)glints.splice(j,1)}
  }
  function paint(){
    ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);
    // coal bed: a low, breathing glow across the base of the frame
    var breath=.72+.16*Math.sin(clock*.55)+.08*Math.sin(clock*1.7+1.3)+.04*Math.sin(clock*3.1);
    ctx.globalCompositeOperation='lighter';
    for(var k=0;k<3;k++){
      var cx=W*(.25+.25*k)+Math.sin(clock*.2+k*2)*W*.04,cy=H*1.04;
      var rad=opts.reach?Math.max(W*.55+H*.15,H*opts.reach):W*.55+H*.15;
      var b=breath*(.85+.15*Math.sin(clock*.7+k*1.9));
      var gr=ctx.createRadialGradient(cx,cy,0,cx,cy,rad);
      gr.addColorStop(0,'rgba(240,140,60,'+(.30*b).toFixed(3)+')');
      gr.addColorStop(.25,'rgba(190,90,35,'+(.16*b).toFixed(3)+')');
      gr.addColorStop(.6,'rgba(110,45,20,'+(.06*b).toFixed(3)+')');
      gr.addColorStop(1,'rgba(60,20,10,0)');
      ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
    }
    // smoke: lit warm from below, cooling to soft grey as it rises
    ctx.globalCompositeOperation='screen';
    puffs.forEach(function(p){
      var h=Math.max(0,Math.min(1,p.y/H)); // 1 at bottom, 0 at top
      var fadeIn=Math.min(1,(H+p.r*.4-p.y)/(H*.25));
      var fadeOut=Math.pow(Math.max(0,Math.min(1,p.y/(H*.75))),1.6);
      var a=p.a*fadeIn*fadeOut;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(.85,1.5);
      ctx.globalAlpha=a*(1-h*.6);ctx.drawImage(SMOKE,-p.r,-p.r,p.r*2,p.r*2);
      ctx.globalAlpha=a*h*breath*.9;ctx.drawImage(SMOKE_LIT,-p.r,-p.r,p.r*2,p.r*2);
      ctx.restore();
    });
    ctx.globalAlpha=1;
    // a few slow golden glints drifting up through the smoke
    ctx.globalCompositeOperation='lighter';
    glints.forEach(function(g){
      var k=g.life/g.max,a=Math.min(1,g.life*1.5)*(1-k*k)*(.6+.4*Math.sin(clock*6+g.seed));
      var r=g.s*6;var gr=ctx.createRadialGradient(g.x,g.y,0,g.x,g.y,r);
      gr.addColorStop(0,'rgba(255,214,140,'+(a*.9).toFixed(3)+')');gr.addColorStop(.3,'rgba(240,160,80,'+(a*.35).toFixed(3)+')');gr.addColorStop(1,'rgba(200,110,40,0)');
      ctx.fillStyle=gr;ctx.beginPath();ctx.arc(g.x,g.y,r,0,6.283);ctx.fill();
    });
    ctx.globalCompositeOperation='source-over';
  }
  function loop(now){
    if(!last)last=now;var dt=Math.min(.05,(now-last)/1000);last=now;
    if(running&&W>0&&H>0){step(dt);paint()}
    requestAnimationFrame(loop);
  }
  size();
  for(var i=0;i<Math.round(W/38);i++)puffs.push(puff(true));
  for(var w=0;w<60;w++)step(1/30);
  paint();
  window.addEventListener('resize',size);
  if('ResizeObserver' in window)new ResizeObserver(function(){var w0=W;size();if(!w0&&W){puffs=[];for(var i=0;i<Math.round(W/38);i++)puffs.push(puff(true));for(var w=0;w<60;w++)step(1/30);paint()}}).observe(c);
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){running=es[0].isIntersecting}).observe(c);
  if(!reduce)requestAnimationFrame(loop);
  }
  hearth(document.getElementById('embers'));
  hearth(document.getElementById('padFire'),{reach:.74});
})();
