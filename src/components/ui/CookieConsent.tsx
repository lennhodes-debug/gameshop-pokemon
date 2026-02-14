'use client';

import { useState, useEffect } from 'react';

const COOKIE_KEY = 'gameshop-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1100] p-4 animate-[slideUp_0.4s_ease]">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl shadow-black/15 border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">Cookies & Privacy</span>{' '}
            — We gebruiken functionele cookies voor je winkelwagen en chatgeschiedenis.
            Geen tracking, geen advertenties.{' '}
            <a href="/privacybeleid" className="text-emerald-600 hover:underline font-medium">
              Privacybeleid
            </a>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            Weigeren
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            Akkoord
          </button>
        </div>
      </div>
    </div>
  );
}
