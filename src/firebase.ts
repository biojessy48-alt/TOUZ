import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  collection,
  collectionGroup,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';
import { DEFAULT_REVIEWS } from './data/defaultReviews';
import { DEFAULT_CATEGORIES } from './data/defaultCategories';
import { PRODUCTS } from './data/products';
import { Category, Product, StoreSettings, PromoCode } from './types';

// Resolved Firebase Configuration (works out-of-the-box on Vercel)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Suppress verbose backend connection warnings
try {
  setLogLevel('silent');
} catch {}

// Initialize Firestore with forced long polling for containerized network adaptability
const firestoreSettings = {
  experimentalForceLongPolling: true,
};

export const db = (() => {
  try {
    return firebaseConfig.firestoreDatabaseId
      ? initializeFirestore(app, firestoreSettings, firebaseConfig.firestoreDatabaseId)
      : initializeFirestore(app, firestoreSettings);
  } catch (_err) {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

// Validate Connection to Firestore
async function testConnection() {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await fetchWithTimeout(getDoc(testDoc), 2000);
  } catch (error) {
    // Graceful offline fallback notice
  }
}
setTimeout(() => { testConnection(); }, 1000);

// Error Handling Infrastructure according to Firebase Skill Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Helper to timeout long-hanging Firestore requests (e.g. offline/network latency/Safari ITP)
const fetchWithTimeout = <T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Firestore operation timed out (offline fallback)'));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

// Recursively strips undefined fields to prevent Firestore invalid data errors
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date) && typeof (obj as any).toDate !== 'function') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create/update user document in Firestore
    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (docError) {
        console.warn('User logged in, but updating user profile doc had non-fatal error:', docError);
      }
    }
    return user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  return await signOut(auth);
};

// Listen to Auth state changes
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Interfaces for Orders
export interface FirestoreOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  image: string;
}

export interface FirestoreOrderData {
  orderNumber: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  discountAmount: number;
  shipping: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  shippingAddress: {
    fullName: string;
    street: string;
    apartment?: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
}

export interface SavedOrder extends FirestoreOrderData {
  id: string;
  userId: string;
  userEmail: string;
  createdAt: any;
}

// Save Order strictly tied to logged-in User
export const saveUserOrder = async (
  userId: string,
  userEmail: string,
  orderData: FirestoreOrderData
) => {
  if (!userId) throw new Error('User must be logged in to save order');
  
  const orderRef = doc(collection(db, 'users', userId, 'orders'));
  const fullOrder = {
    id: orderRef.id,
    userId,
    userEmail,
    ...orderData,
    createdAt: serverTimestamp(),
  };

  await setDoc(orderRef, fullOrder);
  return fullOrder;
};

// Get User Orders strictly for logged-in User
export const getUserOrders = async (userId: string): Promise<SavedOrder[]> => {
  if (!userId) return [];
  
  try {
    const ordersRef = collection(db, 'users', userId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await fetchWithTimeout(getDocs(q));

    const orders: SavedOrder[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as SavedOrder);
    });

    return orders;
  } catch (error) {
    console.warn('Ordered query for user orders failed, trying fallback un-ordered query:', error);
    try {
      const ordersRef = collection(db, 'users', userId, 'orders');
      const snapshot = await fetchWithTimeout(getDocs(ordersRef));
      const orders: SavedOrder[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as SavedOrder);
      });
      orders.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      return orders;
    } catch (fallbackError) {
      console.error('Failed to get user orders:', fallbackError);
      return [];
    }
  }
};

// Admin: Get All Orders across all users
export const getAllOrdersAdmin = async (): Promise<SavedOrder[]> => {
  try {
    const ordersGroup = collectionGroup(db, 'orders');
    const snapshot = await fetchWithTimeout(getDocs(ordersGroup));
    const orders: SavedOrder[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as SavedOrder);
    });
    // Sort in memory by createdAt descending
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });
    if (orders.length > 0) {
      localStorage.setItem('maison_orders_cache', JSON.stringify(orders));
    }
    return orders;
  } catch (error) {
    console.warn('Notice: Firestore quota or connection issue when getting admin orders, falling back to cache:', error);
    try {
      return JSON.parse(localStorage.getItem('maison_orders_cache') || '[]');
    } catch {
      return [];
    }
  }
};

