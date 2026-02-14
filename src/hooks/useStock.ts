'use client';

import { useState, useEffect } from 'react';

let stockCache: Record<string, number> | null = null;
let fetchPromise: Promise<Record<string, number>> | null = null;

async function fetchStock(): Promise<Record<string, number>> {
  if (stockCache) return stockCache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/admin/stock')
    .then(res => res.ok ? res.json() : {})
    .then(data => {
      stockCache = data;
      // Cache 30 seconden verversen
      setTimeout(() => { stockCache = null; fetchPromise = null; }, 30000);
      return data;
    })
    .catch(() => ({}));

  return fetchPromise;
}

export function useStock(sku?: string): { stock: number; loading: boolean } {
  const [stock, setStock] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock().then(data => {
      if (sku) {
        setStock(data[sku] ?? 1);
      }
      setLoading(false);
    });
  }, [sku]);

  return { stock, loading };
}

export function useStockMap(): { stockMap: Record<string, number>; loading: boolean } {
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock().then(data => {
      setStockMap(data);
      setLoading(false);
    });
  }, []);

  return { stockMap, loading };
}
