// ফায়ারস্টোর টাইমস্ট্যাম্প হেল্পার ইন্টারফেস
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// ক্লাউডিনারি মিডিয়া রেফারেন্স ইন্টারফেস (Part 07, Rule 28)
export interface MediaReference {
  id?: string;
  secureUrl: string;
  cloudinaryPublicId: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  width: number | null;
  height: number | null;
  bytes: number;
  altText: string;
  caption?: string | null;
  uploadedAt?: string | FirestoreTimestamp;
}

// গ্লোবাল এসইও মেটাডাটা ইন্টারফেস (Part 05D, Rule 29)
export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: MediaReference | null;
  twitterCard: 'summary' | 'summary_large_image';
  robotsIndex: boolean;
  robotsFollow: boolean;
  schemaEnabled: boolean;
  faqSchemaEnabled: boolean;
  breadcrumbSchemaEnabled: boolean;
}

// প্রোডাক্ট ক্যাটাগরি ইন্টারফেস
export interface ProductCategory {
  id: string;
  name: string;
  normalizedName: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  parentCategoryId: string | null;
  ancestorIds: string[];
  depth: number;
  icon?: string | null;
  cardImage: MediaReference | null;
  bannerImage?: MediaReference | null;
  isFeatured: boolean;
  publishedProductCount: number;
  seo?: SeoData;
  status: 'draft' | 'published' | 'archived';
  isEnabled: boolean;
  sortOrder: number;
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
}

// প্রোডাক্ট ব্র্যান্ড ইন্টারফেস (ঐচ্ছিক)
export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo: MediaReference | null;
  websiteUrl?: string;
  isFeatured: boolean;
  seo?: SeoData;
  status: 'draft' | 'published' | 'archived';
  isEnabled: boolean;
  sortOrder: number;
}

// প্রোডাক্টের মাল্টিপল প্যাকেজিং অপশনস ইন্টারফেস (Part 05B, Rule 31)
export interface ProductPackagingOption {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  unitSize: number | null;
  unitMeasure: string | null; // e.g. "kg", "g", "litres"
  unitsPerCase: number | null;
  caseWeight: number | null;
  palletQuantity: number | null;
  minimumOrderQuantity: number | null;
  minimumOrderUnit: string | null;
  image: MediaReference | null;
  notes: string | null;
  isEnabled: boolean;
  sortOrder: number;
}

// প্রোডাক্ট ভ্যারিয়েন্ট ইন্টারফেস (Part 05B, Rule 19)
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  variantCode: string | null;
  attributeValues: Record<string, string | number | boolean>;
  combinationKey: string; // e.g. "size=1kg|packaging=carton"
  primaryImage: MediaReference | null;
  galleryMediaIds: string[];
  minimumOrderQuantity: number | null;
  minimumOrderUnit: string | null;
  packagingOptionIds: string[];
  availabilityStatus: string;
  leadTime: string | null;
  privateLabelAvailable: boolean | null;
  sampleAvailable: boolean | null;
  weight: number | null;
  weightUnit: string | null;
  isEnabled: boolean;
  isDefault: boolean;
  sortOrder: number;
}

// প্রধান প্রোডাক্ট ডেটা মডেল (Part 05D, Rule 07)
export interface Product {
  id: string;
  name: string;
  normalizedName: string;
  slug: string;
  productCode: string | null;
  internalReference: string | null;
  categoryId: string;
  subcategoryId: string | null;
  brandId: string | null;
  tagIds: string[];
  productType: string;
  shortDescription: string;
  fullDescription: string;
  primaryImage: MediaReference | null;
  galleryMediaIds: string[];
  brochureDocumentIds: string[];
  enquiryOnly: boolean;
  pricingMode: 'hidden' | 'request' | 'starting_from' | 'indicative' | 'fixed';
  publicPrice: number | null;
  currency: string | null;
  minimumOrderQuantity: number | null;
  minimumOrderUnit: string | null;
  availabilityStatus: string; // Available, Made to order, Coming soon etc.
  leadTime: string | null;
  privateLabelAvailable: boolean;
  sampleAvailable: boolean;
  internationalSupplyAvailable: boolean;
  variantIds: string[];
  packagingOptionIds: string[];
  relatedProductIds: string[];
  relatedServiceIds: string[];
  faqIds: string[];
  seo: SeoData;
  status: 'draft' | 'published' | 'archived';
  isEnabled: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
  publishedAt: FirestoreTimestamp | string | null;
}