// Admin: Update Order Status
export const updateOrderStatusAdmin = async (
  userId: string,
  orderId: string,
  newStatus: SavedOrder['status']
) => {
  try {
    const orderDocRef = doc(db, 'users', userId, 'orders', orderId);
    await updateDoc(orderDocRef, { status: newStatus });
    return true;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

// Admin: Delete Order
export const deleteOrderAdmin = async (userId: string, orderId: string) => {
  try {
    const orderDocRef = doc(db, 'users', userId, 'orders', orderId);
    await deleteDoc(orderDocRef);
    return true;
  } catch (error) {
    console.error('Failed to delete order:', error);
    throw error;
  }
};

// Interfaces for Reviews
export interface FirestoreReviewData {
  productId: string;
  productTitle: string;
  rating: number; // 1 to 5
  comment: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  orderNumber?: string;
}

export interface SavedReview extends FirestoreReviewData {
  id: string;
  createdAt: any;
}

// Save Product / Store Review (Requires authenticated user)
export const saveProductReview = async (reviewData: FirestoreReviewData): Promise<SavedReview> => {
  if (!reviewData.userId) {
    throw new Error('User must be signed in with Google to post a review');
  }

  const reviewsRef = collection(db, 'reviews');
  const snapshot = await getDocs(reviewsRef);
  
  // If database was empty, seed all default reviews first so none are lost
  if (snapshot.empty) {
    for (const r of DEFAULT_REVIEWS) {
      const docRef = doc(db, 'reviews', r.id);
      await setDoc(docRef, r, { merge: true });
    }
  }

  const reviewRef = doc(collection(db, 'reviews'));
  const fullReview: SavedReview = {
    id: reviewRef.id,
    ...reviewData,
    createdAt: serverTimestamp(),
  };

  await setDoc(reviewRef, fullReview);
  return fullReview;
};

// Fetch reviews for a specific product
export const getProductReviews = async (productId: string): Promise<SavedReview[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await fetchWithTimeout(getDocs(reviewsRef));
    const reviews: SavedReview[] = [];
    
    snapshot.forEach((docSnap) => {
      reviews.push(docSnap.data() as SavedReview);
    });

    // Merge missing default reviews so default reviews are never lost
    const existingIds = new Set(reviews.map((r) => r.id));
    const missingDefaults = DEFAULT_REVIEWS.filter((dr) => !existingIds.has(dr.id));
    const combined = [...reviews, ...missingDefaults];

    // Strictly filter for matching product ID
    const matched = combined.filter((r) => r.productId === productId);

    // Sort descending by createdAt
    matched.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });

    return matched;
  } catch (error) {
    console.warn('Using offline fallback for product reviews:', error);
    return DEFAULT_REVIEWS.filter((r) => r.productId === productId);
  }
};

// Fetch all reviews for homepage or admin dashboard
export const getAllReviews = async (): Promise<SavedReview[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await fetchWithTimeout(getDocs(reviewsRef));
    const reviews: SavedReview[] = [];

    snapshot.forEach((docSnap) => {
      reviews.push(docSnap.data() as SavedReview);
    });

    const defaultIds = new Set(DEFAULT_REVIEWS.map((dr) => dr.id));
    // Filter out old default reviews and any female legacy reviews from database
    const femaleNames = ['نور', 'فريدة', 'يارا', 'سلمى', 'رحمة'];
    const customUserReviews = reviews.filter((r) => {
      if (defaultIds.has(r.id)) return false;
      if (r.userName && femaleNames.some((fn) => r.userName.includes(fn))) return false;
      if (r.comment && (r.comment.includes('فستان') || r.comment.includes('حذاء الميول') || r.comment.includes('بوهيمي'))) return false;
      return true;
    });

    const combined = [...DEFAULT_REVIEWS, ...customUserReviews];

    // Sync default reviews in background
    for (const dr of DEFAULT_REVIEWS) {
      setDoc(doc(db, 'reviews', dr.id), dr).catch(() => {});
    }

    combined.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });

    try {
      localStorage.setItem('maison_reviews_cache', JSON.stringify(combined));
    } catch {}

    return combined;
  } catch (error) {
    console.warn('Using offline fallback for all reviews:', error);
    try {
      const cached = JSON.parse(localStorage.getItem('maison_reviews_cache') || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        const femaleNames = ['نور', 'فريدة', 'يارا', 'سلمى', 'رحمة'];
        const cleanCached = cached.filter((c) => {
          if (c.userName && femaleNames.some((fn) => c.userName.includes(fn))) return false;
          if (c.comment && (c.comment.includes('فستان') || c.comment.includes('حذاء الميول') || c.comment.includes('بوهيمي'))) return false;
          return true;
        });
        const defaultIds = new Set(cleanCached.map((r: SavedReview) => r.id));
        const missingDefaults = DEFAULT_REVIEWS.filter((dr) => !defaultIds.has(dr.id));
        return [...missingDefaults, ...cleanCached];
      }
      return DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  }
};

// Delete Review (Admin)
export const deleteReviewAdmin = async (
  reviewId: string,
  allCurrentReviews?: SavedReview[]
): Promise<boolean> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsRef);
    
    // If database was empty, seed all current default reviews except the deleted one
    if (snapshot.empty && allCurrentReviews && allCurrentReviews.length > 0) {
      for (const r of allCurrentReviews) {
        if (r.id !== reviewId) {
          const docRef = doc(db, 'reviews', r.id);
          await setDoc(docRef, r, { merge: true });
        }
      }
    } else {
      const reviewDocRef = doc(db, 'reviews', reviewId);
      await deleteDoc(reviewDocRef);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete review:', error);
    throw error;
  }
};

