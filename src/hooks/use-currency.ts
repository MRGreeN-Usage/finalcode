'use client';

import { usePreferences } from "@/firebase";
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
    const symbol = currencySymbols[currency];

    const format = (value: number) => {
        return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    const formatShort = (value: number) => {
        if (value >= 1000000) {
            return `${symbol}${(value / 1000000).toFixed(1)}m`;
        }
        if (value >= 1000) {
            return `${symbol}${(value / 1000).toFixed(1)}k`;
        }
        return format(value);
    }

    return { currency, symbol, format, formatShort };
}
