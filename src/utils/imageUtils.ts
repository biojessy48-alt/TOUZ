import React from 'react';

export const RELIABLE_FALLBACK_IMAGES = {
  green: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
  brown: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800',
  orange: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&q=80&w=800',
  yellow: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
  default: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
  hero: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&q=80&w=1200',
  model: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000'
};

export function getFallbackForProduct(productId?: string, colorHex?: string): string {
  if (productId?.includes('brown') || colorHex === '#6e473b') {
    return RELIABLE_FALLBACK_IMAGES.brown;
  }
  if (productId?.includes('orange') || colorHex === '#d95a2b') {
    return RELIABLE_FALLBACK_IMAGES.orange;
  }
  if (productId?.includes('yellow') || colorHex === '#d4a32a') {
    return RELIABLE_FALLBACK_IMAGES.yellow;
  }
  return RELIABLE_FALLBACK_IMAGES.green;
}

export function handleProductImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  productId?: string,
  colorHex?: string
) {
  const target = e.currentTarget;
  const fallback = getFallbackForProduct(productId, colorHex);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
