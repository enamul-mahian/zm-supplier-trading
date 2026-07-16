import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Package, 
  ShieldCheck, 
  HelpCircle, 
  AlertCircle,
  Clock,
  Globe,
  FileText
} from 'lucide-react';
import { fetchCategories, fetchProducts, fetchFAQs } from '../services/firestore';
import { ProductCategory, Product, FAQ } from '../shared/types';
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 80,
    },
  },
};

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে ৪টি প্রধান ক্যাটাগরির আসল B2B ফলব্যাক ডাটাসমূহ
const DETAILED_FALLBACK_CATEGORIES: Record<string, any> = {
  'packaged-foods': {
    id: 'cat-packaged-foods',
    name: 'Packaged Foods',
    desc: 'High-quality preserved food products, canned items, and grocery pantry supplies.',
    longDesc: 'Our Packaged Foods category comprises a wide selection of hygienically preserved goods, canned vegetables, shelf-stable grocery items, and premium pantry staples. We coordinate with accredited UK and international manufacturers to ensure all packaging meets rigorous shelf-life and safety standards.',
    bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
    seoDesc: 'Explore premium wholesale packaged foods and canned pantry supplies sourced for commercial buyers.'
  },
  'beverages': {
    id: 'cat-beverages',
    name: 'Beverages',
    desc: 'Premium juices, mineral waters, soft drinks, tea leaf selections, and coffee.',
    longDesc: 'The Beverages category features premium mineral waters, natural fruit juices, carbonated soft drinks, as well as selected loose tea leaves and roasted coffee beans. Sourced to satisfy high-volume requirements of hospitality, retail, and catering businesses.',
    bannerImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=1200',
    seoDesc: 'Wholesale beverages, premium mineral water, juices, and loose teas for commercial trade.'
  },
  'dry-goods': {
    id: 'cat-dry-goods',
    name: 'Dry Goods',
    desc: 'Authentic Basmati rice, pulses, wheat flour, and premium organic spices.',
    longDesc: 'Our Dry Goods portfolio includes bulk staples such as long-grain Basmati rice, high-extraction wheat flour, versatile pulses, and pure ground spices. We ensure dry, climate-controlled shipping and packaging to preserve quality during transit.',
    bannerImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1200',
    seoDesc: 'Source wholesale dry goods, bulk Basmati rice, grain flours, and organic spices.'
  },
  'hospitality-supplies': {
    id: 'cat-hospitality',
    name: 'Hospitality Supplies',
    desc: 'Disposable packaging, commercial kitchen containers, and hygienic supplies.',
    longDesc: 'A specialised range of commercial-grade disposable packaging, biodegradable food containers, hotel amenities, and professional cleaning supplies. Ideal for restaurants, catering services, and accommodation providers.',
    bannerImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=1200',
    seoDesc: 'Professional hospitality supplies, biodegradable containers, and disposable packaging in bulk.'
  }
};

