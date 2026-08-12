import { Product } from '../types';

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&q=80&w=1200';

export const PRODUCTS: Product[] = [
  {
    id: 'touza-summer-striped-shirt-green',
    name: 'TOUZA Summer Striped Shirt — Green',
    nameAr: 'قميص TOUZA الصيفي المخطط – أخضر',
    subtitle: 'TOUZA — SHIRT / GREEN STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط أخضر',
    category: 'Shirts',
    categoryAr: 'قمصان',
    price: 850.00,
    originalPrice: 1100.00,
    description: 'A relaxed-fit casual shirt crafted from breathable waffle-textured cotton, perfect for warm days. Featuring vertical green and black stripes on a soft beige base, a classic collar, and mother-of-pearl buttons. An easy, everyday piece that brings effortless style to any casual look.',
    descriptionAr: 'قميص كاجوال بقصة واسعة ومريحة، بخامة قطنية منسوجة بنسيج الوافل المموج تديله ملمس صيفي خفيف وتهوية ممتازة. خطوط رأسية باللون الأخضر والأسود على أرضية بيج فاتحة، بياقة كلاسيكية وأزرار من الصدف. القميص من التصاميم اللي تلبسها يومياً بإحساس أنيق من غير تكلف، مناسب للخروجات الصيفية والإطلالة الكاجوال الرايقة.',
    details: [
      '100% Breathable Waffle-Textured Cotton',
      'Relaxed Casual Fit',
      'Vertical Green & Black Stripe Design',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature'
    ],
    detailsAr: [
      '100% قطن نسيج الوافل المموج عالي الجودة',
      'قصة كاجوال واسعة ومريحة',
      'خطوط رأسية باللون الأخضر والأسود على أرضية بيج فاتحة',
      'ياقة كلاسيكية بأزرار صدف طبيعية',
      'صنع في مصر - توزا'
    ],
    colors: [
      { name: 'Green Stripe', nameAr: 'أخضر مخطط', hex: '#2e5a44', imageUrl: '/images/touza_green_shirt.jpg' }
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ],
    images: [
      '/images/touza_green_shirt.jpg'
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 'touza-summer-striped-shirt-brown',
    name: 'TOUZA Summer Striped Shirt — Brown',
    nameAr: 'قميص TOUZA الصيفي المخطط – بني',
    subtitle: 'TOUZA — SHIRT / BROWN STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط بني',
    category: 'Shirts',
    categoryAr: 'قمصان',
    price: 850.00,
    originalPrice: 1100.00,
    description: 'An oversized casual shirt in soft waffle-knit cotton, featuring fine brown and black stripes on a warm beige base. Finished with a classic collar and mother-of-pearl buttons. A timeless, earthy-toned piece that works beautifully for both day and evening casual styling.',
    descriptionAr: 'قميص كاجوال بقصة أوفرايز مريحة، من قماش الوافل القطني الناعم، بلاحظ خيط رفيعة بني وأسود على خلفية بيج هادية تديله إحساس ترابي دافئ. بياقة كلاسيكية وأزرار صدف أنيقة. اختيار مثالي لمحبي الألوان الهادئة والإطلالة الكاجوال الراقية اللي تناسب النهار والمساء على حد سواء.',
    details: [
      '100% Soft Waffle-Knit Cotton',
      'Oversized Comfortable Cut',
      'Fine Brown & Black Stripes on Beige Base',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature'
    ],
    detailsAr: [
      '100% قماش الوافل القطني الناعم',
      'قصة أوفرايز كاجوال مريحة',
      'خطوط رفيعة باللون البني والأسود على خلفية بيج دافئة',
      'ياقة كلاسيكية بأزرار صدف أنيقة',
      'صنع في مصر - توزا'
    ],
    colors: [
      { name: 'Brown Stripe', nameAr: 'بني مخطط', hex: '#6e473b', imageUrl: '/images/touza_brown_shirt.jpg' }
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ],
    images: [
      '/images/touza_brown_shirt.jpg'
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 'touza-summer-striped-shirt-orange',
    name: 'TOUZA Summer Striped Shirt — Orange',
    nameAr: 'قميص TOUZA الصيفي المخطط – برتقالي',
    subtitle: 'TOUZA — SHIRT / ORANGE STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط برتقالي',
    category: 'Shirts',
    categoryAr: 'قمصان',
    price: 850.00,
    originalPrice: 1100.00,
    description: 'A modern, relaxed-fit shirt in lightweight waffle cotton, featuring coral-orange and black stripes on a soft beige base. Classic collar with mother-of-pearl buttons. A standout color choice for an effortlessly stylish, casual summer look.',
    descriptionAr: 'قميص كاجوال بقصة واسعة عصرية، من خامة الوافل القطنية اللي بتدي إحساس صيفي خفيف. خطوط برتقالي مرجاني وأسود على أرضية بيج فاتحة، بياقة كلاسيكية وأزرار صدف. لمسة لون مميزة تكسر الروتين وتديك إطلالة كاجوال شيك بدون مجهود، مثالية لأيام الصيف والخروجات النهارية.',
    details: [
      'Lightweight Waffle Cotton Fabric',
      'Modern Relaxed Summer Fit',
      'Vibrant Coral-Orange & Black Stripes',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature'
    ],
    detailsAr: [
      'خامة الوافل القطنية خفيفة الوزن',
      'قصة واسعة عصرية ومناسبة للصيف',
      'خطوط برتقالي مرجاني وأسود مميزة',
      'ياقة كلاسيكية بأزرار صدف فاخرة',
      'صنع في مصر - توزا'
    ],
    colors: [
      { name: 'Orange Stripe', nameAr: 'برتقالي مخطط', hex: '#d95a2b', imageUrl: '/images/touza_orange_shirt.jpg' }
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ],
    images: [
      '/images/touza_orange_shirt.jpg'
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 'touza-summer-striped-shirt-yellow',
    name: 'TOUZA Summer Striped Shirt — Yellow',
    nameAr: 'قميص TOUZA الصيفي المخطط – أصفر',
    subtitle: 'TOUZA — SHIRT / YELLOW STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط أصفر',
    category: 'Shirts',
    categoryAr: 'قمصان',
    price: 850.00,
    originalPrice: 1100.00,
    description: 'A relaxed-fit casual shirt in lightweight waffle cotton, featuring fine yellow and black stripes on a beige base for a bright summer energy. Classic collar and mother-of-pearl buttons complete the look. Perfect for those who love bold, warm tones in an easygoing casual style.',
    descriptionAr: 'قميص كاجوال بقصة واسعة مريحة، من قماش الوافل القطني الخفيف. خطوط رفيعة صفراء وسوداء على خلفية بيج فاتحة تديله طاقة صيفية مشرقة. بياقة كلاسيكية وأزرار صدف أنيقة. اختيار مثالي لمحي الألوان الدافئة الجريئة والإطلالة الكاجوال المفعمة بالحيوية.',
    details: [
      'Lightweight Waffle Cotton Fabric',
      'Relaxed Fit with Summer Energy',
      'Fine Yellow & Black Stripes on Beige Base',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature'
    ],
    detailsAr: [
      'قماش الوافل القطني الخفيف والبارد',
      'قصة واسعة مريحة تمنح طاقة صيفية',
      'خطوط رفيعة صفراء وسوداء على بيج فاتح',
      'ياقة كلاسيكية وأزرار صدف متقنة',
      'صنع في مصر - توزا'
    ],
    colors: [
      { name: 'Yellow Stripe', nameAr: 'أصفر مخطط', hex: '#d4a32a', imageUrl: '/images/touza_yellow_shirt.jpg' }
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ],
    images: [
      '/images/touza_yellow_shirt.jpg'
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 'touza-summer-striped-shirt-black',
    name: 'TOUZA Summer Striped Shirt — Black',
    nameAr: 'قميص TOUZA الصيفي المخطط – أسود',
    subtitle: 'TOUZA — SHIRT / BLACK STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط أسود',
    category: 'Shirts',
    categoryAr: 'قمصان',
    price: 850.00,
    originalPrice: 1100.00,
    description: 'A classic black-striped casual shirt in soft waffle cotton, offering a modern aesthetic with classic refinement.',
    descriptionAr: 'قميص كاجوال باللون الأسود المخطط من نسيج الوافل القطني المريح، قصة عصرية تناسب الإطلالات الليلية والنهارية.',
    details: [
      '100% Waffle Cotton',
      'Modern Relaxed Fit',
      'Black & Off-White Stripes',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature'
    ],
    detailsAr: [
      '100% قطن نسيج الوافل',
      'قصة عصرية واسعة ومريحة',
      'خطوط سوداء وأوف وايت راقية',
      'ياقة كلاسيكية بأزرار صدف طبيعية',
      'صنع في مصر - توزا'
    ],
    colors: [
      { name: 'Black Stripe', nameAr: 'أسود مخطط', hex: '#1e1e1e', imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800' }
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: false,
    isFeatured: true
  },
  {
    id: 'touza-summer-striped-shirt-navy',
    name: 'TOUZA Summer Striped Shirt — Navy',
    nameAr: 'قميص TOUZA الصيفي المخطط – كحلي',
    subtitle: 'TOUZA — SHIRT / NAVY STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط كحلي',
    category: 'Shirts',
    categoryAr: 'قمصان',
    price: 850.00,
    originalPrice: 1100.00,
    description: 'A deep navy striped casual shirt in breathable waffle cotton, perfect for a smart-casual wardrobe.',
    descriptionAr: 'قميص كاجوال مخطط باللون الكحلي الداكن من خامة القطن الصيفي الخفيف، مثالي للإطلالات الرسمية الخفيفة والكاجوال.',
    details: [
      '100% Breathable Waffle Cotton',
      'Navy & Beige Stripes',
      'Classic Cut',
      'Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature'
    ],
    detailsAr: [
      '100% قطن مريح ومُهوى',
      'خطوط كحلي وبيج راقية',
      'قصة كلاسيكية أنيقة',
      'أزرار صدف فاخرة',
      'صنع في مصر - توزا'
    ],
    colors: [
      { name: 'Navy Stripe', nameAr: 'كحلي مخطط', hex: '#1b2a4a', imageUrl: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&q=80&w=800' }
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: false,
    isFeatured: true
  },
  {
    id: 'touza-pure-linen-shirt-white',
    name: 'TOUZA Pure Linen Shirt — White',
    nameAr: 'قميص TOUZA الكتان الصافي – أبيض',
    subtitle: 'TOUZA — LINEN / WHITE',
    subtitleAr: 'توزا — قميص كتان أبيض',
    category: 'Shirts',
    categoryAr: 'قمصان',
    price: 950.00,
    originalPrice: 1250.00,
    description: 'An essential pure white linen shirt crafted for maximum summer comfort and sophisticated minimalist style.',
    descriptionAr: 'قميص كتان أبيض صافي وفاخر، مصمم ليمنحك أعلى مستويات الراحة والانتعاش في الصيف مع مظهر كلاسيكي ملكي.',
    details: [
      '100% Premium Egyptian Linen',
      'Pure White Finish',
      'Relaxed Summer Silhouette',
      'Made in Egypt — TOUZA Signature'
    ],
    detailsAr: [
      '100% كتان مصري فاخر',
      'لون أبيض صافي ناصع',
      'قصة صيفية مريحة أنيقة',
      'صنع في مصر - توزا'
    ],
    colors: [
      { name: 'Pure White', nameAr: 'أبيض صافي', hex: '#ffffff', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800' }
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isFeatured: true
  },
  {
    id: 'touza-pure-linen-shirt-beige',
    name: 'TOUZA Pure Linen Shirt — Beige',
    nameAr: 'قميص TOUZA الكتان الصافي – بيج',
    subtitle: 'TOUZA — LINEN / BEIGE',
    subtitleAr: 'توزا — قميص كتان بيج',
    category: 'Shirts',
    categoryAr: 'قمصان',
    price: 950.00,
    originalPrice: 1250.00,
    description: 'A warm beige pure linen shirt with an effortless relaxed draped fit, perfect for coastal escapes.',
    descriptionAr: 'قميص كتان صافي باللون البيج الدافئ، قصة مريحة بلمسة فخمة تليق بالأجواء الصيفية والساحلية.',
    details: [
      '100% Premium Natural Linen',
      'Warm Sandy Beige',
      'Breathable Comfort',
      'Made in Egypt — TOUZA Signature'
    ],
    detailsAr: [
      '100% كتان طبيعي فاخر',
      'لون بيج رملي دافئ',
      'تهوية ممتازة خفيفة الوزن',
      'صنع في مصر - توزا'
    ],
    colors: [
      { name: 'Warm Beige', nameAr: 'بيج دافئ', hex: '#d2b48c', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800' }
    ],
    sizes: [
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800'
    ],
    isNewArrival: true,
    isFeatured: true
  }
];

export function getLocalizedProductName(product: Product, lang: 'ar' | 'en'): string {
  if (lang === 'ar' && product.nameAr) return product.nameAr;
  return product.name;
}

export function getLocalizedProductSubtitle(product: Product, lang: 'ar' | 'en'): string {
  if (lang === 'ar' && product.subtitleAr) return product.subtitleAr;
  return product.subtitle || '';
}

export function getLocalizedProductCategory(product: Product, lang: 'ar' | 'en'): string {
  if (lang === 'ar' && product.categoryAr) return product.categoryAr;
  return product.category;
}

export function getLocalizedProductDescription(product: Product, lang: 'ar' | 'en'): string {
  if (lang === 'ar' && product.descriptionAr) return product.descriptionAr;
  return product.description;
}

export function getLocalizedProductDetails(product: Product, lang: 'ar' | 'en'): string[] {
  if (lang === 'ar' && product.detailsAr) return product.detailsAr;
  return product.details || [];
}
