import { useLocale } from 'next-intl';

export function useFormatters() {
  const locale = useLocale();

  const formatCurrency = (value: number | undefined, options?: Intl.NumberFormatOptions) => {
    if (value === undefined || value === 0) return '-';
    
    const formatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options
    };

    return new Intl.NumberFormat(locale, formatOptions).format(value);
  };

  const formatPercentage = (value: number | undefined, decimals = 2) => {
    if (value === undefined || value === 0) return '-';
    return `${value.toFixed(decimals)}%`;
  };

  const formatNumber = (value: number | undefined, options?: Intl.NumberFormatOptions) => {
    if (value === undefined || value === 0) return '-';
    
    return new Intl.NumberFormat(locale, options).format(value);
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  };

  return {
    formatCurrency,
    formatPercentage,
    formatNumber,
    formatDate,
    locale
  };
}

// Static formatters for server-side usage
export function formatCurrencyStatic(value: number | undefined, locale = 'en-US') {
  if (value === undefined || value === 0) return '-';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumberStatic(value: number | undefined, locale = 'en-US', options?: Intl.NumberFormatOptions) {
  if (value === undefined || value === 0) return '-';
  
  return new Intl.NumberFormat(locale, options).format(value);
}