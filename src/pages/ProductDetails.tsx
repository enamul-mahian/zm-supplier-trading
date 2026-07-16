import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  ShieldCheck, 
  Globe, 
  Truck, 
  FileText, 
  HelpCircle,
  CheckCircle,
  Package,
  Calendar,
  AlertCircle,
  ArrowRight // ইমপোর্ট তালিকায় যুক্ত করা হলো (টাইপ এরর ফিক্সড)
} from 'lucide-react';
import { fetchProductBySlug, fetchProductVariants, fetchPackagingOptions, fetchFAQs, fetchProducts } from '../services/firestore';
import { Product, ProductVariant, ProductPackagingOption, FAQ } from '../shared/types';
import { BRAND_INFO } from '../shared/constants';
import { Button } from '../components/atoms/Button';
import { useQuoteStore } from '../hooks/useQuoteStore';
import toast from 'react-hot-toast';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection';

// ডাইনামিক বাস্কেট অ্যাড করার সময় বায়ারের পছন্দ করা অপশনসমূহ সংরক্ষণ করতে রিয়েল B2B ফলব্যাক ডেটাবেস
const DETAILED_FALLBACK_PRODUCTS: Record<string, any> = {
  'premium-rice': {
    name: 'Premium Rice',
    code: 'ZST-RICE-001',
    category: 'Dry Goods',
    desc: 'Premium Basmati and long-grain rice available in wholesale bulk sacks.',
    longDesc: 'Our premium Basmati and long-grain rice are sourced from vetted mills in India and Pakistan. Known for their aromatic qualities and long-grain presentation, every batch undergoes extensive sorting to ensure low moisture and zero impurities before export.',
    moq: '1 Pallet (approx. 1,000 kg)',
    pkg: '25kg Sacks (40 sacks per pallet)',
    origin: 'India / Pakistan',
    shelfLife: '24 Months',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    privateLabel: true,
    internationalSupply: true,
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600'
    ],
    faqs: [
      { question: 'What is the MOQ for Basmati Rice?', answer: 'The minimum order quantity is 1 full pallet (approx. 1,000 kg) for UK supply, and container load for global export.' },
      { question: 'Do you offer private labelling for rice?', answer: 'Yes, we provide dynamic custom packaging and private labelling options on orders exceeding 5 metric tonnes.' }
    ]
  },
  'cooking-oil': {
    name: 'Cooking Oil',
    code: 'ZST-OIL-004',
    category: 'Food Products',
    desc: 'Refined sunflower oil, vegetable oil, and olive oil drums.',
    longDesc: 'High-quality cooking oil sourced from top-tier processing facilities. We coordinate supply in industrial drums and retail canisters, ensuring strict hygiene parameters and compliant labelling.',
    moq: '10 Drums (approx. 2,000L)',
    pkg: '200L Steel/HDPE Drums, or retail PET canisters',
    origin: 'Ukraine / Spain',
    shelfLife: '12 Months',
    storage: 'Store in airtight containers in dry, temperate areas.',
    privateLabel: true,
    internationalSupply: true,
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
    ],
    faqs: [
      { question: 'Can you supply cooking oil in custom canisters?', answer: 'Yes, we coordinate custom PET packaging in 1L, 3L, and 5L variants for private-label clients.' }
    ]
  }
};

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addProductSelection = useQuoteStore((state) => state.addProductSelection);

  // স্টেট ম্যানেজমেন্ট
  const [product, setProduct] = useState<any | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<ProductPackagingOption[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ইন্টারঅ্যাক্টিভ গ্যালারি ও মডাল স্টেট
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // ভ্যারিয়েন্ট সিলেকশন স্টেট
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedPackaging, setSelectedPackaging] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [enquiryNotes, setEnquiryNotes] = useState<string>('');

  // ডাইনামিক ডেটা লোডিং
  useEffect(() => {
    const loadProductData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setActiveImageIndex(0);
        
        // ১. ফায়ারস্টোর থেকে ডাইনামিক প্রোডাক্ট রেজোলিউশন
        const dbProduct = await fetchProductBySlug(slug);
        
        if (dbProduct) {
          setProduct(dbProduct);
          // রিলেটেড সাব-মডিউল লোডিং
          const [dbVars, dbPkg, dbFaqs, dbRelated] = await Promise.all([
            fetchProductVariants(dbProduct.id),
            fetchPackagingOptions(dbProduct.id),
            fetchFAQs({ productId: dbProduct.id }),
            fetchProducts({ categoryId: dbProduct.categoryId, limitCount: 4 })
          ]);
          setVariants(dbVars);
          setPackagingOptions(dbPkg);
          setFAQs(dbFaqs);
          setRelatedProducts(dbRelated.products.filter(p => p.slug !== slug));
        } else {
          // ২. ডাটাবেস খালি থাকলে ফলব্যাক ডেটা দিয়ে সচল রাখা হচ্ছে
          const fallbackData = DETAILED_FALLBACK_PRODUCTS[slug] || DETAILED_FALLBACK_PRODUCTS['premium-rice'];
          setProduct(fallbackData);
          setFAQs(fallbackData.faqs || []);
          // ফলব্যাক রিলেটেড প্রোডাক্ট লোড
          setRelatedProducts(
            Object.keys(DETAILED_FALLBACK_PRODUCTS)
              .filter(k => k !== slug)
              .map(k => ({ ...DETAILED_FALLBACK_PRODUCTS[k], slug: k }))
          );
        }
      } catch (error) {
        console.error('[ProductDetails load error]:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [slug]);

  if (loading) {
    return (
      <div className="premium-container px-4 py-24 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 h-[400px] bg-brand-neutral-gray rounded-card" />
          <div className="lg:col-span-7 space-y-6">
            <div className="h-5 bg-brand-neutral-gray rounded w-1/4" />
            <div className="h-10 bg-brand-neutral-gray rounded w-2/3" />
            <div className="h-4 bg-brand-neutral-gray rounded w-full" />
            <div className="h-4 bg-brand-neutral-gray rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="premium-container px-4 py-24 text-center max-w-md mx-auto flex flex-col items-center">
        <AlertCircle className="w-14 h-14 text-brand-primary/10 mb-4" />
        <h1 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-2">Product Not Found</h1>
        <p className="text-sm text-brand-neutral-muted mb-6">The requested product could not be located in our B2B catalogue.</p>
        <Button to="/products" variant="primary">Browse All Products</Button>
      </div>
    );
  }

  // বাস্কেটে রিকোয়ারমেন্ট সাবমিট করার হ্যান্ডলার (Part 05B, Rule 50)
  const handleAddToQuote = () => {
    // যদি ভ্যারিয়েন্ট বা প্যাকেজিং সিলেকশন আবশ্যক থাকে
    if (variants.length > 0 && !selectedVariant) {
      toast.error('Please select a product specification option.');
      return;
    }
    if (packagingOptions.length > 0 && !selectedPackaging) {
      toast.error('Please select a packaging format option.');
      return;
    }

    const selectedVarData = variants.find(v => v.id === selectedVariant);
    const selectedPkgData = packagingOptions.find(p => p.id === selectedPackaging);

    // B2B সিলেকশন স্ন্যাপশট প্রস্তুতকরণ (Part 05B, Rule 53)
    const selectionSnapshot = {
      productId: product.id || 'fallback-id',
      productName: product.name,
      productCode: product.code || product.productCode || 'ZST-PROD-FALLBACK',
      productSlug: slug || '',
      productImageUrl: product.images?.[0] || product.primaryImage?.secureUrl || null,
      
      variantId: selectedVariant,
      variantName: selectedVarData?.name || null,
      variantSku: selectedVarData?.sku || null,
      selectedAttributes: selectedVarData?.attributeValues || {},
      
      packagingOptionId: selectedPackaging,
      packagingName: selectedPkgData?.name || product.pkg || null,
      
      minimumOrderQuantity: selectedVarData?.minimumOrderQuantity || product.minimumOrderQuantity || null,
      minimumOrderUnit: selectedVarData?.minimumOrderUnit || product.minimumOrderUnit || 'Cartons',
      availabilityStatus: selectedVarData?.availabilityStatus || product.availabilityStatus || 'Available for Enquiry',
      
      requestedQuantity: quantity,
      requestedQuantityUnit: selectedVarData?.minimumOrderUnit || product.minimumOrderUnit || 'Units',
      notes: enquiryNotes.trim() !== '' ? enquiryNotes : null
    };

    addProductSelection(selectionSnapshot);
    toast.success(`${product.name} added to your Quotation List.`);
    navigate('/request-quote'); // সরাসরি কোটেশন পেজে বায়ারকে নিয়ে যাওয়া হবে (B2B Conversion Focus)
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | B2B Wholesale & Supply | {BRAND_INFO.name}</title>
        <meta name="description" content={product.desc} />
        <link rel="canonical" href={`https://zmsupplier.co.uk/products/${slug}`} />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* ১. অ্যাক্সেসিবল ব্রেডক্রাম্বস (Breadcrumbs - Part 05B, Rule 06) */}
        <nav aria-label="Breadcrumb" className="premium-container px-4 pt-6 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider select-none">
          <ol className="flex flex-wrap items-center space-x-2">
            <li><Link to="/" className="hover:text-brand-primary transition-colors">Home</Link></li>
            <li><span>/</span></li>
            <li><Link to="/products" className="hover:text-brand-primary transition-colors">Products</Link></li>
            <li><span>/</span></li>
            <li className="text-brand-primary" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* ২. প্রোডাক্ট মেইন ইনফরমেশন এরিয়া (দ্বি-কলাম লেআউট - Part 05B, Rule 05) */}
        <section className="py-12 text-left relative overflow-hidden">
          <div className="premium-container px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* বাম কলাম: অপ্টিমাইজড ইমেজ গ্যালারি (৫ কলাম ডেস্কটপে - Part 05B, Rule 07) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="w-full h-[320px] sm:h-[400px] rounded-card overflow-hidden border border-brand-neutral-border shadow-soft relative group bg-white">
                <img 
                  src={product.images?.[activeImageIndex] || product.primaryImage?.secureUrl || 'https://placehold.co/600x450/024e33/ffffff?text=ZM+Product'} 
                  alt={`${product.name} B2B Product main`} 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-4 right-4 p-2.5 rounded-lg bg-white/90 backdrop-blur-sm text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent shadow-soft transition-colors duration-300"
                  aria-label="Zoom Image"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* থাম্বনেইল রেল (১টির বেশি ইমেজ থাকলে প্রদর্শিত হবে - Part 05B, Rule 10) */}
              {(product.images?.length > 1 || product.galleryMediaIds?.length > 1) && (
                <div className="flex space-x-3 overflow-x-auto pb-1">
                  {(product.images || product.galleryMediaIds).map((imgUrl: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-300 ${
                        idx === activeImageIndex ? 'border-brand-primary shadow-soft scale-[1.02]' : 'border-brand-neutral-border opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`View thumbnail image ${idx + 1}`}
                    >
                      <img src={imgUrl} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ডান কলাম: প্রোডাক্ট আইডেন্টিটি, স্পেসিফিকেশন ও বাস্কেট সিটিএ (৭ কলাম - Part 05B, Rule 12) */}
            <div className="lg:col-span-7 flex flex-col">
              <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-2 inline-block">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
                {product.name}
              </h1>

              {/* প্রোডাক্ট কোড এবং সোর্সিং স্ট্যাটাস */}
              <div className="flex flex-wrap gap-3 items-center mb-6">
                <span className="bg-brand-secondary text-brand-accent text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md border border-brand-primary-light">
                  Code: {product.code || 'ZST-PROD-FALLBACK'}
                </span>
                <span className="bg-brand-primary/5 text-brand-primary text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-brand-primary/10">
                  <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                  {product.availabilityStatus || 'Available for Enquiry'}
                </span>
              </div>

              <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed mb-6 pb-6 border-b border-brand-neutral-border">
                {product.desc}
              </p>

              {/* ৩. ভ্যারিয়েন্ট এবং প্যাকেজিং ডাইনামিক সিলেকশন প্যানেল (Part 05B, Rule 23) */}
              <div className="flex flex-col space-y-6 pb-8 border-b border-brand-neutral-border">
                {/* কন্ডিশন ১: যদি প্রোডাক্ট ভ্যারিয়েন্টস থাকে */}
                {variants.length > 0 && (
                  <div>
                    <h3 className="text-xs font-extrabold text-brand-neutral-charcoal uppercase tracking-wider mb-3">
                      Select Specification
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant.id)}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                            selectedVariant === variant.id
                              ? 'bg-brand-primary text-white shadow-soft'
                              : 'bg-white border border-brand-neutral-border text-brand-neutral-muted hover:border-brand-primary/30'
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* কন্ডিশন ২: যদি প্যাকেজিং অপশনস থাকে */}
                {packagingOptions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-extrabold text-brand-neutral-charcoal uppercase tracking-wider mb-3">
                      Select Packaging Format
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {packagingOptions.map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackaging(pkg.id)}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                            selectedPackaging === pkg.id
                              ? 'bg-brand-primary text-white shadow-soft'
                              : 'bg-white border border-brand-neutral-border text-brand-neutral-muted hover:border-brand-primary/30'
                          }`}
                        >
                          {pkg.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ৪. কমার্শিয়াল প্যারামিটারস (MOQ, Packaging, Origin - Part 05B, Rule 27) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-bg-alt/80 p-5 rounded-xl border border-brand-neutral-border text-xs font-bold text-brand-neutral-charcoal">
                  <div className="flex justify-between border-b sm:border-b-0 sm:border-r border-brand-neutral-border/50 pb-2 sm:pb-0 sm:pr-4">
                    <span className="text-brand-neutral-muted uppercase">Min Order (MOQ):</span>
                    <span>{product.moq}</span>
                  </div>
                  <div className="flex justify-between sm:pl-4">
                    <span className="text-brand-neutral-muted uppercase">Standard Packaging:</span>
                    <span>{product.pkg}</span>
                  </div>
                </div>

                {/* ৫. বাস্কেট কন্ট্রোল এবং কাস্টম নোট এরিয়া */}
                <div className="flex flex-col gap-4">
                  <textarea
                    placeholder="Enter custom requirements (e.g. customised labelling, target destination, private label request)..."
                    value={enquiryNotes}
                    onChange={(e) => setEnquiryNotes(e.target.value)}
                    className="w-full h-24 border border-brand-neutral-border rounded-form p-4 text-xs focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  />

                  {/* কোটেশন অ্যাড এবং রিডাইরেক্ট বাটন (B2B conversion focus) */}
                  <Button 
                    onClick={handleAddToQuote}
                    variant="primary" 
                    size="lg"
                    fullWidth
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Request a B2B Quotation
                  </Button>
                </div>
              </div>

              {/* ৬. ট্রাস্ট ব্যাজেস (WCAG 2.1 AA) */}
              <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs font-bold text-brand-neutral-charcoal">
                <div className="flex flex-col items-center p-3 rounded-lg bg-white border border-brand-neutral-border">
                  <ShieldCheck className="w-5 h-5 text-brand-primary mb-1.5" />
                  <span>Quality Assured</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-white border border-brand-neutral-border">
                  <Globe className="w-5 h-5 text-brand-primary mb-1.5" />
                  <span>Traceable Origin</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-white border border-brand-neutral-border">
                  <Truck className="w-5 h-5 text-brand-primary mb-1.5" />
                  <span>Freight Planned</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ৩. স্পেসিফিকেশন ও বিবরণ সেকশন (Part 05B, Rule 35) */}
        <section className="py-16 bg-white text-left border-b border-brand-neutral-border">
          <div className="premium-container px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* কমার্শিয়াল স্পেসিফিকেশন (ডেস্কটপে ৭ কলাম) */}
            <div className="lg:col-span-7 flex flex-col text-left">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-6 border-b border-brand-neutral-charcoal pb-3 flex items-center gap-2">
                <FileText className="w-5.5 h-5.5 text-brand-primary" />
                Technical & Commercial Specifications
              </h2>
              <p className="text-sm text-brand-neutral-muted leading-relaxed mb-6">
                {product.longDesc || product.desc}
              </p>

              {/* স্পেসিফিকেশন টেবিল (খালি রো হাইড করার মেকানিজম সহ - Part 05B, Rule 35) */}
              <div className="border border-brand-neutral-border rounded-xl overflow-hidden shadow-soft">
                <table className="w-full text-xs sm:text-sm text-left">
                  <tbody>
                    {product.code && (
                      <tr className="border-b border-brand-neutral-border">
                        <td className="px-4 py-3 bg-brand-bg-alt font-bold text-brand-neutral-muted uppercase w-1/3">Product Code</td>
                        <td className="px-4 py-3 font-semibold text-brand-neutral-charcoal">{product.code}</td>
                      </tr>
                    )}
                    {product.category && (
                      <tr className="border-b border-brand-neutral-border">
                        <td className="px-4 py-3 bg-brand-bg-alt font-bold text-brand-neutral-muted uppercase">Category</td>
                        <td className="px-4 py-3 font-semibold text-brand-neutral-charcoal">{product.category}</td>
                      </tr>
                    )}
                    {product.origin && (
                      <tr className="border-b border-brand-neutral-border">
                        <td className="px-4 py-3 bg-brand-bg-alt font-bold text-brand-neutral-muted uppercase">Country of Origin</td>
                        <td className="px-4 py-3 font-semibold text-brand-neutral-charcoal">{product.origin}</td>
                      </tr>
                    )}
                    {product.shelfLife && (
                      <tr className="border-b border-brand-neutral-border">
                        <td className="px-4 py-3 bg-brand-bg-alt font-bold text-brand-neutral-muted uppercase">Shelf Life</td>
                        <td className="px-4 py-3 font-semibold text-brand-neutral-charcoal">{product.shelfLife}</td>
                      </tr>
                    )}
                    {product.storage && (
                      <tr className="border-b border-brand-neutral-border">
                        <td className="px-4 py-3 bg-brand-bg-alt font-bold text-brand-neutral-muted uppercase">Storage Guidance</td>
                        <td className="px-4 py-3 font-semibold text-brand-neutral-charcoal">{product.storage}</td>
                      </tr>
                    )}
                    {product.moq && (
                      <tr className="border-b border-brand-neutral-border">
                        <td className="px-4 py-3 bg-brand-bg-alt font-bold text-brand-neutral-muted uppercase">Wholesale MOQ</td>
                        <td className="px-4 py-3 font-semibold text-brand-neutral-charcoal">{product.moq}</td>
                      </tr>
                    )}
                    <tr className="border-b border-brand-neutral-border">
                      <td className="px-4 py-3 bg-brand-bg-alt font-bold text-brand-neutral-muted uppercase">Private Label Support</td>
                      <td className="px-4 py-3 font-semibold text-brand-neutral-charcoal">
                        {product.privateLabel ? 'Eligible for Customisation & Design Support' : 'Standard Sourcing Only'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* কোয়ালিটি ও লজিস্টিকস পলিসি নোট (ডেস্কটপে ৫ কলাম - Part 05B, Rule 39/41) */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              {/* কোয়ালিটি ফিলোসফি বক্স */}
              <div className="bg-brand-bg-alt/60 p-6 rounded-card border border-brand-neutral-border shadow-soft text-left">
                <h3 className="font-heading font-bold text-sm text-brand-primary mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-primary" />
                  Quality & Hygiene Focus
                </h3>
                <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                  {product.qualityNotes || 'We coordinate strict compliance with audited manufacturers and suppliers to implement controlled quality checking and clean presentation.'}
                </p>
              </div>

              {/* প্রাইভেট লেবেল ও প্যাকেজিং কাস্টমাইজেশন বক্স (সক্রিয় থাকলে প্রদর্শিত হবে - Part 05B, Rule 40) */}
              {product.privateLabel && (
                <div className="bg-brand-bg-alt/60 p-6 rounded-card border border-brand-neutral-border shadow-soft text-left">
                  <h3 className="font-heading font-bold text-sm text-brand-primary mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-primary" />
                    Private Label Eligible
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed">
                    Custom artwork, specialised packaging formats, and bespoke case sizes are available for this product. Sourcing specifications are coordinated on bulk contract evaluations.
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ৪. প্রোডাক্ট স্পেসিফিক এফএকিউ সিস্টেম (ডাইনামিক রেন্ডারিং - Part 05B, Rule 44/45) */}
        {faqs.length > 0 && (
          <section className="py-16 bg-brand-bg-alt text-left border-b border-brand-neutral-border">
            <div className="premium-container px-4 max-w-content mx-auto">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-8 border-b border-brand-neutral-border pb-3 flex items-center gap-2">
                <HelpCircle className="w-5.5 h-5.5 text-brand-primary" />
                Product Specific FAQs
              </h2>

              <div className="flex flex-col space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white border border-brand-neutral-border rounded-xl p-5 shadow-soft">
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

        {/* ৫. রিলেটেড বা বিকল্প প্রোডাক্টস গ্রিড (Part 05B, Rule 46/47) */}
        {relatedProducts.length > 0 && (
          <section className="py-16 bg-white text-left border-b border-brand-neutral-border">
            <div className="premium-container px-4">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-10 border-b border-brand-neutral-border pb-3">
                Related Commercial Supplies
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.slug}
                    className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft flex flex-col justify-between overflow-hidden h-full group"
                  >
                    <div className="w-full h-40 overflow-hidden bg-brand-neutral-gray relative">
                      <img 
                        src={rel.images?.[0] || rel.image || 'https://placehold.co/400x300/024e33/ffffff?text=ZM+Product'} 
                        alt={rel.name}
                        className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between text-left">
                      <div>
                        <h3 className="font-heading font-bold text-sm text-brand-neutral-charcoal line-clamp-1 mb-1 group-hover:text-brand-primary transition-colors">
                          {rel.name}
                        </h3>
                        <p className="text-xs text-brand-neutral-muted line-clamp-2 leading-relaxed">
                          {rel.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-brand-neutral-border/50 flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-brand-primary uppercase">MOQ: {rel.moq}</span>
                        <Link 
                          to={`/products/${rel.slug}`}
                          className="text-xs font-bold text-brand-primary flex items-center hover:text-brand-accent-dark transition-colors"
                        >
                          Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ৬. গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>

      {/* ৭. লাইটবক্স মডাল ভিউয়ার (WCAG 2.1 AA এবং পোর্ট্রেট লক সহ - Part 05B, Rule 11) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-300 z-50 focus-visible:ring-2 focus-visible:ring-brand-accent"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center">
              <img 
                src={product.images?.[activeImageIndex] || product.primaryImage?.secureUrl} 
                alt={`${product.name} zoom`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg border border-white/10" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};