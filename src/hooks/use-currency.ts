'use client';

import { usePreferences } from "@/firebase/firestore/use-preferences";
import type { Currency } from "@/lib/types";

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
};

export const useCurrency = () => {
    const { preferences } = usePreferences();
    const currency = preferences?.currency || 'USD';
    const symbol = currencySymbols[currency] || '$';

    const format = (value: number) => {
        // Fallback to 0 if value is not a number
        const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        return `${symbol}${numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    const formatShort = (value: number) => {
        const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        if (numericValue >= 1000000) {
            return `${symbol}${(numericValue / 1000000).toFixed(1)}m`;
        }
        if (numericValue >= 1000) {
            return `${symbol}${(numericValue / 1000).toFixed(1)}k`;
        }
        return `${symbol}${numericValue.toFixed(0)}`;
    }

    return { currency, symbol, format, formatShort };
}
