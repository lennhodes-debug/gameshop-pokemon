(function(){
  try { if(sessionStorage.getItem('gi-v10')) return; } catch(e){ return; }

  var S=2200, platforms=[
    {n:'Game Boy',y:'1989',t:'Het begin van een tijdperk',c:'#9BBC0F',img:'/images/products/gb-001-pokemon-trading-card-game.webp'},
    {n:'Game Boy Advance',y:'2001',t:'32-bit in je broekzak',c:'#7B68EE',img:'/images/products/gba-001-pokemon-emerald.webp'},
    {n:'Nintendo DS',y:'2004',t:'Twee schermen, dubbel plezier',c:'#94A3B8',img:'/images/products/ds-001-pokemon-platinum.webp'},
    {n:'Wii',y:'2006',t:'Gaming voor iedereen',c:'#00BFFF',img:'/images/products/wii-004-super-mario-galaxy-2.webp'},
    {n:'Nintendo 3DS',y:'2011',t:'Een nieuwe dimensie',c:'#EF4444',img:'/images/products/3ds-001-pokemon-x.webp'},
    {n:'Wii U',y:'2012',t:'Speel op je eigen scherm',c:'#38BDF8',img:'/images/products/wiiu-001-mario-kart-8.webp'}
  ];

  var scenes=platforms.length+2;
  var tot=scenes*S;

  var css=document.createElement('style');
  css.textContent=
    '@keyframes piFade{0%{opacity:0;transform:scale(.96) translateY(12px)}10%{opacity:1;transform:scale(1) translateY(0)}88%{opacity:1;transform:scale(1) translateY(0)}100%{opacity:0;transform:scale(1.02) translateY(-6px)}}'+
    '@keyframes piBar{from{width:0}to{width:100%}}'+
    '@keyframes piGrain{0%,100%{opacity:.03}50%{opacity:.06}}'+
    '@keyframes piPulse{0%,100%{opacity:.15}50%{opacity:.3}}'+
    '.pi-sc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;animation:piFade '+S+'ms cubic-bezier(.4,0,.2,1) both}';
  document.head.appendChild(css);

  var o=document.createElement('div');
  o.id='pi-overlay';
  o.style.cssText='position:fixed;inset:0;z-index:9999;background:#030306;transition:opacity .6s ease';

  // film grain overlay
  o.innerHTML='<div style="position:absolute;inset:0;background:url(\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.04%22/></svg>\');animation:piGrain 3s linear infinite;pointer-events:none;z-index:10"></div>';

  // letterbox
  o.innerHTML+='<div style="position:absolute;top:0;left:0;right:0;height:7%;background:linear-gradient(to bottom,#000,transparent);z-index:2"></div>';
  o.innerHTML+='<div style="position:absolute;bottom:0;left:0;right:0;height:7%;background:linear-gradient(to top,#000,transparent);z-index:2"></div>';

  // opening
  o.innerHTML+='<div class="pi-sc" style="animation-delay:0ms"><div style="text-align:center;padding:0 24px">'+
    '<div style="width:60px;height:1px;background:rgba(52,211,153,.4);margin:0 auto 32px"></div>'+
    '<p style="font-size:10px;font-family:monospace;letter-spacing:.6em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:20px">Gameshop Enter presenteert</p>'+
    '<h1 style="font-size:clamp(24px,4vw,40px);font-weight:300;color:rgba(255,255,255,.7);margin:0;letter-spacing:.02em">Een reis door</h1>'+
    '<h1 style="font-size:clamp(36px,7vw,72px);font-weight:900;background:linear-gradient(135deg,#34d399,#2dd4bf,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:8px 0 0;letter-spacing:-.02em">Nintendo geschiedenis</h1>'+
    '<div style="width:60px;height:1px;background:rgba(52,211,153,.4);margin:32px auto 0"></div>'+
    '</div></div>';

  // platform scenes
  for(var i=0;i<platforms.length;i++){
    var p=platforms[i];
    var delay=(i+1)*S;
    o.innerHTML+='<div class="pi-sc" style="animation-delay:'+delay+'ms"><div style="text-align:center;padding:0 24px;max-width:600px">'+
      '<p style="font-family:monospace;font-size:clamp(56px,10vw,100px);font-weight:900;color:'+p.c+';opacity:.12;margin:0 0 -8px;line-height:1;letter-spacing:-.05em">'+p.y+'</p>'+
      '<h2 style="font-size:clamp(32px,6vw,64px);font-weight:900;color:#fff;line-height:.9;margin:0 0 8px;letter-spacing:-.02em">'+p.n+'</h2>'+
      '<p style="font-size:clamp(12px,1.8vw,16px);color:rgba(255,255,255,.35);margin:0 0 36px;font-style:italic">'+p.t+'</p>'+
      '<div style="width:clamp(140px,25vw,220px);height:clamp(140px,25vw,220px);margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px -10px rgba(0,0,0,.9),0 0 40px -8px '+p.c+'25">'+
      '<img src="'+p.img+'" alt="'+p.n+'" width="256" height="256" style="width:100%;height:100%;object-fit:cover" loading="eager">'+
      '</div></div></div>';
  }

  // finale
  var fd=(platforms.length+1)*S;
  o.innerHTML+='<div class="pi-sc" style="animation-delay:'+fd+'ms"><div style="text-align:center">'+
    '<div style="width:40px;height:1px;background:rgba(52,211,153,.3);margin:0 auto 24px"></div>'+
    '<h2 style="font-size:clamp(40px,7vw,80px);font-weight:900;color:#fff;line-height:1;margin:0;letter-spacing:-.03em">Gameshop</h2>'+
    '<h2 style="font-size:clamp(40px,7vw,80px);font-weight:900;line-height:1;margin:0;letter-spacing:-.03em;background:linear-gradient(135deg,#34d399,#2dd4bf,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Enter</h2>'+
    '<p style="font-size:14px;color:rgba(255,255,255,.3);margin-top:20px;letter-spacing:.1em;text-transform:uppercase;font-family:monospace">D\u00e9 Nintendo specialist van Nederland</p>'+
    '<div style="width:40px;height:1px;background:rgba(52,211,153,.3);margin:24px auto 0"></div>'+
    '</div></div>';

  // skip
  o.innerHTML+='<button id="pi-skip" style="position:absolute;bottom:8%;right:20px;z-index:12;padding:6px 14px;font-size:10px;color:rgba(255,255,255,.2);background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:999px;cursor:pointer;font-family:monospace;letter-spacing:.1em;backdrop-filter:blur(4px)">SKIP \u25b8</button>';

  // progress
  o.innerHTML+='<div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,.03);z-index:12"><div style="height:100%;background:linear-gradient(90deg,#34d399,#22d3ee);animation:piBar '+tot+'ms linear forwards;box-shadow:0 0 8px rgba(52,211,153,.3)"></div></div>';

  document.body.appendChild(o);
  document.body.style.overflow='hidden';

  function close(){
    o.style.opacity='0';
    document.body.style.overflow='';
    try{sessionStorage.setItem('gi-v10','1')}catch(e){}
    setTimeout(function(){o.remove();css.remove()},700);
  }

  document.getElementById('pi-skip').onclick=function(e){e.stopPropagation();close()};
  o.onclick=close;
  setTimeout(close, tot);
})();
