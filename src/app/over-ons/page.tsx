'use client';

import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString('nl-NL')}{suffix}</span>;
}

function TiltCard({ children, className = '', gradient }: { children: React.ReactNode; className?: string; gradient: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 300, damping: 20 });
  const glowX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const glowY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 200, damping: 25 });
  const glowBg = useMotionTemplate`radial-gradient(300px circle at ${glowX}% ${glowY}%, rgba(16,185,129,0.08), transparent 70%)`;
  const [hovered, setHovered] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <div className="perspective-1000">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleLeave}
        style={{
          rotateX: hovered ? rotateX : 0,
          rotateY: hovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ y: -6, transition: { duration: 0.3 } }}
        className={`relative group ${className}`}
      >
        <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]`} />
        <div className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {hovered && (
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: glowBg }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
          {children}
        </div>
      </motion.div>
    </div>
  );
}

const timeline = [
  {
    year: '2018',
    title: 'De eerste stappen',
    description: 'Op mijn 14e begon ik met het verkopen van verzamelkaarten op Marktplaats. Pokemon-kaarten, Nintendo-kaarten - alles wat ik kon vinden. Wat begon als zakgeld verdienen, werd al snel een echte passie voor ondernemen.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    color: 'from-purple-500 to-violet-500',
  },
  {
    year: '2019',
    title: 'Leren door vallen en opstaan',
    description: 'Ik waagde me aan het verkopen van iPhones en PlayStation 5 consoles. Helaas werd ik meerdere keren opgelicht. Een harde les, maar het leerde me alles over vertrouwen, kwaliteitscontrole en het belang van eerlijk zakendoen.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    color: 'from-slate-500 to-slate-600',
  },
  {
    year: '2020',
    title: 'De overstap naar Pokemon games',
    description: 'Na de tegenslagen besloot ik terug te gaan naar mijn passie: Nintendo. Ik begon met het inkopen, testen en doorverkopen van originele Pokemon-games. De focus op kwaliteit en originaliteit maakte het verschil.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.421 48.421 0 01-4.185-.07c-.514-.058-.91-.465-.91-.982v-3.61c0-.553.45-1.003 1.003-1.003h.998c.553 0 1.003.45 1.003 1.003v1.464m-3.998-1.464H6a2.25 2.25 0 00-2.25 2.25v3.803a2.25 2.25 0 002.25 2.25h.008c.341 0 .648.213.762.535l.597 1.684a.75.75 0 001.416 0l.597-1.684a.798.798 0 01.762-.535H12m0 0c.341 0 .648.213.762.535l.597 1.684a.75.75 0 001.416 0l.597-1.684a.798.798 0 01.762-.535h.008A2.25 2.25 0 0018 11.053V7.25A2.25 2.25 0 0015.75 5h-.998" />
      </svg>
    ),
    color: 'from-amber-500 to-orange-500',
  },
  {
    year: '2022',
    title: 'Gameshop Enter is geboren',
    description: 'Van Pokemon-games groeide mijn assortiment naar de volledige Nintendo-sector. NES, Super Nintendo, Game Boy, GameCube, Wii, Nintendo Switch - het werd tijd voor een echte naam. Gameshop Enter was geboren.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-500',
  },
  {
    year: '2023',
    title: 'Studie en ondernemen',
    description: 'Ik startte met de studie Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Theorie en praktijk versterken elkaar: wat ik leer, pas ik direct toe bij Gameshop Enter.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    color: 'from-cyan-500 to-blue-500',
  },
  {
    year: '2024',
    title: '3000+ tevreden klanten',
    description: 'Een enorme mijlpaal: meer dan 3000 tevreden klanten en 1360+ reviews op Marktplaats met een perfecte 5.0 score. Het assortiment groeide naar 846+ producten over 12 Nintendo platforms.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    color: 'from-amber-400 to-yellow-500',
  },
  {
    year: '2025',
    title: 'Meer dan 846 producten online',
    description: 'Het assortiment groeide explosief naar 846+ producten over 12 Nintendo platforms. De nieuwe webshop ging live met professionele cover art, uitgebreide beschrijvingen en een volledig inkoopsysteem.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    color: 'from-teal-500 to-emerald-500',
  },
  {
    year: 'Nu',
    title: 'De Nintendo specialist van Nederland',
    description: 'Gameshop Enter is uitgegroeid tot de Nintendo specialist. Van retro klassiekers tot de nieuwste Switch-games - elke dag werk ik eraan om de beste ervaring te bieden aan elke Nintendo-liefhebber.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-4.52 1.772 6.003 6.003 0 01-4.52-1.772" />
      </svg>
    ),
    color: 'from-emerald-400 to-cyan-400',
  },
];

const values = [
  {
    title: 'Originaliteit',
    description: 'Uitsluitend 100% originele Nintendo producten. Geen reproducties, geen namaak. Elk product is persoonlijk gecontroleerd.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Transparantie',
    description: 'Elke productpagina vermeldt duidelijk de conditie en compleetheid. Je weet precies wat je koopt.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Kwaliteit',
    description: 'Elk product wordt persoonlijk getest op werking. Zorgvuldig verpakt en snel verzonden via PostNL.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Passie',
    description: 'Opgericht vanuit een persoonlijke liefde voor Nintendo. Dat merk je in alles wat we doen - van de selectie tot de service.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    gradient: 'from-rose-500 to-pink-500',
  },
];

const stats = [
  { value: 3000, suffix: '+', label: 'Tevreden klanten' },
  { value: 1360, suffix: '+', label: 'Reviews' },
  { value: 5, suffix: '.0', label: 'Marktplaats score' },
  { value: 846, suffix: '+', label: 'Producten' },
  { value: 12, suffix: '', label: 'Nintendo platforms' },
  { value: 7, suffix: '+', label: 'Jaar ervaring' },
];

const reviews = [
  {
    name: 'Mark V.',
    text: 'Super snelle levering en de game was precies zoals beschreven. Top service!',
    rating: 5,
    platform: 'Marktplaats',
    game: 'Pokemon HeartGold',
  },
  {
    name: 'Sophie K.',
    text: 'Eindelijk een betrouwbare webshop voor retro Nintendo games. Alles netjes getest en verpakt. Aanrader!',
    rating: 5,
    platform: 'Marktplaats',
    game: 'Super Mario 64',
  },
  {
    name: 'Thomas B.',
    text: 'Geweldige communicatie, snelle verzending en de game werkt perfect. Zeker vaker bestellen hier!',
    rating: 5,
    platform: 'Marktplaats',
    game: 'Zelda: Ocarina of Time',
  },
  {
    name: 'Lisa M.',
    text: 'Mijn zoon was super blij met zijn Pokemon-spel. Goed verpakt en snel geleverd. Dankjewel!',
    rating: 5,
    platform: 'Marktplaats',
    game: 'Pokemon Platinum',
  },
];

const processSteps = [
  {
    step: '01',
    title: 'Zorgvuldig inkopen & testen',
    description: 'Elk product wordt persoonlijk ingekocht en gecontroleerd op originaliteit. Daarna test ik elke game op werking - alleen producten die 100% functioneren gaan in de verkoop.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    step: '02',
    title: 'Professioneel verpakken',
    description: 'Elke bestelling wordt met zorg verpakt in stevig verpakkingsmateriaal. Games krijgen extra bescherming zodat ze in perfecte staat aankomen.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    step: '03',
    title: 'Snelle verzending via PostNL',
    description: 'Bestellingen worden dezelfde of volgende werkdag verzonden met PostNL. Track & trace zodat je precies weet wanneer je pakket aankomt.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
  },
];

export default function OverOnsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const missionRef = useRef<HTMLElement>(null);

  const heroMouse = useMotionValue(0.5);
  const heroMouseY = useMotionValue(0.5);
  const heroGlowX = useSpring(useTransform(heroMouse, [0, 1], [20, 80]), { stiffness: 50, damping: 20 });
  const heroGlowY = useSpring(useTransform(heroMouseY, [0, 1], [20, 80]), { stiffness: 50, damping: 20 });
  const heroGlow = useMotionTemplate`radial-gradient(600px circle at ${heroGlowX}% ${heroGlowY}%, rgba(16,185,129,0.12), transparent 60%)`;

  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ['start end', 'end start'],
  });
  const lineHeight = useTransform(timelineProgress, [0, 1], ['0%', '100%']);

  const { scrollYProgress: missionProgress } = useScroll({
    target: missionRef,
    offset: ['start end', 'end start'],
  });
  const missionScale = useTransform(missionProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  const handleHeroMove = useCallback((e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroMouse.set((e.clientX - rect.left) / rect.width);
    heroMouseY.set((e.clientY - rect.top) / rect.height);
  }, [heroMouse, heroMouseY]);

  return (
    <div className="pt-20 lg:pt-24">
      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-slate-500">
          <li><Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link></li>
          <li><svg className="h-3.5 w-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
          <li className="text-slate-700 font-medium">Over ons</li>
        </ol>
      </nav>

      {/* === IMMERSIVE HERO === */}
      <div
        ref={heroRef}
        onMouseMove={handleHeroMove}
        className="relative bg-[#050810] py-28 lg:py-40 overflow-hidden"
      >
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: heroGlow }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(8,145,178,0.08),transparent_50%)]" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[10%] right-[12%] opacity-[0.04]"
        >
          <svg width="200" height="200" viewBox="0 0 120 120" fill="none">
            <path d="M60 5 L108 30 L108 90 L60 115 L12 90 L12 30 Z" stroke="white" strokeWidth="0.5" />
          </svg>
        </motion.div>
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[25%] left-[6%] w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/[0.04] to-cyan-500/[0.02] border border-white/[0.04] rotate-12"
        />
        <motion.div
          animate={{ y: [0, 18, 0], x: [0, -8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[20%] right-[6%] w-14 h-14 rounded-full bg-emerald-500/[0.03] border border-emerald-500/[0.05]"
        />

        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full bg-emerald-400"
            style={{ top: `${10 + (i * 9) % 80}%`, left: `${5 + (i * 13) % 90}%` }}
            animate={{ opacity: [0, 0.5, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
          />
        ))}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-8"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ons verhaal
            </motion.span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.05]">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Van kaarten op Marktplaats
              </motion.span>
              <motion.span
                className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                tot Nintendo specialist
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Het eerlijke verhaal van Lenn Hodes: van tegenslagen en lessen tot de oprichting van Gameshop Enter.
            </motion.p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* === STATS BAR === */}
      <section className="relative bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 15 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="text-center group"
              >
                <div className="relative inline-block">
                  <div className="text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 tabular-nums">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/40 group-hover:w-12 transition-all duration-300" />
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === PERSONAL INTRO === */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3"
          >
            Hoi, ik ben Lenn
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-[3px] w-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-8 origin-left"
          />
          <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
            {[
              'Mijn naam is Lenn Hodes, oprichter van Gameshop Enter. In 2018, toen ik 14 was, begon ik met het verkopen van verzamelkaarten op Marktplaats. Het was mijn eerste stap in het ondernemerschap - en het begin van een reis met pieken en dalen.',
              <>Na de kaarten waagde ik me aan iPhones en PlayStation 5 consoles. Dat liep niet goed: ik werd meerdere keren opgelicht. Het waren harde lessen, maar ze hebben me gevormd tot de ondernemer die ik nu ben. Ik leerde het belang van <strong className="text-slate-900 font-bold">vertrouwen</strong>, <strong className="text-slate-900 font-bold">kwaliteitscontrole</strong> en <strong className="text-slate-900 font-bold">eerlijk zakendoen</strong>.</>,
              'Uiteindelijk keerde ik terug naar mijn echte passie: Nintendo. Ik begon met Pokemon-games en groeide van daaruit naar de volledige Nintendo-sector. Van klassieke NES- en Super Nintendo-titels tot de nieuwste Nintendo Switch-games, en van Game Boy tot GameCube-consoles. Elk product test ik persoonlijk op werking en verpak ik zorgvuldig.',
              'Naast Gameshop Enter studeer ik Ondernemerschap en Retailmanagement aan het Saxion in Enschede. Wat ik leer, pas ik direct toe in de praktijk. Die combinatie maakt mij niet alleen een betere ondernemer, maar ook een betere partner voor mijn klanten.',
            ].map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {text}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === HOE WIJ WERKEN (Process) === */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-widest mb-4">
              Werkwijze
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Van inkoop tot aan je deur
            </h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              Elk product doorloopt een zorgvuldig proces voordat het bij jou wordt bezorgd.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative bg-white rounded-2xl border border-slate-100 p-8 h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {/* Step number */}
                  <div className="absolute top-6 right-6 text-5xl font-extrabold text-slate-100 select-none leading-none">
                    {step.step}
                  </div>

                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white mb-6 shadow-lg`}>
                    {step.icon}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{step.description}</p>

                  {/* Connecting line on desktop */}
                  {i < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-slate-200" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === TIMELINE === */}
      <section ref={timelineRef} className="relative bg-[#050810] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)]" />

        {[
          { t: '15%', l: '10%', d: 4 },
          { t: '30%', l: '85%', d: 5 },
          { t: '50%', l: '5%', d: 3.5 },
          { t: '70%', l: '90%', d: 4.5 },
          { t: '85%', l: '15%', d: 5.5 },
          { t: '40%', l: '50%', d: 6 },
        ].map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
            style={{ top: p.t, left: p.l }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.6, 0.1], scale: [0.5, 1, 0.5] }}
            transition={{ duration: p.d, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Tijdlijn
            </span>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
              Mijn reis
            </h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto">
              Van de eerste kaart op Marktplaats tot Nintendo specialist - elk hoofdstuk heeft me gevormd.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-white/[0.06] lg:-translate-x-px" />
            <motion.div
              className="absolute left-6 lg:left-1/2 top-0 w-px bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 lg:-translate-x-px origin-top"
              style={{ height: lineHeight }}
            />

            <div className="space-y-16">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, rotateX: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1,
                    ease: [0.16, 1, 0.3, 1],
                    rotateX: { type: 'spring', stiffness: 100, damping: 15 },
                  }}
                  className={`relative flex items-start gap-8 lg:gap-0 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                  style={{ transformPerspective: 800 }}
                >
                  <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      whileInView={{ scale: [0, 1.3, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg ring-4 ring-[#050810]`}
                    >
                      {item.icon}
                    </motion.div>
                  </div>

                  <div className={`flex-1 ml-20 lg:ml-0 ${i % 2 === 0 ? 'lg:pr-20 lg:text-right' : 'lg:pl-20'}`}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-500 group"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white text-xs font-bold mb-3 shadow-lg`}>
                        {item.year}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors duration-300">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-sm">{item.description}</p>
                    </motion.div>
                  </div>

                  <div className="hidden lg:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === CINEMATIC MISSION === */}
      <section ref={missionRef} className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/30 to-white" />

        <div className="absolute top-[15%] left-[8%] text-[200px] font-serif text-emerald-500/[0.04] select-none leading-none">&ldquo;</div>
        <div className="absolute bottom-[15%] right-[8%] text-[200px] font-serif text-emerald-500/[0.04] select-none leading-none">&rdquo;</div>

        <motion.div
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ scale: missionScale }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
              className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 items-center justify-center text-white mb-8 shadow-xl shadow-emerald-500/25"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-widest mb-6"
            >
              Missie
            </motion.span>
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-2xl lg:text-4xl font-bold text-slate-900 leading-snug tracking-tight mb-6 max-w-3xl mx-auto"
            >
              &ldquo;Ik geloof dat retro gaming meer is dan nostalgie. Het is een manier om tijdloze klassiekers te bewaren en te delen met de volgende generatie gamers.&rdquo;
            </motion.blockquote>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto"
            >
              Mijn missie is om elke Nintendo-liefhebber toegang te geven tot originele, geteste producten tegen eerlijke prijzen, met de persoonlijke service die je verdient.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent mt-8 mb-4"
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 }}
              className="text-sm text-slate-400 font-medium"
            >
              — Lenn Hodes, oprichter Gameshop Enter
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* === VALUES === */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-slate-200/60 text-slate-600 text-xs font-semibold uppercase tracking-widest mb-4">
              Kernwaarden
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Waar wij voor staan
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, rotateX: -5 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformPerspective: 800 }}
              >
                <TiltCard gradient={value.gradient}>
                  <div className="p-8">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white mb-5 shadow-lg`}>
                      {value.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{value.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{value.description}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === KLANTREVIEWS (Social Proof) === */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold uppercase tracking-widest mb-4">
              Reviews
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Wat klanten zeggen
            </h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              Meer dan 1360 reviews met een perfecte 5.0 score op Marktplaats
            </p>
          </motion.div>

          {/* Review Highlight Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-10"
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="h-6 w-px bg-amber-200" />
              <span className="text-sm font-bold text-amber-800">5.0 / 5.0</span>
              <span className="text-sm text-amber-600">op Marktplaats</span>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <svg key={j} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-4">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                      <p className="text-xs text-slate-400">{review.game}</p>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{review.platform}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === TRUST PARTNERS === */}
      <section className="bg-slate-50 py-12 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Vertrouwd door</p>
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-14">
              {/* iDEAL */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#CC0066" strokeWidth="1.5" />
                    <path d="M8 12h8M12 8v8" stroke="#CC0066" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-500">iDEAL</span>
              </motion.div>

              {/* Mollie */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="6" width="18" height="12" rx="2" stroke="#0A0A0A" strokeWidth="1.5" />
                    <path d="M3 10h18" stroke="#0A0A0A" strokeWidth="1.5" />
                    <rect x="6" y="14" width="4" height="1.5" rx="0.75" fill="#0A0A0A" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-500">Mollie</span>
              </motion.div>

              {/* PostNL */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" stroke="#FF6600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-500">PostNL</span>
              </motion.div>

              {/* SSL */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-500">SSL beveiligd</span>
              </motion.div>

              {/* KvK */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-500">KvK geregistreerd</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === BUSINESS DETAILS === */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-500 p-8 lg:p-12"
        >
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Bedrijfsgegevens</h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-5">
            {[
              ['Bedrijfsnaam', 'Gameshop Enter'],
              ['Eigenaar', 'Lenn Hodes'],
              ['KvK-nummer', '93642474'],
              ['Actief sinds', '2018'],
              ['Specialisatie', 'Originele Nintendo games en consoles'],
              ['Platforms', '12 Nintendo platforms'],
            ].map(([label, value], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</dt>
                <dd className="text-slate-900 font-medium">{value}</dd>
              </motion.div>
            ))}
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">E-mail</dt>
              <dd><a href="mailto:gameshopenter@gmail.com" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">gameshopenter@gmail.com</a></dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Webshop</dt>
              <dd className="text-slate-900 font-medium">Uitsluitend online — geen afhalen</dd>
            </div>
          </div>

          <div className="mt-10 p-5 bg-amber-50 border border-amber-200/60 rounded-2xl">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-amber-800 font-medium">
                Gameshop Enter is een uitsluitend online webshop. Afhalen is niet mogelijk. Alle bestellingen worden verzonden via PostNL.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === EPIC CTA met nieuwsbrief === */}
      <section className="relative bg-[#050810] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_60%)]" />

        <motion.div
          animate={{ y: [0, -15, 0], rotate: [12, 18, 12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-[18%] w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.04] rotate-12"
        />
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [-8, -14, -8] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-16 left-[12%] w-16 h-16 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/[0.05] -rotate-12"
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
              Klaar om te shoppen?
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
              Ontdek ons complete assortiment van meer dan 846 originele Nintendo producten. Schrijf je in voor de nieuwsbrief en ontvang 10% korting op je eerste bestelling.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/shop">
                <Button size="lg">
                  Bekijk alle producten
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 text-base font-semibold rounded-xl border-2 border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                  Neem contact op
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
