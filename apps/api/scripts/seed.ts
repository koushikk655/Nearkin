/**
 * Dev seed — Guwahati.
 *
 * Inserts a handful of approved, open sellers (with products + business
 * hours) clustered within ~2 km of central Guwahati so the mobile
 * Discover feed has something to show. Run after migrations:
 *
 *   pnpm --filter @nearfold/api db:seed
 *
 * Idempotent: every row uses a deterministic UUID (sha1 of a stable name),
 * so re-running does nothing rather than duplicating. The PostGIS
 * shop_location column is filled automatically by the
 * seller_profiles_sync_location trigger from shop_lat/shop_lng.
 *
 * In the iOS Simulator set Features → Location → Custom Location to
 * 26.1445, 91.7362 so these sellers fall inside delivery range.
 */

import { createHash } from 'node:crypto';

import { db, pool } from '../src/db/client.js';
import {
  products,
  sellerBusinessHours,
  sellerProfiles,
  users,
} from '../src/db/schema.js';

// Guwahati city centre — point the simulator here.
const CENTER = { lat: 26.1445, lng: 91.7362 };

/** Deterministic UUID (v5-shaped) so seed rows are stable across runs. */
function detUuid(name: string): string {
  const h = createHash('sha1').update(`nearfold-seed:${name}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** Stable placeholder image (Lorem Picsum always resolves). Swap for real
 *  Cloudinary URLs once sellers upload. */
function img(seed: string): string {
  return `https://picsum.photos/seed/nf-${seed}/800/800`;
}

interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  price: number; // paise
  isCustomOrder?: boolean;
  leadTimeHours?: number;
}

interface SeedSeller {
  slug: string;
  shopName: string;
  shopDescription: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  minOrderAmount: number; // paise
  avgDeliveryMinutes: number;
  rating: string; // numeric(3,2)
  totalOrders: number;
  products: SeedProduct[];
}

const SELLERS: SeedSeller[] = [
  {
    slug: 'bharali-tiffins',
    shopName: 'Bharali Tiffins',
    shopDescription: 'Home-style Assamese thalis, cooked fresh and delivered hot. Run by Mamoni from her Zoo Road kitchen.',
    category: 'Tiffin',
    lat: 26.1488,
    lng: 91.7405,
    address: 'Zoo Road Tiniali, Guwahati',
    minOrderAmount: 9000,
    avgDeliveryMinutes: 45,
    rating: '4.7',
    totalOrders: 212,
    products: [
      { slug: 'veg-thali', name: 'Assamese Veg Thali', description: 'Rice, dal, aloo pitika, bhaji, khar, and tomato tenga.', price: 12000 },
      { slug: 'fish-meal', name: 'Masor Tenga Meal', description: 'Tangy fish curry with rice and seasonal greens.', price: 19000 },
      { slug: 'dal-bhat', name: 'Dal Bhat Combo', description: 'Comfort plate — dal, rice, aloo bhaji, pickle.', price: 9000 },
      { slug: 'khar-rice', name: 'Khar & Rice', description: 'Traditional Assamese khar with raw papaya and rice.', price: 11000 },
      { slug: 'egg-curry-meal', name: 'Egg Curry Meal', description: 'Double-egg curry, rice, and dal.', price: 13000 },
    ],
  },
  {
    slug: 'annapurna-bakes',
    shopName: 'Maa Annapurna Bakes',
    shopDescription: 'A tiny home bakery in Silpukhuri. Everything baked the morning you order it.',
    category: 'Bakery',
    lat: 26.1402,
    lng: 91.7320,
    address: 'Silpukhuri, Guwahati',
    minOrderAmount: 6000,
    avgDeliveryMinutes: 60,
    rating: '4.5',
    totalOrders: 138,
    products: [
      { slug: 'pineapple-pastry', name: 'Pineapple Pastry', description: 'Soft sponge, fresh cream, pineapple compote.', price: 6000 },
      { slug: 'cream-bun', name: 'Cream Bun (2 pc)', description: 'Old-school cream-filled buns.', price: 5000 },
      { slug: 'veg-patties', name: 'Veg Patties (2 pc)', description: 'Flaky puff pastry with spiced veg filling.', price: 4000 },
      { slug: 'brownie', name: 'Chocolate Brownie', description: 'Fudgy, dark, single-origin cocoa.', price: 8000 },
      { slug: 'coconut-cookies', name: 'Coconut Cookies 250g', description: 'Buttery coconut cookies, baked to order.', price: 15000, isCustomOrder: true, leadTimeHours: 6 },
    ],
  },
  {
    slug: 'kamakhya-pickles',
    shopName: 'Kamakhya Pickles',
    shopDescription: 'Small-batch Northeast pickles. Made by the Das family in Dispur.',
    category: 'Pickle',
    lat: 26.1505,
    lng: 91.7290,
    address: 'Dispur Last Gate, Guwahati',
    minOrderAmount: 0,
    avgDeliveryMinutes: 90,
    rating: '4.8',
    totalOrders: 304,
    products: [
      { slug: 'bamboo-pickle', name: 'Bamboo Shoot Pickle 200g', description: 'Khorisa — fermented bamboo shoot, slow and tangy.', price: 22000 },
      { slug: 'bhut-jolokia', name: 'Bhut Jolokia Pickle 100g', description: 'Ghost-pepper pickle. Handle with respect.', price: 25000 },
      { slug: 'mango-pickle', name: 'Mango Pickle 250g', description: 'Sun-cured raw mango in mustard oil.', price: 18000 },
      { slug: 'mixed-veg-pickle', name: 'Mixed Veg Pickle 250g', description: 'Carrot, chilli, lime, and gourd.', price: 17000 },
    ],
  },
  {
    slug: 'mishti-rituparna',
    shopName: 'Mishti by Rituparna',
    shopDescription: 'Bengali-Assamese sweets and pithas, made to order for festivals and everyday cravings.',
    category: 'Sweets',
    lat: 26.1378,
    lng: 91.7448,
    address: 'Ganeshguri, Guwahati',
    minOrderAmount: 15000,
    avgDeliveryMinutes: 120,
    rating: '4.6',
    totalOrders: 167,
    products: [
      { slug: 'sandesh', name: 'Sandesh (6 pc)', description: 'Delicate chhena sweet, lightly cardamomed.', price: 18000 },
      { slug: 'rosogolla', name: 'Rosogolla (1 kg)', description: 'Spongy, syrup-soaked classic.', price: 32000 },
      { slug: 'til-pitha', name: 'Til Pitha (8 pc)', description: 'Rice-flour rolls with sesame and jaggery. Made to order.', price: 16000, isCustomOrder: true, leadTimeHours: 24 },
      { slug: 'kheer-kadam', name: 'Kheer Kadam (6 pc)', description: 'Rosogolla wrapped in khoya and mawa.', price: 24000 },
    ],
  },
];