// Update Review (Admin)
export const updateReviewAdmin = async (
  reviewId: string,
  updatedData: Partial<FirestoreReviewData>,
  allCurrentReviews?: SavedReview[]
): Promise<boolean> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsRef);
    
    // If database was empty, seed all default reviews first so none are lost
    if (snapshot.empty && allCurrentReviews && allCurrentReviews.length > 0) {
      for (const r of allCurrentReviews) {
        const docRef = doc(db, 'reviews', r.id);
        const dataToSave = r.id === reviewId ? { ...r, ...updatedData } : r;
        await setDoc(docRef, dataToSave, { merge: true });
      }
      return true;
    }

    const reviewDocRef = doc(db, 'reviews', reviewId);
    await setDoc(reviewDocRef, updatedData, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to update review:', error);
    throw error;
  }
};

export const addReviewAdmin = async (
  reviewData: Partial<FirestoreReviewData>,
  allCurrentReviews?: SavedReview[]
): Promise<SavedReview> => {
  const reviewsRef = collection(db, 'reviews');
  const snapshot = await getDocs(reviewsRef);
  
  if (snapshot.empty && allCurrentReviews && allCurrentReviews.length > 0) {
    for (const r of allCurrentReviews) {
      const docRef = doc(db, 'reviews', r.id);
      await setDoc(docRef, r, { merge: true });
    }
  }

  const reviewRef = doc(collection(db, 'reviews'));
  const fullReview: SavedReview = {
    id: reviewRef.id,
    productId: reviewData.productId || '',
    productTitle: reviewData.productTitle || '',
    rating: reviewData.rating || 5,
    comment: reviewData.comment || '',
    userId: reviewData.userId || 'admin-added',
    userName: reviewData.userName || 'عميل ميزون',
    userPhoto: reviewData.userPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    orderNumber: reviewData.orderNumber || 'ME-ADMIN',
    createdAt: serverTimestamp(),
  };

  await setDoc(reviewRef, fullReview);
  return fullReview;
};

// Reset to Default Reviews (Admin)
export const resetDefaultReviewsAdmin = async (): Promise<SavedReview[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsRef);
    // Delete existing docs first
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'reviews', docSnap.id)));
    });
    await Promise.all(deletePromises);

    // Seed default reviews
    for (const r of DEFAULT_REVIEWS) {
      await setDoc(doc(db, 'reviews', r.id), r);
    }
    return DEFAULT_REVIEWS;
  } catch (error) {
    console.error('Failed to reset default reviews:', error);
    return DEFAULT_REVIEWS;
  }
};

// ==========================================
// CATEGORY FIRESTORE FUNCTIONS
// ==========================================

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const catsRef = collection(db, 'categories');
    const snapshot = await fetchWithTimeout(getDocs(catsRef));
    const categories: Category[] = [];

    snapshot.forEach((docSnap) => {
      categories.push({ id: docSnap.id, ...docSnap.data() } as Category);
    });

    if (categories.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    return categories;
  } catch (error) {
    console.warn('Using offline fallback for categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategoryAdmin = async (
  categoryData: Omit<Category, 'id'>,
  currentCategories?: Category[]
): Promise<Category> => {
  const catsRef = collection(db, 'categories');
  const snapshot = await getDocs(catsRef);

  if (snapshot.empty && currentCategories && currentCategories.length > 0) {
    for (const c of currentCategories) {
      const docRef = doc(db, 'categories', c.id);
      await setDoc(docRef, c, { merge: true });
    }
  }

  const newDocRef = doc(catsRef);
  const newCat: Category = {
    id: newDocRef.id,
    ...categoryData,
  };

  await setDoc(newDocRef, newCat);
  return newCat;
};

export const updateCategoryAdmin = async (
  categoryId: string,
  updatedData: Partial<Category>,
  currentCategories?: Category[]
): Promise<boolean> => {
  try {
    const catsRef = collection(db, 'categories');
    const snapshot = await getDocs(catsRef);

    if (snapshot.empty && currentCategories && currentCategories.length > 0) {
      for (const c of currentCategories) {
        const docRef = doc(db, 'categories', c.id);
        const dataToSave = c.id === categoryId ? { ...c, ...updatedData } : c;
        await setDoc(docRef, dataToSave, { merge: true });
      }
      return true;
    }

    const catDocRef = doc(db, 'categories', categoryId);
    await setDoc(catDocRef, updatedData, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
};

export const deleteCategoryAdmin = async (
  categoryId: string,
  currentCategories?: Category[]
): Promise<boolean> => {
  try {
    const catsRef = collection(db, 'categories');
    const snapshot = await getDocs(catsRef);

    if (snapshot.empty && currentCategories && currentCategories.length > 0) {
      for (const c of currentCategories) {
        if (c.id !== categoryId) {
          const docRef = doc(db, 'categories', c.id);
          await setDoc(docRef, c, { merge: true });
        }
      }
    } else {
      const catDocRef = doc(db, 'categories', categoryId);
      await deleteDoc(catDocRef);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
};

export const resetDefaultCategoriesAdmin = async (): Promise<Category[]> => {
  try {
    const catsRef = collection(db, 'categories');
    const snapshot = await getDocs(catsRef);
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'categories', docSnap.id)));
    });
    await Promise.all(deletePromises);

    for (const c of DEFAULT_CATEGORIES) {
      await setDoc(doc(db, 'categories', c.id), c);
    }
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Failed to reset default categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

// ==========================================
// NEWSLETTER SUBSCRIBERS & BROADCAST SERVICES
// ==========================================

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source: string;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  previewText?: string;
  content: string;
  promoCode?: string;
  recipientCount: number;
  sentAt: string;
  status: string;
}

export const addNewsletterSubscriber = async (
  email: string,
  source: string = 'الموقع الإلكتروني'
): Promise<NewsletterSubscriber> => {
  const cleanEmail = email.trim().toLowerCase();
  const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');
  const subscriberDocRef = doc(db, 'subscribers', docId);
  
  const subscriberData: NewsletterSubscriber = {
    id: docId,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    status: 'active',
    source: source || 'الموقع الإلكتروني',
  };

  try {
    await setDoc(subscriberDocRef, subscriberData, { merge: true });
  } catch (err) {
    console.warn('Could not save subscriber to Firestore, saving locally:', err);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('maison_subscribers') || '[]');
    if (!existing.some((s: any) => s.email === cleanEmail)) {
      existing.unshift(subscriberData);
      localStorage.setItem('maison_subscribers', JSON.stringify(existing));
    }
  } catch (e) {
    console.error(e);
  }

  return subscriberData;
};

