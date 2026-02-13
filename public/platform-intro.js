(function(){
  try { if(sessionStorage.getItem('gi-v9')) return; } catch(e){ return; }

  var S=3000, platforms=[
    {n:'Game Boy',y:'1989',t:'Waar het allemaal begon',c:'#9BBC0F',img:'/images/products/gb-001-pokemon-trading-card-game.webp'},
    {n:'Game Boy Advance',y:'2001',t:'De volgende generatie',c:'#7B68EE',img:'/images/products/gba-001-pokemon-emerald.webp'},
    {n:'Nintendo DS',y:'2004',t:'Twee schermen, dubbel plezier',c:'#94A3B8',img:'/images/products/ds-001-pokemon-platinum.webp'},
    {n:'Nintendo 3DS',y:'2011',t:'Een nieuwe dimensie',c:'#EF4444',img:'/images/products/3ds-001-pokemon-x.webp'}
  ];

  var css=document.createElement('style');
  css.textContent=
    '@keyframes piFade{0%{opacity:0;transform:translateY(16px)}12%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}'+
    '@keyframes piBar{from{width:0}to{width:100%}}'+
    '.pi-sc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;animation:piFade '+S+'ms ease both}';
  document.head.appendChild(css);

  var tot=(platforms.length+2)*S;
  var o=document.createElement('div');
  o.id='pi-overlay';
  o.style.cssText='position:fixed;inset:0;z-index:9999;background:#030306;display:flex;align-items:center;justify-content:center;transition:opacity .6s ease';

  // letterbox
  o.innerHTML='<div style="position:absolute;top:0;left:0;right:0;height:6%;background:#000;z-index:2"></div><div style="position:absolute;bottom:0;left:0;right:0;height:6%;background:#000;z-index:2"></div>';

  // opening scene
  o.innerHTML+='<div class="pi-sc" style="animation-delay:0ms"><div style="text-align:center;padding:0 24px">'+
    '<p style="font-size:11px;font-family:monospace;letter-spacing:.5em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:24px">Gameshop Enter</p>'+
    '<h1 style="font-size:clamp(28px,5vw,48px);font-weight:300;color:rgba(255,255,255,.85);margin:0">Een reis door</h1>'+
    '<h1 style="font-size:clamp(36px,7vw,72px);font-weight:900;background:linear-gradient(to right,#34d399,#2dd4bf,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:8px 0 0">Nintendo geschiedenis</h1>'+
    '<div style="width:200px;height:1px;background:linear-gradient(to right,transparent,rgba(16,185,129,.5),transparent);margin:32px auto 0"></div>'+
    '</div></div>';

  // platform scenes
  for(var i=0;i<platforms.length;i++){
    var p=platforms[i];
    o.innerHTML+='<div class="pi-sc" style="animation-delay:'+(i+1)*S+'ms"><div style="text-align:center;padding:0 24px">'+
      '<p style="font-family:monospace;font-size:clamp(48px,8vw,80px);font-weight:900;color:'+p.c+';opacity:.2;margin:0 0 16px">'+p.y+'</p>'+
      '<h2 style="font-size:clamp(40px,7vw,80px);font-weight:900;color:#fff;line-height:.95;margin:0 0 12px">'+p.n+'</h2>'+
      '<p style="font-size:clamp(14px,2vw,18px);color:rgba(255,255,255,.4);margin:0 0 48px">'+p.t+'</p>'+
      '<div style="width:clamp(176px,30vw,256px);height:clamp(176px,30vw,256px);margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 30px 80px -15px rgba(0,0,0,.8),0 0 50px -10px '+p.c+'30">'+
      '<img src="'+p.img+'" alt="'+p.n+'" width="256" height="256" style="width:100%;height:100%;object-fit:cover" loading="eager">'+
      '</div></div></div>';
  }

  // finale
  o.innerHTML+='<div class="pi-sc" style="animation-delay:'+5*S+'ms"><div style="text-align:center">'+
    '<h2 style="font-size:clamp(48px,8vw,96px);font-weight:900;color:#fff;line-height:1;margin:0">Gameshop</h2>'+
    '<h2 style="font-size:clamp(48px,8vw,96px);font-weight:900;line-height:1;margin:0;background:linear-gradient(to right,#34d399,#2dd4bf,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Enter</h2>'+
    '<p style="font-size:16px;color:rgba(255,255,255,.4);margin-top:24px">De Pokémon specialist van Nederland</p>'+
    '</div></div>';

  // skip button
  o.innerHTML+='<button id="pi-skip" style="position:absolute;bottom:10%;right:24px;z-index:3;padding:8px 16px;font-size:11px;color:rgba(255,255,255,.3);background:none;border:1px solid rgba(255,255,255,.08);border-radius:999px;cursor:pointer">Overslaan ▸▸</button>';

  // progress bar
  o.innerHTML+='<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.05);z-index:3"><div style="height:100%;background:linear-gradient(to right,#34d399,#22d3ee);animation:piBar '+tot+'ms linear forwards"></div></div>';

  document.body.appendChild(o);
  document.body.style.overflow='hidden';

  function close(){
    o.style.opacity='0';
    document.body.style.overflow='';
    try{sessionStorage.setItem('gi-v9','1')}catch(e){}
    setTimeout(function(){o.remove();css.remove()},700);
  }

  document.getElementById('pi-skip').onclick=function(e){e.stopPropagation();close()};
  o.onclick=close;

  setTimeout(close, tot);
})();