// সার্ভিস প্রসেস স্টেপ ইন্টারফেস (Part 05C, Rule 19)
export interface ServiceProcessStep {
  id: string;
  serviceId: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  iconName?: string;
  sortOrder: number;
  isEnabled: boolean;
}

// সার্ভিস বেনিফিট ইন্টারফেস (Part 05C, Rule 20)
export interface ServiceBenefit {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  iconName?: string;
  sortOrder: number;
  isEnabled: boolean;
}

// প্রধান সার্ভিস ডেটা মডেল (Part 05D, Rule 14)
export interface Service {
  id: string;
  name: string;
  slug: string;
  eyebrow: string | null;
  shortDescription: string;
  fullDescription: string;
  categoryId: string | null;
  cardImage: MediaReference | null;
  heroImage: MediaReference | null;
  galleryMediaIds: string[];
  processStepIds: string[];
  benefitIds: string[];
  buyerTypeIds: string[];
  industryIds: string[];
  relatedProductIds: string[];
  relatedServiceIds: string[];
  faqIds: string[];
  seo: SeoData;
  status: 'draft' | 'published' | 'archived';
  isEnabled: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
}

// এফএকিউ ইন্টারফেস (Part 05D, Rule 17)
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  categoryId?: string | null;
  pageIds: string[]; // e.g. ["home", "about"]
  productIds: string[];
  serviceIds: string[];
  includeInSchema: boolean;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: FirestoreTimestamp | string;
}

// টেস্টামোনিয়াল ইন্টারফেস
export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  role: string;
  company: string;
  country?: string | null;
  avatar?: MediaReference | null;
  isEnabled: boolean;
  sortOrder: number;
}

// টিম মেম্বার ইন্টারফেস
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: MediaReference | null;
  bio: string;
  linkedinUrl?: string;
  isEnabled: boolean;
  sortOrder: number;
}

// লিগ্যাল পেজ ডেটা মডেল
export interface LegalPage {
  id: string;
  title: string;
  slug: string;
  content: string; // Sanitized Rich HTML
  seo: SeoData;
  status: 'draft' | 'published';
  updatedAt: FirestoreTimestamp | string;
}

// কোটেশন রিকোয়েস্টের প্রোডাক্ট স্ন্যাপশট (Part 05D, Rule 21)
export interface QuoteProductSnapshot {
  productId: string;
  productName: string;
  productCode: string | null;
  productSlug: string;
  productImageUrl: string | null;
  variantId: string | null;
  variantName: string | null;
  variantSku: string | null;
  selectedAttributes: Record<string, string | number | boolean>;
  packagingOptionId: string | null;
  packagingName: string | null;
  minimumOrderQuantity: number | null;
  minimumOrderUnit: string | null;
  requestedQuantity: number | null;
  requestedQuantityUnit: string | null;
  notes: string | null;
}

// কোটেশন রিকোয়েস্টের সার্ভিস স্ন্যাপশট (Part 05D, Rule 22)
export interface QuoteServiceSnapshot {
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
  notes: string | null;
}

// প্রধান কোটেশন/এনকোয়ারি রিকোয়েস্ট ডেটা মডেল (Part 05D, Rule 20)
export interface QuoteRequest {
  id: string;
  referenceNumber: string;
  enquiryType: 'general' | 'product' | 'service' | 'custom_sourcing';
  companyName: string;
  contactName: string;
  businessEmail: string;
  phone: string | null;
  country: string;
  businessType: string | null;
  productSelections: QuoteProductSnapshot[];
  serviceSelections: QuoteServiceSnapshot[];
  requiredQuantity: number | null;
  quantityUnit: string | null;
  packagingRequirement: string | null;
  destination: string | null;
  requiredTimeline: string | null;
  privateLabelRequired: boolean;
  message: string;
  attachmentMediaIds: string[];
  preferredContactMethod: string | null;
  consentAccepted: boolean;
  marketingConsent: boolean;
  sourcePage: string;
  locale: string;
  status: 'new' | 'review' | 'contacted' | 'quoted' | 'closed' | 'spam';
  createdAt: FirestoreTimestamp | string;
  updatedAt: FirestoreTimestamp | string;
}