export const getNewsletterSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  const isInitialized = localStorage.getItem('maison_subscribers_init');
  const localSubscribers: NewsletterSubscriber[] = JSON.parse(
    localStorage.getItem('maison_subscribers') || '[]'
  );
  const deletedEmailsLocal: string[] = JSON.parse(
    localStorage.getItem('maison_deleted_subscribers') || '[]'
  );
  const deletedSet = new Set(deletedEmailsLocal.map((e) => e.trim().toLowerCase()));

  try {
    const deletedSnap = await fetchWithTimeout(getDocs(collection(db, 'deleted_subscribers')));
    deletedSnap.forEach((d) => {
      const email = d.data()?.email || d.id;
      if (email) deletedSet.add(String(email).trim().toLowerCase());
    });
  } catch (err) {
    console.warn('Could not fetch deleted_subscribers from Firestore:', err);
  }

  try {
    const subscribersRef = collection(db, 'subscribers');
    // Simple fetch without orderBy query to avoid missing index errors
    const snapshot = await fetchWithTimeout(getDocs(subscribersRef));
    
    const firestoreList: NewsletterSubscriber[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        firestoreList.push({ id: docSnap.id, ...docSnap.data() } as NewsletterSubscriber);
      });
    }

    const emailMap = new Map<string, NewsletterSubscriber>();
    [...firestoreList, ...localSubscribers].forEach((sub) => {
      if (sub && sub.email) {
        const key = sub.email.trim().toLowerCase();
        if (!deletedSet.has(key) && !emailMap.has(key)) {
          emailMap.set(key, sub);
        }
      }
    });

    const result = Array.from(emailMap.values());
    result.sort((a, b) => (b.subscribedAt || '').localeCompare(a.subscribedAt || ''));

    // Always sync cleaned active list to local storage
    localStorage.setItem('maison_subscribers', JSON.stringify(result));
    localStorage.setItem('maison_subscribers_init', 'true');

    return result;
  } catch (err) {
    console.warn('Failed to load subscribers from Firestore:', err);
  }

  if (!isInitialized && localSubscribers.length === 0) {
    const demoSubscribers: NewsletterSubscriber[] = [
      { id: 'sub_1', email: 'vip.client@luxuryfashion.eg', subscribedAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'active', source: 'الموقع الإلكتروني' },
      { id: 'sub_2', email: 'yasmin.almasri@gmail.com', subscribedAt: new Date(Date.now() - 86400000 * 5).toISOString(), source: 'إعلان فيسبوك', status: 'active' },
      { id: 'sub_3', email: 'nour.hassan@yahoo.com', subscribedAt: new Date(Date.now() - 86400000 * 10).toISOString(), source: 'الموقع الإلكتروني', status: 'active' },
    ];
    const filteredDemo = demoSubscribers.filter((s) => !deletedSet.has(s.email.toLowerCase()));
    localStorage.setItem('maison_subscribers', JSON.stringify(filteredDemo));
    localStorage.setItem('maison_subscribers_init', 'true');
    return filteredDemo;
  }

  const activeLocal = localSubscribers.filter((s) => s && s.email && !deletedSet.has(s.email.trim().toLowerCase()));
  localStorage.setItem('maison_subscribers', JSON.stringify(activeLocal));
  return activeLocal;
};

