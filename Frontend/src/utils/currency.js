export const USD_TO_INR = 83.5;

export function toINR(usd) {
  return Math.round(usd * USD_TO_INR);
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function priceINR(usdPrice) {
  return formatINR(toINR(usdPrice));
}
