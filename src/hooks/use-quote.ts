import { useState, useEffect, useCallback } from "react";

export interface Quote {
  text: string;
  author: string;
}

export const FALLBACK_QUOTES: Quote[] = [
  { text: "What you carry does not have to carry you.", author: "Unknown" },
  { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "Be gentle with yourself. You are a child of the universe.", author: "Max Ehrmann" },
  { text: "Sometimes the bravest and most important thing you can do is ask for help.", author: "Unknown" },
  { text: "What lies behind us and what lies before us are small matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Healing is not linear.", author: "Unknown" },
  { text: "Vulnerability is not weakness. It's our greatest measure of courage.", author: "Brené Brown" },
  { text: "You are not the darkness you endured. You are the light that refused to surrender.", author: "John Mark Green" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The present moment always will have been.", author: "Unknown" },
  { text: "You don't have to be positive all the time. It's perfectly okay to feel what you feel.", author: "Lori Deschene" },
];

const DAILY_QUOTE_KEY = "echo_daily_quote";

/** Returns the current local date as YYYY-MM-DD. */
function localDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchFromAPI(): Promise<Quote> {
  const res = await fetch("https://zenquotes.io/api/random", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]?.q) throw new Error("Invalid response");
  return { text: data[0].q, author: data[0].a };
}

function randomFallback(): Quote {
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

export async function fetchRandomQuote(): Promise<Quote> {
  try {
    return await fetchFromAPI();
  } catch {
    return randomFallback();
  }
}

/** Returns a stable quote for the day, cached in localStorage. */
export function useDailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = localDateString();
    try {
      const stored = localStorage.getItem(DAILY_QUOTE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { date: string; quote: Quote };
        if (parsed.date === today && parsed.quote?.text) {
          setQuote(parsed.quote);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore parse errors
    }

    fetchRandomQuote()
      .then((q) => {
        const date = localDateString();
        try {
          localStorage.setItem(DAILY_QUOTE_KEY, JSON.stringify({ date, quote: q }));
        } catch {
          // ignore storage errors (private browsing, full storage, etc.)
        }
        setQuote(q);
        setLoading(false);
      })
      .catch(() => {
        setQuote(randomFallback());
        setLoading(false);
      });
  }, []);

  return { quote, loading };
}

/** Returns a random quote with a `refresh` callback to load a new one. */
export function useRandomQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const q = await fetchRandomQuote();
    setQuote(q);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { quote, loading, refresh };
}