export const deleteNewsletterSubscriberAdmin = async (
  idOrEmail: string,
  targetEmail?: string
): Promise<boolean> => {
  const cleanEmail = (targetEmail || idOrEmail).trim().toLowerCase();
  const emailDocId = cleanEmail.replace(/[^a-z0-9]/g, '_');

  console.log(`[DELETE SUBSCRIBER] Attempting persistent deletion for email: ${cleanEmail}, id: ${idOrEmail}`);

  // 1. Mark in localStorage deleted_subscribers & prune maison_subscribers
  try {
    localStorage.setItem('maison_subscribers_init', 'true');
    const deletedList: string[] = JSON.parse(
      localStorage.getItem('maison_deleted_subscribers') || '[]'
    );
    if (!deletedList.includes(cleanEmail)) {
      deletedList.push(cleanEmail);
      localStorage.setItem('maison_deleted_subscribers', JSON.stringify(deletedList));
    }

    const existing: NewsletterSubscriber[] = JSON.parse(
      localStorage.getItem('maison_subscribers') || '[]'
    );
    const updated = existing.filter((s) => {
      if (!s || !s.email) return false;
      const sEmail = s.email.trim().toLowerCase();
      return (
        s.id !== idOrEmail &&
        s.id !== emailDocId &&
        sEmail !== cleanEmail
      );
    });
    localStorage.setItem('maison_subscribers', JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating localStorage on delete:', e);
  }

  // 2. Mark as deleted in Firestore deleted_subscribers collection & remove from subscribers collection
  try {
    if (emailDocId) {
      await setDoc(doc(db, 'deleted_subscribers', emailDocId), {
        email: cleanEmail,
        deletedAt: new Date().toISOString(),
      });
    }

    const deleteTasks: Promise<void>[] = [];

    if (idOrEmail) {
      deleteTasks.push(deleteDoc(doc(db, 'subscribers', idOrEmail)).catch(() => {}));
    }
    if (emailDocId && emailDocId !== idOrEmail) {
      deleteTasks.push(deleteDoc(doc(db, 'subscribers', emailDocId)).catch(() => {}));
    }

    if (cleanEmail.includes('@')) {
      const q = query(collection(db, 'subscribers'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        deleteTasks.push(deleteDoc(d.ref).catch(() => {}));
      });
    }

    await Promise.all(deleteTasks);
    console.log(`[DELETE SUBSCRIBER SUCCESS] Email ${cleanEmail} permanently deleted.`);
  } catch (e) {
    console.warn('Could not complete Firestore deletion:', e);
  }

  return true;
};

export const saveNewsletterCampaignAdmin = async (
  title: string,
  content: string,
  recipientCount: number,
  previewText?: string,
  promoCode?: string
): Promise<NewsletterCampaign> => {
  const campaignsRef = collection(db, 'newsletterCampaigns');
  const newDocRef = doc(campaignsRef);
  
  const campaignData: NewsletterCampaign = {
    id: newDocRef.id,
    title,
    previewText: previewText || '',
    content,
    promoCode: promoCode || '',
    recipientCount,
    sentAt: new Date().toISOString(),
    status: 'تم الإرسال بنجاح',
  };

  try {
    await setDoc(newDocRef, campaignData);
  } catch (err) {
    console.warn('Could not save campaign to Firestore:', err);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('maison_campaigns') || '[]');
    existing.unshift(campaignData);
    localStorage.setItem('maison_campaigns', JSON.stringify(existing));
  } catch (e) {
    console.error(e);
  }

  return campaignData;
};

export const getNewsletterCampaignsAdmin = async (): Promise<NewsletterCampaign[]> => {
  const localCampaigns: NewsletterCampaign[] = JSON.parse(
    localStorage.getItem('maison_campaigns') || '[]'
  );

  try {
    const campaignsRef = collection(db, 'newsletterCampaigns');
    const snapshot = await fetchWithTimeout(getDocs(campaignsRef));
    if (!snapshot.empty) {
      const firestoreList: NewsletterCampaign[] = [];
      snapshot.forEach((docSnap) => {
        firestoreList.push({ id: docSnap.id, ...docSnap.data() } as NewsletterCampaign);
      });
      firestoreList.sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''));
      localStorage.setItem('maison_campaigns', JSON.stringify(firestoreList));
      return firestoreList;
    }
  } catch (err) {
    console.warn('Failed to load campaigns from Firestore:', err);
  }

  return localCampaigns;
};

// ==========================================
// PRODUCTS FIRESTORE PERSISTENCE
// ==========================================

export function ensureValidProductImages(p: Product): Product {
  const prod = { ...p };

  if (!prod.images || !Array.isArray(prod.images) || prod.images.length === 0 || prod.images.every(img => !img || !img.trim())) {
    prod.images = ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800'];
  } else {
    prod.images = prod.images.filter(img => img && img.trim().length > 0);
  }

  const mainImage = prod.images[0];

  if (prod.colors && Array.isArray(prod.colors)) {
    prod.colors = prod.colors.map(c => {
      if (!c.imageUrl || !c.imageUrl.trim() || c.imageUrl.includes('unsplash.com')) {
        return { ...c, imageUrl: mainImage };
      }
      return c;
    });
  }

  return prod;
}

