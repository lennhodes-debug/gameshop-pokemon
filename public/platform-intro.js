(function(){
  try { if(sessionStorage.getItem('gi-v12')) return; } catch(e){ return; }

  // ─── Config ──────────────────────────────────────────
  var SCENE_MS = 2200;
  var scenes = [
    // Nostalgische gaming momenten per console
    {
      n: 'NES', y: '1985',
      t: 'Waar het allemaal begon',
      sub: 'Super Mario Bros veranderde alles',
      c: '#CC0000', img: '/images/consoles/nes.webp',
      vibe: 'De eerste keer opstarten... dat geluid vergeet je nooit'
    },
    {
      n: 'Game Boy', y: '1989',
      t: 'Gaming voor onderweg',
      sub: 'Tetris, Pok\u00e9mon, eindeloos plezier',
      c: '#9BBC0F', img: '/images/consoles/gameboy.webp',
      vibe: 'Onder de dekens met een zaklamp en je Game Boy'
    },
    {
      n: 'Super Nintendo', y: '1991',
      t: '16-bit perfectie',
      sub: 'A Link to the Past, Super Metroid',
      c: '#7B2D8E', img: '/images/consoles/snes.webp',
      vibe: 'Op zondagochtend samen op de bank'
    },
    {
      n: 'Nintendo 64', y: '1996',
      t: 'De sprong naar 3D',
      sub: 'Mario 64, GoldenEye, Smash Bros',
      c: '#008837', img: '/images/consoles/n64.webp',
      vibe: 'Met vier vrienden Mario Kart — pure chaos'
    },
    {
      n: 'Game Boy Color', y: '1998',
      t: 'De wereld krijgt kleur',
      sub: 'Pok\u00e9mon Gold & Silver',
      c: '#6B21A8', img: '/images/consoles/gbc.webp',
      vibe: 'Link kabels en ruilen op het schoolplein'
    },
    {
      n: 'Game Boy Advance', y: '2001',
      t: '32-bit in je broekzak',
      sub: 'Pok\u00e9mon Emerald, Fire Emblem',
      c: '#4338CA', img: '/images/consoles/gba.webp',
      vibe: 'Achterbank van de auto, uren lang verdwenen in Hoenn'
    },
    {
      n: 'GameCube', y: '2001',
      t: 'Klein maar krachtig',
      sub: 'Melee, Wind Waker, Sunshine',
      c: '#6D28D9', img: '/images/consoles/gamecube.webp',
      vibe: 'Die kleine paarse kubus met grote avonturen'
    },
    {
      n: 'Nintendo DS', y: '2004',
      t: 'Twee schermen, dubbel plezier',
      sub: 'Brain Age, Mario Kart DS',
      c: '#94A3B8', img: '/images/consoles/ds.webp',
      vibe: 'Pictochat in de klas wanneer de leraar niet keek'
    },
    {
      n: 'Wii', y: '2006',
      t: 'Gaming voor iedereen',
      sub: 'Wii Sports, Mario Galaxy',
      c: '#00BFFF', img: '/images/consoles/wii.webp',
      vibe: 'Opa en oma die meedoen met Wii Bowling'
    },
    {
      n: 'Nintendo 3DS', y: '2011',
      t: 'Een nieuwe dimensie',
      sub: '3D zonder bril, StreetPass magie',
      c: '#EF4444', img: '/images/consoles/3ds.webp',
      vibe: 'De verbazing toen je voor het eerst 3D zag'
    },
    {
      n: 'Wii U', y: '2012',
      t: 'Speel op je eigen scherm',
      sub: 'Splatoon, Mario Maker',
      c: '#38BDF8', img: '/images/consoles/wiiu.webp',
      vibe: 'Gamen terwijl iemand anders TV kijkt'
    },
    {
      n: 'Nintendo Switch', y: '2017',
      t: 'Speel wanneer je wilt',
      sub: 'Breath of the Wild, Animal Crossing',
      c: '#E60012', img: '/images/consoles/switch.webp',
      vibe: 'Van TV naar handheld — naadloos verder spelen'
    }
  ];

  var totalScenes = scenes.length + 2; // opening + scenes + finale
  var totalMs = totalScenes * SCENE_MS;

  // ─── Inject styles ───────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    '@keyframes piFadeIn{0%{opacity:0;transform:translateY(16px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}',
    '@keyframes piScale{0%{transform:scale(1)}100%{transform:scale(1.06)}}',
    '@keyframes piBar{from{width:0}to{width:100%}}',
    '@keyframes piLineW{from{width:0}to{width:80px}}',
    '@keyframes piVibeIn{0%{opacity:0;transform:translateY(8px)}30%{opacity:1;transform:translateY(0)}80%{opacity:1}100%{opacity:0}}',
    '@keyframes piPulse{0%,100%{opacity:.03}50%{opacity:.08}}',
    '@keyframes piFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    // Scene container
    '.pi-sc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;animation:piFadeIn '+SCENE_MS+'ms cubic-bezier(.25,.1,.25,1) both;pointer-events:none}',
    // Image wrapper with glassmorphism
    '.pi-img{width:clamp(130px,20vw,180px);height:clamp(130px,20vw,180px);border-radius:50%;overflow:hidden;background:rgba(255,255,255,.04);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;margin:0 auto 0;position:relative}',
    '.pi-img img{width:70%;height:70%;object-fit:contain;animation:piScale '+SCENE_MS+'ms ease-out both}',
    // Year background
    '.pi-year{font-family:monospace;font-size:clamp(60px,11vw,100px);font-weight:900;opacity:.06;position:absolute;top:50%;left:50%;transform:translate(-50%,-70%);line-height:1;letter-spacing:-.06em;white-space:nowrap}',
    // Vibe quote
    '.pi-vibe{font-size:clamp(10px,1.3vw,13px);color:rgba(255,255,255,.2);font-style:italic;max-width:320px;margin:14px auto 0;line-height:1.5;text-align:center;animation:piVibeIn '+SCENE_MS+'ms ease both}'
  ].join('');
  document.head.appendChild(css);

  // ─── Build overlay ───────────────────────────────────
  var o = document.createElement('div');
  o.id = 'pi-overlay';
  o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at center,#0a0e1a,#030306);transition:opacity .8s ease;overflow:hidden';

  // Ambient particles
  var particles = '';
  for(var pi=0; pi<30; pi++){
    var px = Math.random()*100, py = Math.random()*100;
    var ps = 1+Math.random()*2, pd = 8+Math.random()*12;
    particles += '<div style="position:absolute;left:'+px+'%;top:'+py+'%;width:'+ps+'px;height:'+ps+'px;border-radius:50%;background:rgba(52,211,153,.15);animation:piFloat '+pd+'s ease-in-out infinite;animation-delay:'+(-Math.random()*pd)+'s"></div>';
  }
  o.innerHTML = particles;

  // Vignette
  o.innerHTML += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.7));pointer-events:none;z-index:1"></div>';

  // Film grain overlay
  o.innerHTML += '<div style="position:absolute;inset:0;background:url(\'data:image/svg+xml,<svg viewBox=\\'0 0 256 256\\' xmlns=\\'http://www.w3.org/2000/svg\\'><filter id=\\'n\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'.9\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/></filter><rect width=\\'100%\\' height=\\'100%\\' filter=\\'url(%23n)\\'/></svg>\');opacity:.03;mix-blend-mode:overlay;pointer-events:none;z-index:2;animation:piPulse 4s ease infinite"></div>';

  // Letterbox
  o.innerHTML += '<div style="position:absolute;top:0;left:0;right:0;height:7%;background:linear-gradient(to bottom,#000 20%,transparent);z-index:5"></div>';
  o.innerHTML += '<div style="position:absolute;bottom:0;left:0;right:0;height:7%;background:linear-gradient(to top,#000 20%,transparent);z-index:5"></div>';

  // ─── Scene: Opening ──────────────────────────────────
  o.innerHTML += '<div class="pi-sc" style="animation-delay:0ms;z-index:3"><div style="text-align:center;padding:0 24px">' +
    '<div style="width:0;height:1px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.5),transparent);margin:0 auto 24px;animation:piLineW .8s ease .3s forwards"></div>' +
    '<p style="font-size:10px;font-family:monospace;letter-spacing:.8em;text-transform:uppercase;color:rgba(255,255,255,.2);margin-bottom:12px">Gameshop Enter presenteert</p>' +
    '<h1 style="font-size:clamp(20px,3.2vw,32px);font-weight:300;color:rgba(255,255,255,.5);margin:0;letter-spacing:.06em">Herinneringen aan</h1>' +
    '<h1 style="font-size:clamp(36px,7vw,72px);font-weight:900;background:linear-gradient(135deg,#34d399 0%,#2dd4bf 50%,#22d3ee 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:4px 0 0;letter-spacing:-.02em">Nintendo</h1>' +
    '<p style="font-size:11px;color:rgba(255,255,255,.15);margin-top:8px;letter-spacing:.1em;font-style:italic">Elke generatie heeft zijn verhaal</p>' +
    '<div style="width:0;height:1px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.5),transparent);margin:24px auto 0;animation:piLineW .8s ease .5s forwards"></div>' +
    '</div></div>';

  // ─── Console scenes ──────────────────────────────────
  for(var i=0; i<scenes.length; i++){
    var s = scenes[i];
    var delay = (i+1) * SCENE_MS;

    o.innerHTML += '<div class="pi-sc" style="animation-delay:'+delay+'ms;z-index:3">' +
      '<div style="text-align:center;padding:0 24px;position:relative;max-width:440px">' +
        // Year bg
        '<div class="pi-year" style="color:'+s.c+'">'+s.y+'</div>' +
        // Console image
        '<div class="pi-img" style="box-shadow:0 16px 48px -8px rgba(0,0,0,.5),0 0 32px -6px '+s.c+'25;border-color:'+s.c+'12">' +
          '<img src="'+s.img+'" alt="'+s.n+'" width="180" height="180" loading="eager">' +
        '</div>' +
        // Title
        '<h2 style="font-size:clamp(22px,4.5vw,42px);font-weight:800;color:#fff;line-height:1.1;margin:16px 0 4px;letter-spacing:-.02em">'+s.n+'</h2>' +
        // Subtitle
        '<p style="font-size:clamp(10px,1.4vw,13px);color:rgba(255,255,255,.25);margin:0;letter-spacing:.04em">'+s.t+'</p>' +
        // Games
        '<p style="font-size:clamp(9px,1.2vw,11px);color:'+s.c+';opacity:.5;margin:6px 0 0;font-family:monospace;letter-spacing:.05em">'+s.sub+'</p>' +
        // Nostalgia quote
        '<p class="pi-vibe" style="animation-delay:'+(delay+400)+'ms">\u201C'+s.vibe+'\u201D</p>' +
      '</div></div>';
  }

  // ─── Scene: Finale ───────────────────────────────────
  var fd = (scenes.length+1) * SCENE_MS;
  o.innerHTML += '<div class="pi-sc" style="animation-delay:'+fd+'ms;z-index:3"><div style="text-align:center;padding:0 24px">' +
    '<div style="width:0;height:1px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.4),transparent);margin:0 auto 20px;animation:piLineW .6s ease '+(fd/1000+.2)+'s forwards"></div>' +
    '<p style="font-size:10px;font-family:monospace;letter-spacing:.6em;text-transform:uppercase;color:rgba(255,255,255,.15);margin-bottom:8px">Welkom bij</p>' +
    '<h2 style="font-size:clamp(36px,6.5vw,72px);font-weight:900;color:#fff;line-height:1;margin:0;letter-spacing:-.03em">Gameshop</h2>' +
    '<h2 style="font-size:clamp(36px,6.5vw,72px);font-weight:900;line-height:1;margin:0;letter-spacing:-.03em;background:linear-gradient(135deg,#34d399,#2dd4bf,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Enter</h2>' +
    '<p style="font-size:11px;color:rgba(255,255,255,.2);margin-top:14px;letter-spacing:.12em;text-transform:uppercase;font-family:monospace">D\u00e9 Nintendo specialist van Nederland</p>' +
    '<div style="display:flex;gap:6px;justify-content:center;margin-top:16px">' +
      '<span style="font-size:10px;color:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.08);padding:3px 10px;border-radius:999px;font-family:monospace">100% Origineel</span>' +
      '<span style="font-size:10px;color:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.08);padding:3px 10px;border-radius:999px;font-family:monospace">5.0 \u2605 Reviews</span>' +
      '<span style="font-size:10px;color:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.08);padding:3px 10px;border-radius:999px;font-family:monospace">3.000+ Klanten</span>' +
    '</div>' +
    '<div style="width:0;height:1px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.4),transparent);margin:20px auto 0;animation:piLineW .6s ease '+(fd/1000+.4)+'s forwards"></div>' +
    '</div></div>';

  // ─── Timeline dots ───────────────────────────────────
  var tl = '<div style="position:absolute;bottom:9%;left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:6">';
  for(var j=0; j<scenes.length; j++){
    var tdel = (j+1)*SCENE_MS;
    tl += '<div style="width:5px;height:5px;border-radius:50%;background:'+scenes[j].c+';opacity:0;animation:piFadeIn '+SCENE_MS+'ms ease '+tdel+'ms both"></div>';
  }
  tl += '</div>';
  o.innerHTML += tl;

  // ─── Skip button ─────────────────────────────────────
  o.innerHTML += '<button id="pi-skip" style="position:absolute;bottom:7%;right:20px;z-index:12;padding:5px 14px;font-size:9px;color:rgba(255,255,255,.15);background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:999px;cursor:pointer;font-family:monospace;letter-spacing:.15em;text-transform:uppercase;transition:all .2s;backdrop-filter:blur(4px)" onmouseover="this.style.color=\'rgba(255,255,255,.4)\';this.style.borderColor=\'rgba(255,255,255,.15)\'" onmouseout="this.style.color=\'rgba(255,255,255,.15)\';this.style.borderColor=\'rgba(255,255,255,.05)\'">skip \u25b8</button>';

  // ─── Progress bar ────────────────────────────────────
  o.innerHTML += '<div style="position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,.02);z-index:12"><div style="height:100%;background:linear-gradient(90deg,#34d399,#2dd4bf,#22d3ee);animation:piBar '+totalMs+'ms linear forwards;box-shadow:0 0 10px rgba(52,211,153,.3)"></div></div>';

  // ─── Mount & controls ────────────────────────────────
  document.body.appendChild(o);
  document.body.style.overflow = 'hidden';

  function close(){
    o.style.opacity = '0';
    document.body.style.overflow = '';
    try { sessionStorage.setItem('gi-v12','1'); } catch(e){}
    setTimeout(function(){ o.remove(); css.remove(); }, 900);
  }

  document.getElementById('pi-skip').onclick = function(e){ e.stopPropagation(); close(); };
  o.onclick = close;
  setTimeout(close, totalMs);
})();
