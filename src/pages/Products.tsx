import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom'; // ফিক্স: useSearchParams ইমপোর্ট করা হলো
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Package, ShieldCheck, ChevronDown } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../services/firestore'; // ফিক্স: fetchCategories ইমপোর্ট করা হলো
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে ৫ নম্বর পেজের ইমেজে থাকা হুবহু ১২টি আসল B2B আইটেমের ডাটা
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

// পালস স্কেলেটন প্লেসহোল্ডার
const ProductSkeleton: React.FC = () => (
  <div className="bg-brand-surface rounded-card border border-brand-neutral-border p-5 h-[420px] animate-pulse overflow-hidden flex flex-col justify-between">
    <div className="w-full h-44 bg-brand-neutral-gray rounded-xl" />
    <div className="flex-grow flex flex-col justify-between mt-4">
      <div>
        <div className="h-4 bg-brand-neutral-gray rounded w-1/4 mb-2" />
        <div className="h-5 bg-brand-neutral-gray rounded w-2/3 mb-3" />
        <div className="h-4 bg-brand-neutral-gray rounded w-full mb-1" />
        <div className="h-4 bg-brand-neutral-gray rounded w-5/6" />
      </div>
      <div className="h-10 bg-brand-neutral-gray rounded w-full mt-4" />
    </div>
  </div>
);