export const getAllProductsAdmin = async (): Promise<Product[]> => {
  const legacyProductIds = new Set([
    'silk-georgette-gown', 'sculptural-leather-mules', 'minimalist-silver-cuff',
    'structured-crossbody', 'obsidian-tailored-coat', 'silk-draped-blouse',
    'wide-leg-camel-trousers', 'noir-silk-slip-dress', 'architectural-tote', 'geometric-silver-pendant'
  ]);

  try {
    const productsRef = collection(db, 'products');
    const snapshot = await fetchWithTimeout(getDocs(productsRef));
    
    const firestoreProducts: Product[] = [];
    snapshot.forEach((docSnap) => {
      if (legacyProductIds.has(docSnap.id)) {
        // Asynchronously purge legacy products from Firestore
        deleteDoc(doc(db, 'products', docSnap.id)).catch(() => {});
      } else {
        const p = ensureValidProductImages({ id: docSnap.id, ...docSnap.data() } as Product);
        firestoreProducts.push(p);
      }
    });

    // Check localStorage for any local products created on device
    const saved = localStorage.getItem('maison_products');
    let localProducts: Product[] = [];
    if (saved) {
      try {
        localProducts = JSON.parse(saved);
      } catch {
        localProducts = [];
      }
    }

    if (firestoreProducts.length === 0) {
      const initialProducts = localProducts.length > 0 ? localProducts : PRODUCTS;
      for (const prod of initialProducts) {
        await setDoc(doc(db, 'products', prod.id), sanitizeForFirestore(prod), { merge: true });
      }
      localStorage.setItem('maison_products', JSON.stringify(initialProducts));
      return initialProducts;
    }

    // Merge any local products that might not be in Firestore yet
    const firestoreIds = new Set(firestoreProducts.map((p) => p.id));
    for (const localProd of localProducts) {
      if (!firestoreIds.has(localProd.id) && !legacyProductIds.has(localProd.id)) {
        firestoreProducts.unshift(localProd);
        // Persist to Firestore in background
        setDoc(doc(db, 'products', localProd.id), sanitizeForFirestore(localProd), { merge: true }).catch(() => {});
      }
    }

    localStorage.setItem('maison_products', JSON.stringify(firestoreProducts));
    return firestoreProducts;
  } catch (error) {
    console.warn('Using offline fallback for products:', error);
    try {
      const saved = localStorage.getItem('maison_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        const valid = parsed.filter((p) => !legacyProductIds.has(p.id));
        if (valid.length > 0) return valid;
      }
      return PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  }
};

export const subscribeToProducts = (
  callback: (products: Product[]) => void
): (() => void) => {
  const legacyProductIds = new Set([
    'silk-georgette-gown', 'sculptural-leather-mules', 'minimalist-silver-cuff',
    'structured-crossbody', 'obsidian-tailored-coat', 'silk-draped-blouse',
    'wide-leg-camel-trousers', 'noir-silk-slip-dress', 'architectural-tote', 'geometric-silver-pendant'
  ]);

  let emitted = false;

  // Immediately emit cached products from localStorage or default PRODUCTS so UI renders without delay
  try {
    const saved = localStorage.getItem('maison_products');
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      const valid = parsed.filter((p) => p && !legacyProductIds.has(p.id));
      if (valid.length > 0) {
        callback(valid);
        emitted = true;
      }
    }
  } catch {}

  if (!emitted) {
    callback(PRODUCTS);
    emitted = true;
  }

  try {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const firestoreProducts: Product[] = [];
        snapshot.forEach((docSnap) => {
          if (!legacyProductIds.has(docSnap.id)) {
            const p = ensureValidProductImages({ id: docSnap.id, ...docSnap.data() } as Product);
            firestoreProducts.push(p);
          }
        });

        if (firestoreProducts.length > 0) {
          localStorage.setItem('maison_products', JSON.stringify(firestoreProducts));
          callback(firestoreProducts);
        } else {
          callback(PRODUCTS);
        }
      },
      (err) => {
        console.warn('Realtime products listener notice:', err);
        callback(PRODUCTS);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime products listener:', error);
    callback(PRODUCTS);
    return () => {};
  }
};

export const saveProductAdmin = async (
  productData: Product,
  currentProducts: Product[] = []
): Promise<Product[]> => {
  const legacyProductIds = new Set([
    'silk-georgette-gown', 'sculptural-leather-mules', 'minimalist-silver-cuff',
    'structured-crossbody', 'obsidian-tailored-coat', 'silk-draped-blouse',
    'wide-leg-camel-trousers', 'noir-silk-slip-dress', 'architectural-tote', 'geometric-silver-pendant'
  ]);

  // Construct target ordered list
  let list = [...currentProducts];
  const idx = list.findIndex((p) => p.id === productData.id);
  if (idx >= 0) {
    list[idx] = productData;
  } else {
    list = [productData, ...list];
  }

  // Persist locally immediately
  localStorage.setItem('maison_products', JSON.stringify(list));

  try {
    const sanitizedProduct = sanitizeForFirestore(productData);
    await setDoc(doc(db, 'products', productData.id), sanitizedProduct, { merge: true });

    // Clean up any legacy products if present in Firestore
    for (const legacyId of legacyProductIds) {
      deleteDoc(doc(db, 'products', legacyId)).catch(() => {});
    }
  } catch (error) {
    console.error('Failed to save product in Firestore:', error);
  }

  return list;
};

