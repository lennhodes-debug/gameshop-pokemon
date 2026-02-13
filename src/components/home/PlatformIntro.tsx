'use client';

import { useState, useEffect } from 'react';

const SCENE_DUR = 3;
const PLATFORMS = [
  { name: 'Game Boy', year: '1989', tagline: 'Waar het allemaal begon', accent: '#9BBC0F', cover: '/images/products/gb-001-pokemon-trading-card-game.webp' },
  { name: 'Game Boy Advance', year: '2001', tagline: 'De volgende generatie', accent: '#7B68EE', cover: '/images/products/gba-001-pokemon-emerald.webp' },
  { name: 'Nintendo DS', year: '2004', tagline: 'Twee schermen, dubbel plezier', accent: '#94A3B8', cover: '/images/products/ds-001-pokemon-platinum.webp' },
  { name: 'Nintendo 3DS', year: '2011', tagline: 'Een nieuwe dimensie', accent: '#EF4444', cover: '/images/products/3ds-001-pokemon-x.webp' },
];
const TOTAL = (PLATFORMS.length + 2) * SCENE_DUR; // 6 scenes × 3s = 18s

export default function PlatformIntro() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const key = 'gi-v8';
    try { if (sessionStorage.getItem(key)) return; } catch (_e) { return; }

    setActive(true);
    document.body.style.overflow = 'hidden';

    const t = setTimeout(() => {
      document.body.style.overflow = '';
      try { sessionStorage.setItem(key, '1'); } catch (_e) { /* */ }
      setActive(false);
    }, (TOTAL + 1) * 1000);

    return () => { clearTimeout(t); document.body.style.overflow = ''; };
  }, []);

  if (!active) return null;

  function skip() {
    document.body.style.overflow = '';
    try { sessionStorage.setItem('gi-v8', '1'); } catch (_e) { /* */ }
    setActive(false);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes piFade{0%{opacity:0;transform:translateY(16px)}12%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}
        @keyframes piOut{0%,88%{opacity:1}100%{opacity:0}}
        @keyframes piBar{from{width:0%}to{width:100%}}
        .pi-s{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;animation:piFade ${SCENE_DUR}s ease both}
      `}} />
      <div
        style={{ position:'fixed',inset:0,zIndex:9999,background:'#030306',animation:`piOut ${TOTAL}s ease forwards` }}
        onClick={skip}
      >
        {/* Letterbox */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:'6%',background:'#000',zIndex:2}} />
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'6%',background:'#000',zIndex:2}} />

        {/* Opening */}
        <div className="pi-s" style={{animationDelay:'0s'}}>
          <div style={{textAlign:'center',padding:'0 24px'}}>
            <p style={{fontSize:11,fontFamily:'monospace',letterSpacing:'0.5em',textTransform:'uppercase',color:'rgba(255,255,255,0.4)',marginBottom:24}}>Gameshop Enter</p>
            <h1 style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:300,color:'rgba(255,255,255,0.85)',margin:0}}>Een reis door</h1>
            <h1 style={{fontSize:'clamp(36px,7vw,72px)',fontWeight:900,background:'linear-gradient(to right,#34d399,#2dd4bf,#22d3ee)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'8px 0 0'}}>Nintendo geschiedenis</h1>
            <div style={{width:200,height:1,background:'linear-gradient(to right,transparent,rgba(16,185,129,0.5),transparent)',margin:'32px auto 0'}} />
          </div>
        </div>

        {/* Platforms */}
        {PLATFORMS.map((p, i) => (
          <div key={p.year} className="pi-s" style={{animationDelay:`${(i+1)*SCENE_DUR}s`}}>
            <div style={{textAlign:'center',padding:'0 24px'}}>
              <p style={{fontFamily:'monospace',fontSize:'clamp(48px,8vw,80px)',fontWeight:900,color:p.accent,opacity:0.2,margin:'0 0 16px'}}>{p.year}</p>
              <h2 style={{fontSize:'clamp(40px,7vw,80px)',fontWeight:900,color:'#fff',lineHeight:0.95,margin:'0 0 12px'}}>{p.name}</h2>
              <p style={{fontSize:'clamp(14px,2vw,18px)',color:'rgba(255,255,255,0.4)',margin:'0 0 48px'}}>{p.tagline}</p>
              <div style={{width:'clamp(176px,30vw,256px)',height:'clamp(176px,30vw,256px)',margin:'0 auto',borderRadius:16,overflow:'hidden',boxShadow:`0 30px 80px -15px rgba(0,0,0,0.8), 0 0 50px -10px ${p.accent}30`}}>
                <img src={p.cover} alt={p.name} width={256} height={256} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="eager" />
              </div>
            </div>
          </div>
        ))}

        {/* Finale */}
        <div className="pi-s" style={{animationDelay:`${5*SCENE_DUR}s`}}>
          <div style={{textAlign:'center'}}>
            <h2 style={{fontSize:'clamp(48px,8vw,96px)',fontWeight:900,color:'#fff',lineHeight:1,margin:0}}>Gameshop</h2>
            <h2 style={{fontSize:'clamp(48px,8vw,96px)',fontWeight:900,lineHeight:1,margin:0,background:'linear-gradient(to right,#34d399,#2dd4bf,#22d3ee)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Enter</h2>
            <p style={{fontSize:16,color:'rgba(255,255,255,0.4)',marginTop:24}}>De Pokémon specialist van Nederland</p>
          </div>
        </div>

        {/* Skip */}
        <button onClick={(e)=>{e.stopPropagation();skip()}} style={{position:'absolute',bottom:'10%',right:24,zIndex:3,padding:'8px 16px',fontSize:11,color:'rgba(255,255,255,0.3)',background:'none',border:'1px solid rgba(255,255,255,0.08)',borderRadius:999,cursor:'pointer'}}>
          Overslaan ▸▸
        </button>

        {/* Progress */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:3,background:'rgba(255,255,255,0.05)',zIndex:3}}>
          <div style={{height:'100%',background:'linear-gradient(to right,#34d399,#22d3ee)',animation:`piBar ${TOTAL}s linear forwards`}} />
        </div>
      </div>
    </>
  );
}
