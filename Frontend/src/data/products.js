/* data/products.js — Mock luxury product catalogue
   Replace with real API calls once backend is ready */

export const BRANDS = ['All', 'Louis Vuitton', 'Chanel', 'Hermès', 'Rolex', 'Gucci', 'Prada'];

export const CATEGORIES = ['All', 'Handbags', 'Watches', 'Jewellery', 'Shoes', 'Accessories'];

/* Using Unsplash placeholder images — swap with real product photos */
export const PRODUCTS = [
  {
    id: 1,
    name: 'Neverfull MM Tote',
    brand: 'Louis Vuitton',
    category: 'Handbags',
    price: 1860,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    description: 'The iconic Neverfull MM in Monogram canvas. Spacious, elegant, and timeless. Comes with certificate of authenticity.',
    featured: true,
  },
  {
    id: 2,
    name: 'Classic Flap Bag',
    brand: 'Chanel',
    category: 'Handbags',
    price: 9800,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    description: 'The Chanel Classic Flap in lambskin leather with gold-tone hardware. A true investment piece.',
    featured: true,
  },
  {
    id: 3,
    name: 'Birkin 30',
    brand: 'Hermès',
    category: 'Handbags',
    price: 24000,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80',
    description: 'The Hermès Birkin 30 in Togo leather. The pinnacle of luxury craftsmanship.',
    featured: true,
  },
  {
    id: 4,
    name: 'Submariner Date',
    brand: 'Rolex',
    category: 'Watches',
    price: 14500,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
    description: 'The Rolex Submariner Date in Oystersteel. Water-resistant to 300m. Includes original box and papers.',
    featured: true,
  },
  {
    id: 5,
    name: 'GG Marmont Shoulder Bag',
    brand: 'Gucci',
    category: 'Handbags',
    price: 1450,
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80',
    description: 'Gucci GG Marmont small shoulder bag in matelassé chevron leather.',
    featured: false,
  },
  {
    id: 6,
    name: 'Saffiano Leather Tote',
    brand: 'Prada',
    category: 'Handbags',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
    description: 'Prada Saffiano leather tote with gold-tone hardware and interior zip pocket.',
    featured: false,
  },
  {
    id: 7,
    name: 'Datejust 41',
    brand: 'Rolex',
    category: 'Watches',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80',
    description: 'Rolex Datejust 41 in Oystersteel and yellow gold with fluted bezel.',
    featured: false,
  },
  {
    id: 8,
    name: 'Kelly 28',
    brand: 'Hermès',
    category: 'Handbags',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    description: 'The Hermès Kelly 28 in Epsom leather with palladium hardware.',
    featured: false,
  },
];