export const deleteProductAdmin = async (
  productId: string
): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'products', productId));

    const saved = localStorage.getItem('maison_products');
    if (saved) {
      const list: Product[] = JSON.parse(saved);
      const filtered = list.filter((p) => p.id !== productId);
      localStorage.setItem('maison_products', JSON.stringify(filtered));
    }
    return true;
  } catch (error) {
    console.error('Failed to delete product from Firestore:', error);
    const saved = localStorage.getItem('maison_products');
    if (saved) {
      const list: Product[] = JSON.parse(saved);
      const filtered = list.filter((p) => p.id !== productId);
      localStorage.setItem('maison_products', JSON.stringify(filtered));
    }
    return false;
  }
};

export const resetDefaultProductsAdmin = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'products', docSnap.id)));
    });
    await Promise.all(deletePromises);

    for (const prod of PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod);
    }

    localStorage.setItem('maison_products', JSON.stringify(PRODUCTS));
    return PRODUCTS;
  } catch (error) {
    console.error('Failed to reset default products:', error);
    return PRODUCTS;
  }
};

// ==========================================
// STORE SETTINGS FIRESTORE PERSISTENCE
// ==========================================

function sanitizeSettings(settings: StoreSettings, defaultSettings: StoreSettings): StoreSettings {
  const sanitized = { ...settings };
  if (!sanitized.heroBadgeEn || !sanitized.heroBadgeEn.trim()) {
    sanitized.heroBadgeEn = defaultSettings.heroBadgeEn;
  }
  if (!sanitized.heroBadgeAr || !sanitized.heroBadgeAr.trim()) {
    sanitized.heroBadgeAr = defaultSettings.heroBadgeAr;
  }
  if (!sanitized.heroTitleEn || !sanitized.heroTitleEn.trim()) {
    sanitized.heroTitleEn = defaultSettings.heroTitleEn;
  }
  if (!sanitized.heroTitleAr || !sanitized.heroTitleAr.trim()) {
    sanitized.heroTitleAr = defaultSettings.heroTitleAr;
  }
  if (!sanitized.heroImageUrl || !sanitized.heroImageUrl.trim() || sanitized.heroImageUrl.includes('unsplash') || sanitized.heroImageUrl.includes('photo-1490481651871')) {
    sanitized.heroImageUrl = defaultSettings.heroImageUrl;
  }
  if (!sanitized.philosophyImageUrl || !sanitized.philosophyImageUrl.trim()) {
    sanitized.philosophyImageUrl = '/images/philosophy_model.jpg';
  }
  if (!sanitized.defaultLanguage) {
    sanitized.defaultLanguage = defaultSettings.defaultLanguage || 'ar';
  }
  if (sanitized.enableVodafoneCash === undefined) {
    sanitized.enableVodafoneCash = defaultSettings.enableVodafoneCash ?? true;
  }
  if (!sanitized.vodafoneCashNumber) {
    sanitized.vodafoneCashNumber = defaultSettings.vodafoneCashNumber || '01012345678';
  }
  if (!sanitized.vodafoneCashInstructionsAr) {
    sanitized.vodafoneCashInstructionsAr = defaultSettings.vodafoneCashInstructionsAr || 'يرجى تحويل المبلغ المطلوب إلى رقم محفظة فودافون كاش الموضح أعلاه، ثم إدخال رقم الموبايل المحول منه لتأكيد الطلب.';
  }
  if (!sanitized.vodafoneCashInstructionsEn) {
    sanitized.vodafoneCashInstructionsEn = defaultSettings.vodafoneCashInstructionsEn || 'Please transfer the exact total amount to the Vodafone Cash number above, then enter your sender phone number to confirm your order.';
  }
  if (sanitized.enableInstaPay === undefined) {
    sanitized.enableInstaPay = defaultSettings.enableInstaPay ?? true;
  }
  if (!sanitized.instaPayAccount) {
    sanitized.instaPayAccount = defaultSettings.instaPayAccount || defaultSettings.instaPayAddress || 'touza@instapay';
  }
  if (!sanitized.instaPayAddress) {
    sanitized.instaPayAddress = defaultSettings.instaPayAddress || 'touza@instapay';
  }
  if (!sanitized.instaPayPhone) {
    sanitized.instaPayPhone = defaultSettings.instaPayPhone || '01012345678';
  }
  if (!sanitized.instaPayInstructionsAr) {
    sanitized.instaPayInstructionsAr = defaultSettings.instaPayInstructionsAr || 'يرجى تحويل المبلغ عبر تطبيق InstaPay إلى عنوان IPA أو رقم الهاتف الموضح أعلاه، ثم أدخل رقم الموبايل أو رقم مرجع العملية.';
  }
  if (!sanitized.instaPayInstructionsEn) {
    sanitized.instaPayInstructionsEn = defaultSettings.instaPayInstructionsEn || 'Please transfer the exact amount via InstaPay to the IPA handle or phone number above, then enter your sender number or reference ID.';
  }
  if (sanitized.enableCashOnDelivery === undefined) {
    sanitized.enableCashOnDelivery = defaultSettings.enableCashOnDelivery ?? true;
  }
  return sanitized;
}