async function main(): Promise<void> {
  let sellerCount = 0;
  let productCount = 0;

  for (const s of SELLERS) {
    const userId = detUuid(`user:${s.slug}`);
    const sellerId = detUuid(`seller:${s.slug}`);

    // 1. Seller user (phone is unique → onConflictDoNothing keeps re-runs safe)
    await db
      .insert(users)
      .values({
        id: userId,
        phone: `+9190000${String(1000 + sellerCount).slice(-4)}`,
        name: s.shopName,
        role: 'seller',
        city: 'Guwahati',
        isVerified: true,
        isActive: true,
      })
      .onConflictDoNothing();

    // 2. Seller profile (trigger fills shop_location from shop_lat/shop_lng)
    await db
      .insert(sellerProfiles)
      .values({
        id: sellerId,
        userId,
        shopName: s.shopName,
        shopDescription: s.shopDescription,
        category: s.category,
        shopLat: s.lat.toFixed(8),
        shopLng: s.lng.toFixed(8),
        city: 'Guwahati',
        address: s.address,
        deliveryRadiusKm: 6,
        minOrderAmount: s.minOrderAmount,
        avgDeliveryMinutes: s.avgDeliveryMinutes,
        isOpen: true,
        rating: s.rating,
        totalOrders: s.totalOrders,
        verificationStatus: 'approved',
      })
      .onConflictDoNothing();

    // 3. Business hours — open every day 08:00–21:00
    await db
      .insert(sellerBusinessHours)
      .values(
        Array.from({ length: 7 }).map((_, day) => ({
          id: detUuid(`hours:${s.slug}:${day}`),
          sellerId,
          dayOfWeek: day,
          openTime: '08:00',
          closeTime: '21:00',
          isClosed: false,
        })),
      )
      .onConflictDoNothing();

    // 4. Products
    await db
      .insert(products)
      .values(
        s.products.map((p) => ({
          id: detUuid(`product:${s.slug}:${p.slug}`),
          sellerId,
          name: p.name,
          description: p.description,
          price: p.price,
          category: s.category,
          images: [img(`${s.slug}-${p.slug}-1`), img(`${s.slug}-${p.slug}-2`)],
          stockQuantity: 999,
          isAvailable: true,
          isCustomOrder: p.isCustomOrder ?? false,
          leadTimeHours: p.leadTimeHours ?? 2,
        })),
      )
      .onConflictDoNothing();

    sellerCount += 1;
    productCount += s.products.length;
  }

  // eslint-disable-next-line no-console
  console.log(
    `\n✅ Seeded ${sellerCount} sellers / ${productCount} products in Guwahati.\n` +
      `   Set the iOS Simulator location to ${CENTER.lat}, ${CENTER.lng}\n` +
      `   (Features → Location → Custom Location) so they appear in range.\n`,
  );

  await pool.end();
}

main().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
