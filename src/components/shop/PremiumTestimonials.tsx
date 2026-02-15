'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  verified?: boolean;
}

interface PremiumTestimonialsProps {
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Jan de Vries',
    role: 'Pokémon Collector',
    avatar: 'J',
    rating: 5,
    text: 'De kwaliteit van de games en de service is ongeëvenaard. Ik heb al meerdere keren besteld en ben altijd tevreden!',
    verified: true,
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Retro Gaming Enthusiast',
    avatar: 'M',
    rating: 5,
    text: 'Geweldige website met een uitstekende selectie. De beschrijvingen zijn nauwkeurig en verzending gaat snel.',
    verified: true,
  },
  {
    id: '3',
    name: 'Peter Klein',
    role: 'Nintendo Fan',
    avatar: 'P',
    rating: 5,
    text: 'Dit is mijn go-to plek voor originele Nintendo games. Altijd origineel, altijd in prima staat!',
    verified: true,
  },
  {
    id: '4',
    name: 'Lisa Müller',
    role: 'Spellenverza melaar',
    avatar: 'L',
    rating: 5,
    text: 'Ongelooflijke selectie en geweldige prijzen. De productfoto\'s zijn echt professioneel, je weet precies wat je krijgt.',
    verified: true,
  },
];

export default function PremiumTestimonials({
  testimonials = defaultTestimonials,
}: PremiumTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Wat onze klanten zeggen
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Duizenden tevreden klanten vertrouwen ons voor originele Nintendo games
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 p-8 lg:p-12"
        >
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-6"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-3xl flex-shrink-0">
              {testimonials[activeIndex].avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {testimonials[activeIndex].name}
                </h3>
                {testimonials[activeIndex].verified && (
                  <svg className="h-5 w-5 fill-emerald-500" viewBox="0 0 24 24">
                    <path d="M10.293 15.707a1 1 0 001.414 0L19.414 8.196a1 1 0 00-1.414-1.414L11 13.586 7.707 10.293a1 1 0 00-1.414 1.414l4 4z" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {testimonials[activeIndex].role}
              </p>
              <p className="text-lg text-slate-800 dark:text-slate-200 mb-4">
                "{testimonials[activeIndex].text}"
              </p>
              <div className="flex items-center gap-1">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? 'bg-emerald-500 w-8'
                    : 'bg-slate-300 dark:bg-slate-700 w-2.5'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
