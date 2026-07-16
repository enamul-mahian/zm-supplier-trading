import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BRAND_INFO } from '../shared/constants';
import { 
  Sparkles, 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Copy,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/atoms/Button';
import { InquiryCTASection } from '../components/organisms/InquiryCTASection';
import toast from 'react-hot-toast';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
    },
  },
};

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে ৬ নম্বর পেজ লেআউট অনুযায়ী আসল B2B ফলব্যাক ডাটাসমূহ
const DETAILED_FALLBACK_POSTS: Record<string, any> = {
  'global-food-supply-trends': {
    category: 'Industry News',
    title: 'Global Food Supply Trends in 2026',
    excerpt: 'An overview of the latest trends shaping the global food supply industry, including logistics and sourcing changes.',
    publishedAt: 'July 12, 2026',
    author: 'ZM Trade Desk',
    readTime: '5 min read',
    featuredImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>The global food supply chain in 2026 is experiencing unprecedented transformations, driven by shifting geopolitical landscapes, refined UK border custom controls, and a rising demand for clean, hygienic, and highly traceable sourcing networks.</p>
      
      <h3>1. Increased Focus on Cold Chain Integrity</h3>
      <p>B2B commercial buyers and supermarket chains are placing stricter parameters on cold chain transportation. From the initial sourcing port to the destination wholesale warehouse, keeping absolute temperature logs has transitioned from a premium preference to an essential compliance requirement.</p>
      
      <h3>2. Transition Towards Audited Sourcing</h3>
      <p>Vetted and audited supply networks have become the cornerstone of secure international trade. Companies are systematically eliminating fragmented broker channels in favour of direct, structured coordination with certified manufacturers who can guarantee consistent specifications and pristine packaging standards.</p>
      
      <h3>3. Freight Planning Optimisation</h3>
      <p>Rising logistical costs and container shortages have led procurement managers to adopt longer-term supply contracts. Rather than relying on volatile spot-market freight pricing, commercial entities are booking consolidated container allocations (FCL and LCL) months in advance to secure predictable shipping timelines.</p>
    `
  },
  'zm-supplier-trading-expands-product-range': {
    category: 'Company Update',
    title: 'ZM Supplier & Trading Expands Its Product Range',
    excerpt: 'We are excited to announce the expansion of our product portfolio to serve you better, offering more premium bulk options.',
    publishedAt: 'July 10, 2026',
    author: 'Management Team',
    readTime: '3 min read',
    featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>We are delighted to announce that ZM Supplier & Trading Ltd has officially expanded its public B2B product catalogue. In our commitment to serving commercial retailers, wholesale distributors, and the hospitality sector with premium quality, we have added three new highly requested supply categories.</p>
      
      <h3>1. Expanded Hospitality & Biodegradable Supplies</h3>
      <p>To support sustainable B2B practices, we are introducing a full range of food-safe biodegradable packaging, custom-designed cardboard containers, and hygienic catering disposables with optional private-label labelling.</p>
      
      <h3>2. Premium Grain Flour & Pulses</h3>
      <p>Our dry goods desk has finalized agreements with audited mills in Europe to import high-extraction wheat flour, organic baking grains, and bulk pulses under strict quality check guidelines.</p>
      
      <h3>3. Refined Bulk Cooking Oils</h3>
      <p>We have coordinated stable container allocations for refined sunflower oil and premium olive oil, available in commercial 200L steel drums and industrial canisters tailored to manufacturing buyers.</p>
    `
  },
  'best-practices-safe-food-import-export': {
    category: 'Trade Guide',
    title: 'Best Practices for Safe Food Import & Export',
    excerpt: 'Key practices to ensure smooth, compliant, and safe international trade. A structured guide for commercial buyers.',
    publishedAt: 'July 08, 2026',
    author: 'Compliance Desk',
    readTime: '6 min read',
    featuredImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Navigating cross-border food trade requires a disciplined approach to documentation, compliant product presentation, and robust hygiene standards. For commercial buyers and wholesalers, adhering to established best practices is vital to prevent costly customs delays.</p>
      
      <h3>1. Secure Flawless Documentation Early</h3>
      <p>One of the primary causes of port delays is incomplete paperwork. Importers must coordinate with trade managers to prepare precise proforma invoices, certificates of origin, detailed packing lists, and manufacturer specification sheets well before the vessel departs.</p>
      
      <h3>2. Mandate Hygienic Packaging Standards</h3>
      <p>Physical cargo protection is critical to preserve food safety. Ensure your sourcing contracts specify clean handling expectations, double-wrapped case protection, and sturdy palletization to withstand the movements of maritime or road freight transit.</p>
      
      <h3>3. Constant Specification Verifications</h3>
      <p>Avoid surprises upon cargo arrival by coordinating third-party specification checks (moisture limits, weight parameters, case counts) at the loading port. A structured pre-shipment audit saves time and protects commercial trust between parties.</p>
    `
  }
};

export const BlogDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // স্টেট ম্যানেজমেন্ট
  const [post, setPost] = useState<any | null>(null);
  const [relatedPosts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ফায়ারস্টোর থেকে ডায়নামিক ব্লগ পোস্ট লোডিং লাইফ সাইকেল
  useEffect(() => {
    const loadBlogPost = async () => {
      if (!slug) return;
      try {
        setLoading(true);

        const postsRef = collection(db, 'blogPosts');
        // স্লাগ মিলিয়ে ডায়নামিক কোয়েরি
        const q = query(
          postsRef,
          where('slug', '==', slug),
          where('status', '==', 'published'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          
          let publishedDate = 'Recent';
          if (data.publishedAt) {
            const date = data.publishedAt.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt);
            publishedDate = date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
          }

          setPost({
            id: docSnap.id,
            ...data,
            publishedAt: publishedDate
          });

          // রিলেটেড ৩টি আর্টিকেলস কোয়েরি
          const relatedQ = query(
            postsRef,
            where('status', '==', 'published'),
            where('category', '==', data.category),
            limit(4)
          );
          const relatedSnap = await getDocs(relatedQ);
          
          // টাইপস্ক্রিপ্ট টাইপ সেফটি ফিক্স করার জন্য ইমপোর্ট করা ডকুমেন্টকে as any কাস্টিং করা হয়েছে (Line 160)
          const list = relatedSnap.docs
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as any))
            .filter(p => p.slug !== slug)
            .slice(0, 3);
          setRelatedProducts(list);
        } else {
          // ডেটাবেস খালি বা অফলাইন থাকলে ফলব্যাক ডেটা লোড (Part 04, Section 15)
          const fallback = DETAILED_FALLBACK_POSTS[slug] || DETAILED_FALLBACK_POSTS['global-food-supply-trends'];
          setPost(fallback);
          
          // ফলব্যাক রিলেটেড আর্টিকেলস লোড (বর্তমান স্লাগ বাদে)
          const list = Object.keys(DETAILED_FALLBACK_POSTS)
            .filter(k => k !== slug)
            .map(k => ({ ...DETAILED_FALLBACK_POSTS[k], slug: k }))
            .slice(0, 3);
          setRelatedProducts(list);
        }
      } catch (error) {
        console.error('[BlogDetails Fetch Error]:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPost();
  }, [slug]);

  // লিঙ্ক কপি করার সোশ্যাল হেল্পার
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Article link copied to clipboard.');
  };

  if (loading) {
    return (
      <div className="premium-container px-4 py-24 animate-pulse">
        <div className="h-6 bg-brand-neutral-gray rounded w-1/4 mb-4" />
        <div className="h-10 bg-brand-neutral-gray rounded w-2/3 mb-10" />
        <div className="w-full h-80 bg-brand-neutral-gray rounded-card mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-brand-neutral-gray rounded w-full" />
          <div className="h-4 bg-brand-neutral-gray rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="premium-container px-4 py-24 text-center max-w-md mx-auto flex flex-col items-center">
        <AlertCircle className="w-14 h-14 text-brand-primary/10 mb-4" />
        <h1 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-2">Article Not Found</h1>
        <p className="text-sm text-brand-neutral-muted mb-6">The requested article is unavailable in our insights directory.</p>
        <Button to="/insights" variant="primary">Browse All Articles</Button>
      </div>
    );
  }

  return (
    <>
      {/* ডাইনামিক আর্টিকেল মেটা ট্যাগস এসইও সেটআপ (Part 04, Section 15, Step 08) */}
      <Helmet>
        <title>{post.title} | {BRAND_INFO.name} Insights</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://zmsupplier.co.uk/insights/${slug}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="w-full flex flex-col bg-brand-bg">
        
        {/* ব্রেডক্রাম্বস */}
        <nav aria-label="Breadcrumb" className="premium-container px-4 pt-6 text-xs font-semibold text-brand-neutral-muted uppercase tracking-wider select-none">
          <ol className="flex flex-wrap items-center space-x-2">
            <li><Link to="/" className="hover:text-brand-primary transition-colors">Home</Link></li>
            <li><span>/</span></li>
            <li><Link to="/insights" className="hover:text-brand-primary transition-colors">Insights</Link></li>
            <li><span>/</span></li>
            <li className="text-brand-primary" aria-current="page">{post.title}</li>
          </ol>
        </nav>

        {/* মেইন রিডিং এরিয়া (দ্বি-কলাম লেআউট) */}
        <section className="py-12 text-left relative overflow-hidden">
          <div className="premium-container px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* বাম কলাম: ডাইনামিক আর্টিকেল */}
            <article className="lg:col-span-8 flex flex-col text-left">
              {/* ব্যাক টু ক্যাটাগরি লিঙ্ক */}
              <Link 
                to="/insights" 
                className="inline-flex items-center text-xs font-bold text-brand-primary tracking-wider uppercase mb-5 hover:text-brand-accent-dark transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Back to Insights</span>
              </Link>

              {/* ক্যাটাগরি ও মেটাডাটা */}
              <span className="bg-brand-primary/5 text-brand-primary text-[10px] font-bold px-3 py-1 rounded-md w-fit mb-4 border border-brand-primary/10">
                {post.category}
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-5">
                {post.title}
              </h1>

              {/* পাবলিশ ডেট, অথর ও রিডিং টাইম মেটা স্ট্রিপ */}
              <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-brand-neutral-muted uppercase tracking-wider pb-6 border-b border-brand-neutral-border mb-8">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-brand-accent shrink-0" />
                  <span>{post.publishedAt}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-brand-accent shrink-0" />
                  <span>By {post.author || 'ZM Sourcing Desk'}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-brand-accent shrink-0" />
                  <span>{post.readTime || '4 min read'}</span>
                </div>
              </div>

              {/* লার্জ কোয়ালিটি ফিচারড ইমেজ */}
              <div className="w-full h-[260px] sm:h-[380px] md:h-[440px] rounded-card overflow-hidden border border-brand-neutral-border shadow-soft mb-8 bg-brand-neutral-gray">
                <img 
                  src={post.featuredImage?.secureUrl || post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* রিচ টেক্সট HTML রেন্ডারিং (Quill / Jodit sanitized - Part 04, Section 15) */}
              <div 
                className="prose prose-sm sm:prose max-w-none text-brand-neutral-muted leading-relaxed space-y-6 border-b border-brand-neutral-border pb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* সোশাল শেয়ারিং কন্ট্রোলস (কোনো ট্র্যাকার ছাড়া নিরাপদ) */}
              <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <span className="text-xs font-bold text-brand-neutral-charcoal uppercase tracking-widest flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-brand-primary" />
                  Share This Article
                </span>
                
                <div className="flex items-center space-x-2.5">
                  {/* LinkedIn */}
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  
                  {/* Twitter / X */}
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>

                  {/* Facebook */}
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>

                  {/* Copy Link */}
                  <button 
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                    aria-label="Copy Page Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </article>

            {/* ডান কলাম: সাইড কমার্শিয়াল সোর্সিং ব্যানার */}
            <aside className="lg:col-span-4 flex flex-col space-y-6 lg:sticky lg:top-24">
              <div className="bg-brand-bg-alt/60 p-6 rounded-card border border-brand-neutral-border shadow-soft text-left">
                <span className="text-[10px] font-extrabold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 uppercase tracking-wide inline-block mb-3">ZM Sourcing Desk</span>
                <h3 className="font-heading font-bold text-sm text-brand-neutral-charcoal mb-2">Need Sourcing Assistance?</h3>
                <p className="text-xs text-brand-neutral-muted leading-relaxed mb-5">
                  Are you planning a bulk commercial order or seeking private-label customisation? Discuss specifications directly with our trade managers.
                </p>
                <Button to="/request-quote" variant="primary" size="sm" fullWidth>
                  Request a Quote
                </Button>
              </div>
            </aside>

          </div>
        </section>

        {/* ৪. রিলেটেড আর্টিকেলস সেকশন (গাইডলাইন অনুযায়ী ৩টি আর্টিকেল - Part 04, Section 15) */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-white text-left border-b border-brand-neutral-border">
            <div className="premium-container px-4">
              <h2 className="text-2xl font-heading font-extrabold text-brand-neutral-charcoal mb-10 border-b border-brand-neutral-border pb-3">
                Related Sourcing Insights
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((rel) => (
                  <div
                    key={rel.slug}
                    className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft flex flex-col justify-between overflow-hidden h-full group"
                  >
                    <div className="w-full h-40 overflow-hidden bg-brand-neutral-gray relative">
                      <img 
                        src={rel.featuredImage?.secureUrl || rel.featuredImage || 'https://placehold.co/400x300/024e33/ffffff?text=Insights'} 
                        alt={rel.title}
                        className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between text-left">
                      <div>
                        <span className="text-[9px] font-extrabold text-brand-primary bg-brand-primary/5 border border-brand-primary/10 px-2 py-0.5 rounded uppercase mb-2 inline-block">
                          {rel.category}
                        </span>
                        <h3 className="font-heading font-bold text-sm sm:text-base text-brand-neutral-charcoal line-clamp-2 mb-1 group-hover:text-brand-primary transition-colors">
                          {rel.title}
                        </h3>
                        <p className="text-xs text-brand-neutral-muted line-clamp-2 leading-relaxed">
                          {rel.excerpt}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-brand-neutral-border/50 flex justify-end">
                        <Link 
                          to={`/insights/${rel.slug}`}
                          className="text-xs font-bold text-brand-primary flex items-center hover:text-brand-accent-dark transition-colors"
                        >
                          Read Article <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ৫. গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>
    </>
  );
};