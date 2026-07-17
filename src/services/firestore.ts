import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  limit, 
  orderBy,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config'; 
import { 
  Product, 
  ProductCategory, 
  ProductVariant, 
  ProductPackagingOption, 
  Service, 
  FAQ, 
  QuoteRequest 
} from '../shared/types'; 

// গ্লোবাল ইউনিক বিটুবি কোটেশন রেফারেন্স নম্বর জেনারেটর (ZST-YYYYMMDD-RANDOM)
const generateReferenceNumber = (): string => {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ZST-${dateStr}-${randomNum}`;
};

/**
 * ১. প্রোডাক্ট ক্যাটাগরি উদ্ধার করার সার্ভিস
 */
export const fetchCategories = async (): Promise<ProductCategory[]> => {
  try {
    const categoriesRef = collection(db, 'productCategories');
    const q = query(
      categoriesRef,
      where('status', '==', 'published'),
      where('isEnabled', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as ProductCategory[];
    
    // ফায়ারবেস ইনডেক্স এরর এড়াতে ক্লায়েন্ট-সাইডে সর্টিং করা হচ্ছে
    return results.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    console.error('[Firestore Service Error - fetchCategories]:', error);
    return [];
  }
};

/**
 * ২. ডাইনামিক ফিল্টার এবং প্যাগিনেশন সহ প্রোডাক্ট ক্যাটালগ কোয়েরি সার্ভিস
 */
export interface FetchProductsOptions {
  categoryId?: string | null;
  isFeatured?: boolean;
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
}

export const fetchProducts = async (options?: FetchProductsOptions): Promise<{
  products: Product[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    const productsRef = collection(db, 'products');
    
    const queryConstraints: QueryConstraint[] = [
      where('status', '==', 'published'),
      where('isEnabled', '==', true),
      orderBy('sortOrder', 'asc') // প্যাগিনেশন ঠিক রাখতে এটি রাখা হলো
    ];

    if (options?.categoryId) {
      queryConstraints.push(where('categoryId', '==', options.categoryId));
    }

    if (options?.isFeatured !== undefined) {
      queryConstraints.push(where('isFeatured', '==', options.isFeatured));
    }

    if (options?.limitCount) {
      queryConstraints.push(limit(options.limitCount));
    }

    if (options?.lastDoc) {
      queryConstraints.push(startAfter(options.lastDoc));
    }

    const q = query(productsRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const products = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Product[];

    const lastVisible = querySnapshot.docs.length > 0 
      ? querySnapshot.docs[querySnapshot.docs.length - 1] 
      : null;

    return { products, lastVisible };
  } catch (error) {
    console.error('[Firestore Service Error - fetchProducts]:', error);
    return { products: [], lastVisible: null };
  }
};

/**
 * ৩. ইউনিক স্লাগ (Slug) দিয়ে একক প্রোডাক্ট খুঁজে বের করার সার্ভিস
 */
export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('slug', '==', slug),
      where('status', '==', 'published'),
      where('isEnabled', '==', true),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const docSnap = querySnapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Product;
  } catch (error) {
    console.error(`[Firestore Error - fetchProductBySlug] for slug ${slug}:`, error);
    return null;
  }
};

/**
 * ৪. প্রোডাক্টের নির্দিষ্ট ভ্যারিয়েন্ট পাওয়ার সার্ভিস
 */
export const fetchProductVariants = async (productId: string): Promise<ProductVariant[]> => {
  try {
    const variantsRef = collection(db, 'productVariants');
    const q = query(
      variantsRef,
      where('productId', '==', productId),
      where('isEnabled', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as ProductVariant[];
    
    return results.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    console.error(`[Firestore Error - fetchProductVariants] for product ${productId}:`, error);
    return [];
  }
};

/**
 * ৫. প্রোডাক্টের প্যাকেজিং অপশনস কোয়েরি সার্ভিস
 */
export const fetchPackagingOptions = async (productId: string): Promise<ProductPackagingOption[]> => {
  try {
    const packagingRef = collection(db, 'productPackagingOptions');
    const q = query(
      packagingRef,
      where('productId', '==', productId),
      where('isEnabled', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as ProductPackagingOption[];
    
    return results.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    console.error(`[Firestore Error - fetchPackagingOptions] for product ${productId}:`, error);
    return [];
  }
};

/**
 * ৬. সার্ভিসেস লিস্ট পাওয়ার সার্ভিস
 */
export const fetchServices = async (): Promise<Service[]> => {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(
      servicesRef,
      where('status', '==', 'published'),
      where('isEnabled', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Service[];
    
    return results.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    console.error('[Firestore Service Error - fetchServices]:', error);
    return [];
  }
};

/**
 * ৭. ইউনিক স্লাগ দিয়ে নির্দিষ্ট সার্ভিস ডিটেইলস পাওয়ার সার্ভিস
 */
export const fetchServiceBySlug = async (slug: string): Promise<Service | null> => {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(
      servicesRef,
      where('slug', '==', slug),
      where('status', '==', 'published'),
      where('isEnabled', '==', true),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const docSnap = querySnapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Service;
  } catch (error) {
    console.error(`[Firestore Error - fetchServiceBySlug] for slug ${slug}:`, error);
    return null;
  }
};

/**
 * ৮. রিলেটেড এফএকিউ (FAQ) লোড করার ফিল্টারড সার্ভিস
 */
export const fetchFAQs = async (filter?: {
  pageId?: string;
  productId?: string;
  serviceId?: string;
}): Promise<FAQ[]> => {
  try {
    const faqsRef = collection(db, 'faqs');
    
    const constraints: QueryConstraint[] = [
      where('isEnabled', '==', true)
      // ইনডেক্স এরর বাইপাস করতে orderBy রিমুভ করা হয়েছে
    ];

    if (filter?.pageId) {
      constraints.push(where('pageIds', 'array-contains', filter.pageId));
    } else if (filter?.productId) {
      constraints.push(where('productIds', 'array-contains', filter.productId));
    } else if (filter?.serviceId) {
      constraints.push(where('serviceIds', 'array-contains', filter.serviceId));
    }

    const q = query(faqsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const results = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as FAQ[];

    // ক্লায়েন্ট-সাইডে sortOrder অনুযায়ী ডেটাগুলো সাজানো হচ্ছে
    return results.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    console.error('[Firestore Service Error - fetchFAQs]:', error);
    return [];
  }
};

/**
 * ৯. সুরক্ষিত বিটুবি কোটেশন বা এনকোয়ারি রিকোয়েস্ট সাবমিশন সার্ভিস (Part 05D, Rule 20)
 */
export const submitQuoteRequest = async (
  quoteData: Omit<QuoteRequest, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<{ success: boolean; referenceNumber?: string; error?: string }> => {
  try {
    const quoteRequestsRef = collection(db, 'quoteRequests');
    const referenceNumber = generateReferenceNumber();
    
    // ফায়ারস্টোর সিকিউরড রাইট মডেল (snapshots + সার্ভার টাইমস্ট্যাম্প সহ)
    const newQuoteDoc = {
      ...quoteData,
      referenceNumber,
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(quoteRequestsRef, newQuoteDoc);
    return { success: true, referenceNumber };
  } catch (error: any) {
    console.error('[Firestore Service Error - submitQuoteRequest]:', error);
    return { 
      success: false, 
      error: error?.message || 'We could not submit your quote request. Please try again or contact support.' 
    };
  }
};