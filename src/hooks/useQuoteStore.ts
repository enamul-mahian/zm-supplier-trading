import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuoteProductSnapshot, QuoteServiceSnapshot } from '../shared/types';

// Zustand স্টোরের স্টেট ও অ্যাকশন সমূহের টাইপ সেফ ইন্টারফেস (Part 05B, Rule 92)
export interface QuoteState {
  productSelections: QuoteProductSnapshot[];
  serviceSelections: QuoteServiceSnapshot[];
  
  // প্রোডাক্ট সিলেকশন সংক্রান্ত অ্যাকশনসমূহ
  addProductSelection: (product: QuoteProductSnapshot) => void;
  removeProductSelection: (productId: string, variantId: string | null, packagingOptionId: string | null) => void;
  updateProductQuantity: (productId: string, variantId: string | null, packagingOptionId: string | null, quantity: number) => void;
  updateProductNotes: (productId: string, variantId: string | null, packagingOptionId: string | null, notes: string | null) => void;
  
  // সার্ভিস সিলেকশন সংক্রান্ত অ্যাকশনসমূহ
  addServiceSelection: (service: QuoteServiceSnapshot) => void;
  removeServiceSelection: (serviceId: string) => void;
  updateServiceNotes: (serviceId: string, notes: string | null) => void;
  
  // গ্লোবাল বাস্কেট ক্লিয়ার করার অ্যাকশন
  clearQuoteList: () => void;
}

// B2B কোটেশন বাস্কেট স্টোর ডেফিনিশন (Refreshes বা পেজ পরিবর্তনের সময় ডেটা ধরে রাখতে LocalStorage ব্যবহার করা হয়েছে)
export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      productSelections: [],
      serviceSelections: [],

      // বাস্কেটে নতুন প্রোডাক্ট যুক্ত করার লজিক (একই প্রোডাক্ট, ভ্যারিয়েন্ট ও প্যাকেজিং থাকলে মার্জ বা পরিমাণ বৃদ্ধি করবে)
      addProductSelection: (product) => set((state) => {
        const existingIndex = state.productSelections.findIndex(
          (item) => 
            item.productId === product.productId && 
            item.variantId === product.variantId && 
            item.packagingOptionId === product.packagingOptionId
        );

        if (existingIndex > -1) {
          const updated = [...state.productSelections];
          const existingItem = updated[existingIndex];
          const currentQty = existingItem.requestedQuantity || 0;
          const newQty = product.requestedQuantity || 0;
          
          updated[existingIndex] = {
            ...existingItem,
            requestedQuantity: currentQty + newQty,
            notes: product.notes || existingItem.notes
          };
          return { productSelections: updated };
        }

        return { productSelections: [...state.productSelections, product] };
      }),

      // বাস্কেট থেকে নির্দিষ্ট প্রোডাক্ট বাদ দেওয়ার লজিক
      removeProductSelection: (productId, variantId, packagingOptionId) => set((state) => ({
        productSelections: state.productSelections.filter(
          (item) => 
            !(item.productId === productId && 
              item.variantId === variantId && 
              item.packagingOptionId === packagingOptionId)
        )
      })),

      // প্রোডাক্টের প্রয়োজনীয় কোয়ান্টিটি বা পরিমাণ পরিবর্তনের লজিক
      updateProductQuantity: (productId, variantId, packagingOptionId, quantity) => set((state) => ({
        productSelections: state.productSelections.map((item) => {
          if (
            item.productId === productId && 
            item.variantId === variantId && 
            item.packagingOptionId === packagingOptionId
          ) {
            return { ...item, requestedQuantity: quantity };
          }
          return item;
        })
      })),

      // বাস্কেটের প্রোডাক্ট-অনুযায়ী কাস্টম রিকোয়ারমেন্ট নোট যুক্ত করার লজিক
      updateProductNotes: (productId, variantId, packagingOptionId, notes) => set((state) => ({
        productSelections: state.productSelections.map((item) => {
          if (
            item.productId === productId && 
            item.variantId === variantId && 
            item.packagingOptionId === packagingOptionId
          ) {
            return { ...item, notes };
          }
          return item;
        })
      })),

      // বাস্কেটে নতুন সার্ভিস যুক্ত করার লজিক
      addServiceSelection: (service) => set((state) => {
        const exists = state.serviceSelections.some((item) => item.serviceId === service.serviceId);
        if (exists) return state; // সার্ভিসটি অলরেডি বাস্কেটে থাকলে নতুন করে অ্যাড হবে না
        return { serviceSelections: [...state.serviceSelections, service] };
      }),

      // বাস্কেট থেকে সার্ভিস বাদ দেওয়ার লজিক
      removeServiceSelection: (serviceId) => set((state) => ({
        serviceSelections: state.serviceSelections.filter((item) => item.serviceId !== serviceId)
      })),

      // বাস্কেটের সার্ভিস-অনুযায়ী কাস্টম স্পেসিফিকেশন নোট যুক্ত করার লজিক
      updateServiceNotes: (serviceId, notes) => set((state) => ({
        serviceSelections: state.serviceSelections.map((item) => {
          if (item.serviceId === serviceId) {
            return { ...item, notes };
          }
          return item;
        })
      })),

      // সফল কোটেশন সাবমিশনের পর পুরো বাস্কেট ফাঁকা করার লজিক
      clearQuoteList: () => set({ productSelections: [], serviceSelections: [] })
    }),
    {
      name: 'zmst-quote-list-storage', // ব্রাউজার লোকাল স্টোরেজে সেভ রাখার কী (Key)
    }
  )
);