export const getStoreSettingsAdmin = async (
  defaultSettings: StoreSettings
): Promise<StoreSettings> => {
  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    const docSnap = await fetchWithTimeout(getDoc(settingsDocRef));
    
    if (!docSnap.exists()) {
      await setDoc(settingsDocRef, defaultSettings, { merge: true });
      localStorage.setItem('maison_settings', JSON.stringify(defaultSettings));
      return defaultSettings;
    }

    const remoteData = sanitizeSettings({ ...defaultSettings, ...(docSnap.data() as StoreSettings) }, defaultSettings);
    localStorage.setItem('maison_settings', JSON.stringify(remoteData));
    return remoteData;
  } catch (error) {
    console.warn('Using offline fallback for store settings:', error);
    try {
      const saved = localStorage.getItem('maison_settings');
      return saved ? sanitizeSettings({ ...defaultSettings, ...JSON.parse(saved) }, defaultSettings) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }
};

export const subscribeToStoreSettings = (
  defaultSettings: StoreSettings,
  callback: (settings: StoreSettings) => void
): (() => void) => {
  let emitted = false;

  // Immediately emit cached settings from localStorage or defaultSettings for instant render
  try {
    const saved = localStorage.getItem('maison_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        callback(sanitizeSettings({ ...defaultSettings, ...parsed }, defaultSettings));
        emitted = true;
      }
    }
  } catch {}

  if (!emitted) {
    callback(defaultSettings);
    emitted = true;
  }

  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = sanitizeSettings({ ...defaultSettings, ...(docSnap.data() as StoreSettings) }, defaultSettings);
          localStorage.setItem('maison_settings', JSON.stringify(remoteData));
          callback(remoteData);
        } else {
          callback(defaultSettings);
        }
      },
      (err) => {
        console.warn('Realtime settings listener notice:', err);
        callback(defaultSettings);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime settings listener:', error);
    callback(defaultSettings);
    return () => {};
  }
};

export const saveStoreSettingsAdmin = async (
  newSettings: StoreSettings
): Promise<StoreSettings> => {
  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    await setDoc(settingsDocRef, sanitizeForFirestore(newSettings), { merge: true });
    localStorage.setItem('maison_settings', JSON.stringify(newSettings));
    return newSettings;
  } catch (error) {
    console.warn('Failed to save store settings in Firestore, using localStorage fallback:', error);
    // fallback to local storage
    localStorage.setItem('maison_settings', JSON.stringify(newSettings));
    return newSettings;
  }
};

// ==========================================
// PROMO CODES FIRESTORE PERSISTENCE
// ==========================================

export const getAllPromoCodesAdmin = async (
  defaultPromos: PromoCode[]
): Promise<PromoCode[]> => {
  try {
    const promosRef = collection(db, 'promoCodes');
    const snapshot = await fetchWithTimeout(getDocs(promosRef));

    if (snapshot.empty) {
      for (const p of defaultPromos) {
        await setDoc(doc(db, 'promoCodes', p.id), sanitizeForFirestore(p), { merge: true });
      }
      localStorage.setItem('maison_promos', JSON.stringify(defaultPromos));
      return defaultPromos;
    }

    const firestorePromos: PromoCode[] = [];
    snapshot.forEach((docSnap) => {
      firestorePromos.push({ id: docSnap.id, ...docSnap.data() } as PromoCode);
    });

    localStorage.setItem('maison_promos', JSON.stringify(firestorePromos));
    return firestorePromos;
  } catch (error) {
    console.warn('Using offline fallback for promo codes:', error);
    try {
      const saved = localStorage.getItem('maison_promos');
      return saved ? JSON.parse(saved) : defaultPromos;
    } catch {
      return defaultPromos;
    }
  }
};

export const savePromoCodeAdmin = async (
  promoData: PromoCode
): Promise<boolean> => {
  try {
    const promoDocRef = doc(db, 'promoCodes', promoData.id);
    await setDoc(promoDocRef, sanitizeForFirestore(promoData), { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to save promo code to Firestore:', error);
    throw error;
  }
};

export const deletePromoCodeAdmin = async (
  promoId: string
): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'promoCodes', promoId));
    return true;
  } catch (error) {
    console.error('Failed to delete promo code from Firestore:', error);
    throw error;
  }
};


