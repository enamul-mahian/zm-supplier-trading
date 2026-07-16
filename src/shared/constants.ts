export interface BrandInfo {
  name: string;
  legalName: string;
  motto: string;
  logoUrl: string;
  faviconUrl: string;
  themeColor: string;
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

// ZM Supplier & Trading-এর গ্লোবাল ব্র্যান্ড ইনফরমেশন
export const BRAND_INFO: BrandInfo = {
  name: "ZM Supplier & Trading",
  legalName: "ZM Supplier & Trading Ltd",
  motto: "UK Standard. Clean. Hygienic. Authentic Product Supply.",
  logoUrl: "/logo.svg", // ডিরেক্টরিতে লোগো ফাইল যুক্ত করার পর এটি কাজ করবে
  faviconUrl: "/favicon.svg",
  themeColor: "#024E33",
  email: "info@zmsupplier.co.uk",
  phone: "+44 1234 567890",
  address: "123 Business Park, London, United Kingdom",
  workingHours: "Mon - Fri: 9:00 AM - 6:00 PM (GMT)",
  socials: {
    linkedin: "https://linkedin.com/company/zm-supplier-trading",
    twitter: "https://twitter.com/zmsupplier",
    facebook: "https://facebook.com/zmsupplier",
  }
};

export interface StatItem {
  value: string;
  label: string;
  description: string;
}

// About Us পেজের সংখ্যাভিত্তিক ডাটা
export const BRAND_STATS: StatItem[] = [
  { value: "UK", label: "Standard Quality", description: "Controlled sourcing processes" },
  { value: "100+", label: "Trusted Suppliers", description: "Verified partner networks" },
  { value: "50+", label: "Countries Served", description: "International supply chain routes" },
  { value: "100%", label: "Customer Focused", description: "B2B partnership excellence" }
];

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

// ৪টি গ্লোবাল কমিটমেন্ট ও কোর ভ্যালু
export const CORE_VALUES: ValueItem[] = [
  { 
    id: "quality", 
    title: "Quality", 
    description: "We never compromise on the specifications and handling standards of our products.", 
    iconName: "ShieldCheck" 
  },
  { 
    id: "integrity", 
    title: "Integrity", 
    description: "Honest, transparent, and ethical trade practices govern our commercial agreements.", 
    iconName: "Handshake" 
  },
  { 
    id: "safety", 
    title: "Safety", 
    description: "Hygienic storage, clean packaging, and compliant handling standards are our priority.", 
    iconName: "Heart" 
  },
  { 
    id: "partnership", 
    title: "Partnership", 
    description: "Focusing on sustainable growth and long-term commercial relationships.", 
    iconName: "Users" 
  }
];

export interface WhyUsItem {
  title: string;
  description: string;
  iconName: string;
}

// "Why Choose Us" পেজের ভ্যালু প্রোপজিশন
export const WHY_US_ITEMS: WhyUsItem[] = [
  { 
    title: "UK Standard Quality", 
    description: "Strict assessment and monitoring practices to ensure the highest product quality.", 
    iconName: "CheckCircle" 
  },
  { 
    title: "Clean & Hygienic", 
    description: "Professional storage and packaging handling to maintain hygienic integrity.", 
    iconName: "Sparkles" 
  },
  { 
    title: "Authentic Products", 
    description: "Verified supply chains with traceable origins to secure genuine product delivery.", 
    iconName: "FileCheck" 
  },
  { 
    title: "Competitive Pricing", 
    description: "Structured commercial planning offering optimised wholesale terms.", 
    iconName: "TrendingUp" 
  },
  { 
    title: "On-Time Delivery", 
    description: "Reliable coordination and logistics planning to support your business timeline.", 
    iconName: "Clock" 
  }
];

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং থাকা অবস্থায় প্রথম রানটাইম ফলব্যাক এফএকিউসমূহ
export const FALLBACK_FAQS: FAQItem[] = [
  { 
    id: "faq-1", 
    question: "What products do you supply?", 
    answer: "We specialise in the B2B supply of packaged food products, dry goods, grocery supplies, beverages, hospitality items, and private-label products. All products are sourced through verified suppliers with high hygiene and quality standards." 
  },
  { 
    id: "faq-2", 
    question: "Do you offer private label solutions?", 
    answer: "Yes, we support private-label configurations for selected products. This includes custom branding, specialised packaging options, and logistics coordination tailored to your brand identity." 
  },
  { 
    id: "faq-3", 
    question: "Do you deliver across the UK?", 
    answer: "Yes, we coordinate distribution and wholesale supply routes across the United Kingdom and support international export coordination for global commercial buyers." 
  },
  { 
    id: "faq-4", 
    question: "What payment terms do you accept?", 
    answer: "We support structured commercial payment terms designed for B2B buyers. Terms are subject to quotation review, volume, and long-term contract evaluations." 
  },
  { 
    id: "faq-5", 
    question: "How do you ensure product quality?", 
    answer: "Our quality approach includes rigorous supplier information assessment, product specification reviews, and clean handling procedures at every stage of sourcing and trade coordination." 
  }
];