// ক্যাটালগ পেজ থেকে আনা ১২টি প্রোডাক্টের ডাটা (ক্যাটাগরি রিলেশন ফিল্টার করার জন্য)
const FALLBACK_PRODUCTS = [
  { id: 'p1', name: 'Premium Rice', category: 'Dry Goods', slug: 'premium-rice', desc: 'Premium Basmati and long-grain rice available in wholesale bulk sacks.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: '25kg Sacks' },
  { id: 'p2', name: 'Organic Pulses', category: 'Food Products', slug: 'organic-pulses', desc: 'Lentils, chickpeas, and beans sourced from verified global farms.', image: 'https://images.unsplash.com/photo-1547058886-f3edd4136365?auto=format&fit=crop&q=80&w=400', moq: '500 kg', pkg: 'Bulk Bags' },
  { id: 'p3', name: 'Wheat Flour', category: 'Food Products', slug: 'wheat-flour', desc: 'UK-standard wheat and grain flour for bakeries and manufacture.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: '25kg Bags' },
  { id: 'p4', name: 'Cooking Oil', category: 'Food Products', slug: 'cooking-oil', desc: 'Refined sunflower oil, vegetable oil, and olive oil drums.', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400', moq: '10 Drums', pkg: '200L Drums' },
  { id: 'p5', name: 'Refined Sugar', category: 'Food Products', slug: 'refined-sugar', desc: 'Granulated white and brown sugar in industrial packaging.', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: '25kg Bags' },
  { id: 'p6', name: 'Wholesale Spices', category: 'Food Products', slug: 'wholesale-spices', desc: 'Authentic raw and ground spices arranged for professional trade.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400', moq: '250 kg', pkg: 'Cartons' },
  { id: 'p7', name: 'Tea & Coffee', category: 'Beverages', slug: 'tea-coffee', desc: 'Premium black tea leaves, green tea, and roasted coffee beans.', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400', moq: '100 kg', pkg: 'Bulk Cases' },
  { id: 'p8', name: 'Canned Products', category: 'Food Products', slug: 'canned-products', desc: 'Hygienically preserved and packaged canned fruits, vegetables, and pulps.', image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=400', moq: '50 Cases', pkg: 'Cases' },
  { id: 'p9', name: 'Dairy Products', category: 'Food Products', slug: 'dairy-products', desc: 'UHT milk, bulk milk powder, and commercial butter blocks.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: 'Industrial Packaging' },
  { id: 'p10', name: 'Packaged Snacks', category: 'Food Products', slug: 'packaged-snacks', desc: 'Packaged wholesale savoury and sweet snack items for retail.', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&q=80&w=400', moq: '50 Cases', pkg: 'Cases' },
  { id: 'p11', name: 'Beverages', category: 'Beverages', slug: 'beverages', desc: 'Fruit juices, mineral water, and carbonated soft drinks.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400', moq: '1 Pallet', pkg: 'Shrink Cases' },
  { id: 'p12', name: 'Packaging Items', category: 'Packaging', slug: 'packaging-items', desc: 'Hygienic disposables, biodegradable boxes, and B2B packaging supplies.', image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400', moq: '100 Cartons', pkg: 'Cartons' }
];

// স্কেলেটন পালস লোডার
const CategorySkeleton: React.FC = () => (
  <div className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft h-[360px] animate-pulse overflow-hidden flex flex-col justify-between">
    <div className="w-full h-44 bg-brand-neutral-gray" />
    <div className="p-5 flex-grow flex flex-col justify-between">
      <div>
        <div className="h-5 bg-brand-neutral-gray rounded w-2/3 mb-3" />
        <div className="h-4 bg-brand-neutral-gray rounded w-full mb-2" />
        <div className="h-4 bg-brand-neutral-gray rounded w-5/6" />
      </div>
      <div className="h-4 bg-brand-neutral-gray rounded w-1/3 mt-4" />
    </div>
  </div>
);

export const CategoryDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // স্টেট ম্যানেজমেন্ট
  const [category, setCategory] = useState<any | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryDetails = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        
        // ১. ফায়ারস্টোর থেকে ক্যাটাগরি ডেটা রেজোলিউশন
        const categories = await fetchCategories();
        const foundCategory = categories.find(c => c.slug === slug);

        if (foundCategory) {
          setCategory(foundCategory);
          // ফায়ারস্টোর থেকে প্রোডাক্ট লোড
          const dbProductsResult = await fetchProducts({ categoryId: foundCategory.id });
          setCategoryProducts(dbProductsResult.products);
          
          // ক্যাটাগরি পেজের এফএকিউ লোড
          const dbFaqs = await fetchFAQs({ pageId: `category-${foundCategory.slug}` });
          setFAQs(dbFaqs);
        } else {
          // ২. ডেটাবেস খালি বা অফলাইন থাকলে ফলব্যাক ডেটা ইন্টিগ্রেশন
          const fallbackCategory = DETAILED_FALLBACK_CATEGORIES[slug];
          if (fallbackCategory) {
            setCategory(fallbackCategory);
            
            // ফলব্যাক প্রোডাক্ট লিস্ট ফিল্টার
            const filtered = FALLBACK_PRODUCTS.filter(product => {
              if (slug === 'packaged-foods') return product.category === 'Food Products';
              return product.category.toLowerCase().replace(' products', '').replace(' ', '-') === slug;
            });
            setCategoryProducts(filtered);
            setFAQs([]);
          }
        }
      } catch (error) {
        console.error('[CategoryDetails load error]:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="premium-container px-4 py-24 animate-pulse">
        <div className="h-[200px] bg-brand-neutral-gray rounded-card mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CategorySkeleton />
          <CategorySkeleton />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="premium-container px-4 py-24 text-center max-w-md mx-auto flex flex-col items-center">
        <AlertCircle className="w-14 h-14 text-brand-primary/10 mb-4" />
        <h1 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-2">Category Not Found</h1>
        <p className="text-sm text-brand-neutral-muted mb-6">The requested product category is unavailable in our B2B directory.</p>
        <Button to="/products" variant="primary">View All Products</Button>
      </div>
    );
  }

  return (
    <>
      {/* ক্যাটাগরি এসইও মেটা ট্যাগস */}
      <Helmet>
        <title>{category.name} Wholesale Sourcing | {BRAND_INFO.name}</title>
        <meta name="description" content={category.seoDesc || category.desc} />
        <link rel="canonical" href={`https://zmsupplier.co.uk/categories/${slug}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* ১. ব্রেডক্রাম্বস */}
        <nav aria-label="Breadcrumb" className="premium-container px-4 pt-6 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider select-none">
          <ol className="flex flex-wrap items-center space-x-2">
            <li><Link to="/" className="hover:text-brand-primary transition-colors">Home</Link></li>
            <li><span>/</span></li>
            <li><Link to="/products" className="hover:text-brand-primary transition-colors">Products</Link></li>
            <li><span>/</span></li>
            <li className="text-brand-primary" aria-current="page">{category.name}</li>
          </ol>
        </nav>

        {/* ২. ক্যাটাগরি হিরো ব্যানার */}
        <section className="premium-container px-4 py-12 text-left relative overflow-hidden">
          <div className="w-full rounded-card overflow-hidden shadow-premium border border-brand-neutral-border relative h-[220px] sm:h-[260px] md:h-[300px] bg-brand-secondary">
            <img 
              src={category.bannerImage || category.cardImage?.secureUrl} 
              alt={`${category.name} B2B Category Banner`} 
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-brand-secondary/80 to-transparent flex flex-col justify-center p-6 sm:p-10 lg:p-12 text-left">
              <span className="text-brand-accent font-heading font-extrabold text-xs tracking-wider uppercase mb-2 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Category Directory
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white leading-tight mb-3">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm text-brand-accent-pale max-w-xl leading-relaxed">
                {category.desc}
              </p>
            </div>
          </div>
        </section>

        {/* ৩. ক্যাটাগরি বিবরণ ও গাইডলাইন */}
        <section className="py-12 bg-white border-b border-brand-neutral-border text-left relative overflow-hidden">
          <div className="premium-container px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 flex flex-col">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-4">
                B2B Sourcing Overview
              </h2>
              <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-6">
                {category.longDesc}
              </p>
              <div className="bg-brand-bg-alt p-5 rounded-xl border border-brand-neutral-border text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                <h4 className="font-heading font-bold text-brand-neutral-charcoal mb-2">Sourcing & Commercial Guidelines:</h4>
                Our trade managers assist wholesale buyers with customized container routing, freight planning, and labelling compliant with UK and international trade requirements.
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="bg-brand-bg-alt/60 p-6 rounded-card border border-brand-neutral-border shadow-soft text-left">
                <h3 className="font-heading font-bold text-sm text-brand-primary mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-primary" />
                  Quality Assured Logistics
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                  Every consignment under this category undergoes strict handling monitoring, packaging evaluation, and temperature control planning where applicable.
                </p>
              </div>
              <div className="bg-brand-bg-alt/60 p-6 rounded-card border border-brand-neutral-border shadow-soft text-left">
                <h3 className="font-heading font-bold text-sm text-brand-primary mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-primary" />
                  Private Label Configurations
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                  Bespoke packaging, retail pack sizes, and customized brand design support are eligible for these wholesale supplies based on volume specifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ৪. ক্যাটাগরি নির্দিষ্ট প্রোডাক্ট গ্রিড */}
        <section className="py-16 bg-brand-bg text-left border-b border-brand-neutral-border">
          <div className="premium-container px-4">
            
            <div className="mb-10 text-left border-b border-brand-neutral-border/50 pb-4">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal">
                Available Supplies under {category.name}
              </h2>
              <p className="text-xs sm:text-sm text-brand-neutral-muted mt-1">
                Explore our commercial wholesale listings currently verified and published under this category.
              </p>
            </div>

            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full group"
                  >
                    <div className="w-full h-44 overflow-hidden bg-brand-neutral-gray relative border-b border-brand-neutral-border">
                      <img 
                        src={product.image || product.primaryImage?.secureUrl || 'https://placehold.co/400x300/024e33/ffffff?text=ZM+Product'} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between text-left">
                      <div>
                        <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-brand-neutral-muted leading-relaxed line-clamp-2">
                          {product.desc || product.shortDescription}
                        </p>

                        <div className="mt-4 flex flex-col space-y-1.5 text-[11px] font-bold text-brand-neutral-charcoal bg-brand-bg-alt/80 px-3 py-2 rounded-lg border border-brand-neutral-border">
                          <div className="flex justify-between border-b border-brand-neutral-border/30 pb-1">
                            <span className="text-brand-neutral-muted uppercase">Min Order:</span>
                            <span>{product.moq}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-brand-neutral-muted uppercase">Packaging:</span>
                            <span>{product.pkg}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-brand-neutral-border/50">
                        <Link 
                          to={`/products/${product.slug}`}
                          className="w-full flex items-center justify-center border border-brand-primary/20 text-brand-primary text-xs font-bold py-2 rounded-lg hover:bg-brand-primary/5 transition-colors"
                        >
                          Details
                        </Link>
                        <Link 
                          to={`/request-quote?product=${product.slug}`}
                          className="w-full flex items-center justify-center bg-brand-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-brand-primary-dark transition-colors"
                        >
                          Enquire
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center py-12 flex flex-col items-center">
                <div className="w-14 h-14 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 border border-brand-primary/10">
                  <Package className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-brand-neutral-charcoal mb-2">
                  No Active Supplies Listed
                </h3>
                <p className="text-sm text-brand-neutral-muted leading-relaxed mb-6">
                  Products under this category may be available through custom sourcing. Share your requirements with our trade team.
                </p>
                <Button to={`/request-quote?category=${slug}`} variant="primary" size="md">
                  Submit Custom Sourcing Enquiry
                </Button>
              </div>
            )}

          </div>
        </section>

        {/* ৫. এফএকিউ ব্লক */}
        {faqs.length > 0 && (
          <section className="py-16 bg-white text-left border-b border-brand-neutral-border">
            <div className="premium-container px-4 max-w-content mx-auto">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-8 border-b border-brand-neutral-border pb-3 flex items-center gap-2">
                <HelpCircle className="w-5.5 h-5.5 text-brand-primary" />
                Category Specific FAQs
              </h2>
              <div className="flex flex-col space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-brand-bg-alt/50 border border-brand-neutral-border rounded-xl p-5 shadow-soft">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-brand-neutral-charcoal mb-2">
                      Q: {faq.question}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ৬. গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>
    </>
  );
};

export default CategoryDetails;