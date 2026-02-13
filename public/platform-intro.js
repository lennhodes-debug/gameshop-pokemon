(function(){
  try { if(sessionStorage.getItem('gi-v11')) return; } catch(e){ return; }

  var S=2000, platforms=[
    {n:'NES',y:'1985',t:'Het begin van een legende',c:'#CC0000',img:'/images/consoles/nes.webp'},
    {n:'Game Boy',y:'1989',t:'Gaming voor onderweg',c:'#9BBC0F',img:'/images/consoles/gameboy.webp'},
    {n:'Super Nintendo',y:'1991',t:'16-bit perfectie',c:'#7B2D8E',img:'/images/consoles/snes.webp'},
    {n:'Nintendo 64',y:'1996',t:'De sprong naar 3D',c:'#008837',img:'/images/consoles/n64.webp'},
    {n:'Game Boy Color',y:'1998',t:'De wereld krijgt kleur',c:'#6B21A8',img:'/images/consoles/gbc.webp'},
    {n:'Game Boy Advance',y:'2001',t:'32-bit in je broekzak',c:'#4338CA',img:'/images/consoles/gba.webp'},
    {n:'GameCube',y:'2001',t:'Klein maar krachtig',c:'#6D28D9',img:'/images/consoles/gamecube.webp'},
    {n:'Nintendo DS',y:'2004',t:'Twee schermen, dubbel plezier',c:'#94A3B8',img:'/images/consoles/ds.webp'},
    {n:'Wii',y:'2006',t:'Gaming voor iedereen',c:'#00BFFF',img:'/images/consoles/wii.webp'},
    {n:'Nintendo 3DS',y:'2011',t:'Een nieuwe dimensie',c:'#EF4444',img:'/images/consoles/3ds.webp'},
    {n:'Wii U',y:'2012',t:'Speel op je eigen scherm',c:'#38BDF8',img:'/images/consoles/wiiu.webp'},
    {n:'Nintendo Switch',y:'2017',t:'Speel wanneer je wilt',c:'#E60012',img:'/images/consoles/switch.webp'}
  ];

  var scenes=platforms.length+2;
  var tot=scenes*S;

  var css=document.createElement('style');
  css.textContent=
    '@keyframes piFade{0%{opacity:0;transform:scale(.94)}8%{opacity:1;transform:scale(1)}90%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.03)}}'+
    '@keyframes piImgZoom{0%{transform:scale(1)}100%{transform:scale(1.08)}}'+
    '@keyframes piBar{from{width:0}to{width:100%}}'+
    '@keyframes piGlow{0%,100%{box-shadow:0 0 30px rgba(var(--ac),.1)}50%{box-shadow:0 0 50px rgba(var(--ac),.25)}}'+
    '@keyframes piLineGrow{from{width:0}to{width:60px}}'+
    '.pi-sc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;animation:piFade '+S+'ms cubic-bezier(.25,.1,.25,1) both}'+
    '.pi-img-wrap{width:clamp(140px,22vw,200px);height:clamp(140px,22vw,200px);margin:0 auto;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.03);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;box-shadow:0 20px 60px -10px rgba(0,0,0,.6)}'+
    '.pi-img-wrap img{width:75%;height:75%;object-fit:contain;animation:piImgZoom '+S+'ms ease-out both}'+
    '.pi-year{font-family:monospace;font-size:clamp(72px,12vw,120px);font-weight:900;opacity:.07;margin:0 0 -16px;line-height:1;letter-spacing:-.06em;position:absolute;top:50%;left:50%;transform:translate(-50%,-65%)}';
  document.head.appendChild(css);

  var o=document.createElement('div');
  o.id='pi-overlay';
  o.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at center,#0a0e1a,#030306);transition:opacity .8s ease';

  // subtle vignette
  o.innerHTML='<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.6));pointer-events:none;z-index:1"></div>';

  // letterbox (gradient)
  o.innerHTML+='<div style="position:absolute;top:0;left:0;right:0;height:8%;background:linear-gradient(to bottom,#000 30%,transparent);z-index:5"></div>';
  o.innerHTML+='<div style="position:absolute;bottom:0;left:0;right:0;height:8%;background:linear-gradient(to top,#000 30%,transparent);z-index:5"></div>';

  // opening
  o.innerHTML+='<div class="pi-sc" style="animation-delay:0ms"><div style="text-align:center;padding:0 24px">'+
    '<div style="width:0;height:1px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.5),transparent);margin:0 auto 28px;animation:piLineGrow .8s ease .3s forwards"></div>'+
    '<p style="font-size:10px;font-family:monospace;letter-spacing:.7em;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:16px">Gameshop Enter presenteert</p>'+
    '<h1 style="font-size:clamp(22px,3.5vw,36px);font-weight:300;color:rgba(255,255,255,.6);margin:0;letter-spacing:.05em">Een reis door</h1>'+
    '<h1 style="font-size:clamp(36px,7vw,72px);font-weight:900;background:linear-gradient(135deg,#34d399 0%,#2dd4bf 50%,#22d3ee 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:4px 0 0;letter-spacing:-.02em">Nintendo geschiedenis</h1>'+
    '<div style="width:0;height:1px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.5),transparent);margin:28px auto 0;animation:piLineGrow .8s ease .5s forwards"></div>'+
    '</div></div>';

  // platform scenes
  for(var i=0;i<platforms.length;i++){
    var p=platforms[i];
    var d=(i+1)*S;
    o.innerHTML+='<div class="pi-sc" style="animation-delay:'+d+'ms"><div style="text-align:center;padding:0 24px;position:relative">'+
      '<div class="pi-year" style="color:'+p.c+'">'+p.y+'</div>'+
      '<div class="pi-img-wrap" style="box-shadow:0 20px 60px -10px rgba(0,0,0,.6),0 0 40px -8px '+p.c+'20;border-color:'+p.c+'15">'+
      '<img src="'+p.img+'" alt="'+p.n+'" width="200" height="200" loading="eager">'+
      '</div>'+
      '<h2 style="font-size:clamp(24px,5vw,48px);font-weight:800;color:#fff;line-height:1;margin:20px 0 6px;letter-spacing:-.02em">'+p.n+'</h2>'+
      '<p style="font-size:clamp(11px,1.6vw,14px);color:rgba(255,255,255,.3);margin:0;letter-spacing:.05em">'+p.t+'</p>'+
      '</div></div>';
  }

  // finale
  var fd=(platforms.length+1)*S;
  o.innerHTML+='<div class="pi-sc" style="animation-delay:'+fd+'ms"><div style="text-align:center">'+
    '<div style="width:0;height:1px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.4),transparent);margin:0 auto 20px;animation:piLineGrow .6s ease '+((platforms.length+1)*S/1000+.2)+'s forwards"></div>'+
    '<h2 style="font-size:clamp(36px,6vw,72px);font-weight:900;color:#fff;line-height:1;margin:0;letter-spacing:-.03em">Gameshop</h2>'+
    '<h2 style="font-size:clamp(36px,6vw,72px);font-weight:900;line-height:1;margin:0;letter-spacing:-.03em;background:linear-gradient(135deg,#34d399,#2dd4bf,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Enter</h2>'+
    '<p style="font-size:12px;color:rgba(255,255,255,.25);margin-top:16px;letter-spacing:.15em;text-transform:uppercase;font-family:monospace">D\u00e9 Nintendo specialist van Nederland</p>'+
    '<div style="width:0;height:1px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.4),transparent);margin:20px auto 0;animation:piLineGrow .6s ease '+((platforms.length+1)*S/1000+.4)+'s forwards"></div>'+
    '</div></div>';

  // timeline dots
  var tl='<div style="position:absolute;bottom:10%;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:6">';
  for(var j=0;j<platforms.length;j++){
    var del=(j+1)*S;
    tl+='<div style="width:6px;height:6px;border-radius:50%;background:'+platforms[j].c+';opacity:0;animation:piFade '+S+'ms ease '+del+'ms both"></div>';
  }
  tl+='</div>';
  o.innerHTML+=tl;

  // skip
  o.innerHTML+='<button id="pi-skip" style="position:absolute;bottom:8%;right:20px;z-index:12;padding:5px 12px;font-size:9px;color:rgba(255,255,255,.18);background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:999px;cursor:pointer;font-family:monospace;letter-spacing:.15em;text-transform:uppercase">skip \u25b8</button>';

  // progress
  o.innerHTML+='<div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,.02);z-index:12"><div style="height:100%;background:linear-gradient(90deg,#34d399,#2dd4bf,#22d3ee);animation:piBar '+tot+'ms linear forwards;box-shadow:0 0 12px rgba(52,211,153,.3)"></div></div>';

  document.body.appendChild(o);
  document.body.style.overflow='hidden';

  function close(){
    o.style.opacity='0';
    document.body.style.overflow='';
    try{sessionStorage.setItem('gi-v11','1')}catch(e){}
    setTimeout(function(){o.remove();css.remove()},900);
  }

  document.getElementById('pi-skip').onclick=function(e){e.stopPropagation();close()};
  o.onclick=close;
  setTimeout(close, tot);
})();