export const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All Products']); // ডায়নামিক ক্যাটাগরি স্টেট
  const [loading, setLoading] = useState(true);

  // ফিল্টার ও সার্চ স্টেট
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Products');
  const [sortBy, setSortBy] = useState('Featured');
  const [searchParams] = useSearchParams(); // URL প্যারামিটার রিড করার হুক

  // ফায়ারস্টোর থেকে প্রোডাক্ট এবং ক্যাটাগরি ফেচিং
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);

        if (productsData && productsData.products.length > 0) {
          setProducts(productsData.products);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }

        if (categoriesData && categoriesData.length > 0) {
          setCategories(['All Products', ...categoriesData.map(c => c.name)]);
        } else {
          setCategories(['All Products', 'Packaged Foods', 'Beverages', 'Dry Goods', 'Hospitality Supplies']);
        }
      } catch (error) {
        console.error('[Products page load error]:', error);
        setProducts(FALLBACK_PRODUCTS);
        setCategories(['All Products', 'Packaged Foods', 'Beverages', 'Dry Goods', 'Hospitality Supplies']);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ইউআরএল ক্যাটাগরি কুয়েরি প্যারামিটার হ্যান্ডলার (URL সিঙ্ক)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const matchedTab = categories.find(
        cat => cat.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matchedTab) {
        setActiveTab(matchedTab);
      }
    }
  }, [searchParams, categories]);

  // সার্চ, ট্যাব ফিল্টারিং এবং সর্টিং লজিক (রিয়েল-টাইম ক্লায়েন্ট সাইড সিঙ্ক)
  useEffect(() => {
    let result = [...products];

    // ১. ক্যাটাগরি ট্যাব ফিল্টার (ডায়নামিক ক্যাটাগরি ম্যাচিং)
    if (activeTab !== 'All Products') {
      result = result.filter(
        product => product.category?.toLowerCase() === activeTab.toLowerCase()
      );
    }

    // ২. সার্চ কুয়েরি ফিল্টার
    if (searchQuery.trim() !== '') {
      const queryStr = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(queryStr) || 
          product.desc?.toLowerCase().includes(queryStr) ||
          product.category?.toLowerCase().includes(queryStr)
      );
    }

    // ৩. সর্টিং অ্যালগরিদম
    if (sortBy === 'Name A-Z') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Name Z-A') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProducts(result);
  }, [products, searchQuery, activeTab, sortBy]);

  return (
    <>
      <Helmet>
        <title>Our Products | {BRAND_INFO.name} | B2B Catalogue</title>
        <meta name="description" content="Browse our premium UK-standard B2B product catalogue including Basmati rice, flours, pulses, cooking oils, beverages, and industrial packaging supplies." />
        <link rel="canonical" href="https://zmsupplier.co.uk/products" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* মেইন পেজ হিরো ব্যানার */}
        <section className="bg-brand-secondary text-white py-16 text-left relative overflow-hidden border-b border-brand-secondary-dark">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-accent/5 blur-[80px] pointer-events-none" />
          
          <div className="premium-container relative z-10">
            <nav className="text-xs font-semibold text-brand-accent-pale uppercase tracking-widest mb-3 flex items-center space-x-2 select-none">
              <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
              <span>/</span>
              <span className="text-brand-accent">Products</span>
            </nav>
            <span className="text-brand-accent font-heading font-extrabold text-xs tracking-wider uppercase mb-2 inline-block">
              Our Products
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-4">
              Wide Range of Quality Products
            </h1>
            <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
              Explore authentic wholesale product supplies managed and structured according to premium British standards.
            </p>
          </div>
        </section>

        {/* ফিল্টারিং, সার্চ এবং সর্টিং কন্ট্রোল প্যানেল */}
        <section className="py-8 bg-brand-bg border-b border-brand-neutral-border text-left relative z-20">
          <div className="premium-container px-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              
              {/* সার্চ ইনপুট */}
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />}
                />
              </div>

              {/* সর্টিং সিলেকশন মেনু */}
              <div className="relative shrink-0 flex items-center space-x-3">
                <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">Sort By</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-brand-neutral-border rounded-form px-5 py-2.5 pr-10 text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
                  >
                    <option value="Featured">Featured</option>
                    <option value="Name A-Z">Name A-Z</option>
                    <option value="Name Z-A">Name Z-A</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-brand-neutral-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* ডায়নামিক ক্যাটাগরি ট্যাব */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pb-2 border-t border-brand-neutral-border/50 pt-6">
              {categories.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs sm:text-sm font-bold tracking-wide px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-brand-primary text-white shadow-soft'
                      : 'bg-brand-surface border border-brand-neutral-border text-brand-neutral-muted hover:border-brand-primary/30 hover:text-brand-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ক্যাটালগ প্রোডাক্ট গ্রিড এরিয়া */}
        <section className="py-16 bg-white text-left relative min-h-[400px]">
          <div className="premium-container px-4">
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full group"
                    variants={cardVariants}
                  >
                    <div className="w-full h-44 overflow-hidden relative border-b border-brand-neutral-border bg-brand-neutral-gray">
                      <img 
                        src={product.image || product.primaryImage?.secureUrl || 'https://placehold.co/400x300/024e33/ffffff?text=ZM+Product'} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-brand-secondary/90 backdrop-blur-sm text-brand-accent text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md border border-brand-primary-light">
                        {product.category}
                      </span>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between text-left">
                      <div>
                        <h3 className="font-heading font-bold text-base text-brand-neutral-charcoal mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-xs text-brand-neutral-muted leading-relaxed line-clamp-2">
                          {product.desc || product.shortDescription}
                        </p>
                        
                        <div className="mt-4 flex flex-col space-y-1.5 text-[11px] font-bold text-brand-neutral-charcoal">
                          <div className="flex justify-between border-b border-brand-neutral-border/50 pb-1">
                            <span className="text-brand-neutral-muted uppercase">Min Order:</span>
                            <span>{product.moq || product.minimumOrderQuantity || 'Upon Request'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-brand-neutral-muted uppercase">Packaging:</span>
                            <span>{product.pkg || product.packagingOptions || 'Export Carton'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 bg-brand-accent/5 border border-brand-accent/25 text-brand-primary text-xs font-bold text-center py-2 rounded-lg select-none">
                        Price Available on Request
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-brand-neutral-border/50">
                        <Link 
                          to={`/products/${product.slug}`}
                          className="w-full flex items-center justify-center border border-brand-primary/20 text-brand-primary text-xs font-bold py-2 rounded-lg hover:bg-brand-primary/5 transition-colors duration-300"
                        >
                          Details
                        </Link>
                        <Link 
                          to={`/request-quote?product=${product.slug}`}
                          className="w-full flex items-center justify-center bg-brand-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-brand-primary-dark transition-colors duration-300"
                        >
                          Enquire
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="max-w-md mx-auto text-center py-12 flex flex-col items-center">
                <div className="w-14 h-14 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 border border-brand-primary/10">
                  <Package className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-heading font-extrabold text-xl text-brand-neutral-charcoal mb-2">
                  No Products Found
                </h3>
                <p className="text-sm text-brand-neutral-muted leading-relaxed mb-6">
                  Can't find the product you need? Share your precise requirements with our team and we will review suitable sourcing options.
                </p>
                <Button to="/request-quote?type=custom" variant="primary" size="md">
                  Submit Sourcing Request
                </Button>
              </div>
            )}

          </div>
        </section>

        <InquiryCTASection />

      </div>
    </>
  );
};