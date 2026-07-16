import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Search, ArrowRight, BookOpen, Mail, ChevronDown } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { BRAND_INFO } from '../shared/constants'; // ইমপোর্ট তালিকায় যুক্ত করা হলো (টাইপ এরর ফিক্সড)
import toast from 'react-hot-toast';
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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে ৬ নম্বর পেজ লেআউট অনুযায়ী আসল B2B ফলব্যাক ডাটাসমূহ
const FALLBACK_POSTS = [
  {
    id: 'post-1',
    category: 'Industry News',
    title: 'Global Food Supply Trends in 2026',
    excerpt: 'An overview of the latest trends shaping the global food supply industry, including logistics and sourcing changes.',
    publishedAt: 'July 12, 2026',
    slug: 'global-food-supply-trends',
    featuredImage: {
      secureUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600'
    }
  },
  {
    id: 'post-2',
    category: 'Company Update',
    title: 'ZM Supplier & Trading Expands Its Product Range',
    excerpt: 'We are excited to announce the expansion of our product portfolio to serve you better, offering more premium bulk options.',
    publishedAt: 'July 10, 2026',
    slug: 'zm-supplier-trading-expands-product-range',
    featuredImage: {
      secureUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600'
    }
  },
  {
    id: 'post-3',
    category: 'Trade Guide',
    title: 'Best Practices for Safe Food Import & Export',
    excerpt: 'Key practices to ensure smooth, compliant, and safe international trade. A structured guide for commercial buyers.',
    publishedAt: 'July 08, 2026',
    slug: 'best-practices-safe-food-import-export',
    featuredImage: {
      secureUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600'
    }
  },
  {
    id: 'post-4',
    category: 'Procurement',
    title: 'Understanding Minimum Order Quantities (MOQ) in Global Sourcing',
    excerpt: 'A comprehensive guide for B2B buyers on how to negotiate and optimise Minimum Order Quantities with overseas manufacturers.',
    publishedAt: 'June 25, 2026',
    slug: 'understanding-minimum-order-quantities-moq',
    featuredImage: {
      secureUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'
    }
  },
  {
    id: 'post-5',
    category: 'Packaging',
    title: 'How Custom Packaging and Private Labelling Enhance Brand Equity',
    excerpt: 'Exploring the strategic value of custom cardboard containers, biodegradable packs, and branded labelling in hospitality and retail supply.',
    publishedAt: 'May 18, 2026',
    slug: 'custom-packaging-private-labelling-brand-equity',
    featuredImage: {
      secureUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&q=80&w=600'
    }
  }
];

// সিএলএস (CLS) মুক্ত করতে পালস স্কেলেটন প্লেসহোল্ডার
const BlogSkeleton: React.FC = () => (
  <div className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft h-[380px] animate-pulse overflow-hidden flex flex-col justify-between">
    <div className="w-full h-48 bg-brand-neutral-gray" />
    <div className="p-5 flex-grow flex flex-col justify-between">
      <div>
        <div className="h-4 bg-brand-neutral-gray rounded w-1/4 mb-3" />
        <div className="h-5 bg-brand-neutral-gray rounded w-5/6 mb-3" />
        <div className="h-4 bg-brand-neutral-gray rounded w-full mb-2" />
        <div className="h-4 bg-brand-neutral-gray rounded w-4/5" />
      </div>
      <div className="h-4 bg-brand-neutral-gray rounded w-1/3 mt-4" />
    </div>
  </div>
);

export const Insights: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ফিল্টার ও সার্চ স্টেট
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['All', 'Industry News', 'Company Update', 'Trade Guide', 'Procurement', 'Packaging'];

  // ফায়ারস্টোর থেকে অল ব্লগ পোস্ট কোয়েরি লাইফ সাইকেল
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setLoading(true);
        const postsRef = collection(db, 'blogPosts');
        // পাবলিশড পোস্টের জন্য লিমিটেড কুয়েরি
        const q = query(
          postsRef,
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          // টাইমস্ট্যাম্প ডেটা রিডেবল টেক্সটে কনভার্ট করা
          let publishedDate = 'Recent';
          if (data.publishedAt) {
            const date = data.publishedAt.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt);
            publishedDate = date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
          }
          return {
            id: docSnap.id,
            ...data,
            publishedAt: publishedDate
          };
        });

        if (list.length > 0) {
          setPosts(list);
        } else {
          setPosts(FALLBACK_POSTS);
        }
      } catch (error) {
        console.error('[Insights fetch error]:', error);
        setPosts(FALLBACK_POSTS);
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  // সার্চ এবং ক্যাটাগরি ফিল্টারিং মেকানিজম
  useEffect(() => {
    let result = [...posts];

    if (activeTab !== 'All') {
      result = result.filter(post => post.category?.toLowerCase() === activeTab.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        post => 
          post.title.toLowerCase().includes(q) || 
          post.excerpt?.toLowerCase().includes(q) ||
          post.category?.toLowerCase().includes(q)
      );
    }

    setFilteredPosts(result);
  }, [posts, searchQuery, activeTab]);

  // নিউজলেটার সাবস্ক্রিপশন সাবমিট হ্যান্ডলার (Part 04, Section 14)
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      toast.error('Please provide a valid business email address.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Thank you for subscribing to our B2B Insights newsletter.');
      setNewsletterEmail('');
      setSubmitting(false);
    }, 1500);
  };

  // প্রথম আর্টিকেলটিকে লার্জ ফিচারড হিসেবে বের করা
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <>
      {/* গ্লোবাল এবং ক্যাটালগ স্পেসিফিক এসইও মেটা ট্যাগস (Part 07, Rule 06) */}
      <Helmet>
        <title>Insights & B2B Sourcing Guides | {BRAND_INFO.name}</title>
        <meta name="description" content="Read expert analysis, procurement advice, packaging tips, and international supply chain planning guides from ZM Supplier & Trading." />
        <link rel="canonical" href="https://zmsupplier.co.uk/insights" />
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
              <span className="text-brand-accent">Insights</span>
            </nav>
            <span className="text-brand-accent font-heading font-extrabold text-xs tracking-wider uppercase mb-2 inline-block">
              Knowledge Hub
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white leading-tight mb-4">
              Insights & Sourcing Guides
            </h1>
            <p className="text-sm sm:text-base text-brand-accent-pale max-w-xl">
              Professional analysis, wholesale buying tips, international supply chain planning, and corporate updates.
            </p>
          </div>
        </section>

        {/* সার্চ, ক্যাটাগরি এবং ফিল্টার প্যানেল */}
        <section className="py-8 bg-brand-bg border-b border-brand-neutral-border text-left relative z-20">
          <div className="premium-container px-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              {/* সার্চ ইনপুট */}
              <div className="w-full md:w-80">
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />}
                />
              </div>
            </div>

            {/* ডায়নামিক ক্যাটাগরি ফিল্টার ট্যাব */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pb-2 border-t border-brand-neutral-border/50 pt-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`text-xs sm:text-sm font-bold tracking-wide px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === cat
                      ? 'bg-brand-primary text-white shadow-soft'
                      : 'bg-brand-surface border border-brand-neutral-border text-brand-neutral-muted hover:border-brand-primary/30 hover:text-brand-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ব্লগ লিস্ট এবং রিসেন্ট পোস্ট এরিয়া */}
        <section className="py-16 bg-white text-left relative min-h-[400px]">
          <div className="premium-container px-4">
            
            {loading ? (
              // ১. ডেটাবেস লোডিং স্কেলেটন গ্রিড
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="flex flex-col space-y-12">
                
                {/* ২. ১ নম্বর মেইন ফিচারড স্লাইড (প্রোডাকশন-গ্রেড লার্জ হরাইজন্টাল লেআউট) */}
                {featuredPost && activeTab === 'All' && searchQuery === '' && (
                  <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-brand-bg-alt/50 border border-brand-neutral-border rounded-card overflow-hidden p-6 sm:p-8 lg:p-10 group"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="lg:col-span-6 h-[260px] sm:h-[340px] rounded-xl overflow-hidden bg-brand-neutral-gray border border-brand-neutral-border">
                      <img 
                        src={featuredPost.featuredImage?.secureUrl} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="lg:col-span-6 flex flex-col justify-between text-left h-full">
                      <div className="space-y-4">
                        <span className="bg-brand-secondary text-brand-accent text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md border border-brand-primary-light w-fit inline-block">
                          {featuredPost.category}
                        </span>
                        <div className="flex items-center text-xs text-brand-neutral-muted font-bold uppercase tracking-wider space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                          <span>{featuredPost.publishedAt}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-tight group-hover:text-brand-primary transition-colors">
                          {featuredPost.title}
                        </h2>
                        <p className="text-sm text-brand-neutral-muted leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                      </div>
                      <div className="mt-8 pt-5 border-t border-brand-neutral-border/50">
                        <Link 
                          to={`/insights/${featuredPost.slug}`}
                          className="inline-flex items-center text-xs font-bold text-brand-primary tracking-wider uppercase hover:text-brand-accent-dark transition-colors"
                        >
                          <span>Read Featured Article</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ৩. সাব-আর্টিকেলস ২/৩ কলাম গ্রিড লেআউট */}
                {(activeTab !== 'All' || searchQuery !== '' ? filteredPosts : gridPosts).length > 0 && (
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                  >
                    {(activeTab !== 'All' || searchQuery !== '' ? filteredPosts : gridPosts).map((post) => (
                      <motion.div
                        key={post.id}
                        className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full group"
                        variants={cardVariants}
                      >
                        <div className="w-full h-48 overflow-hidden relative border-b border-brand-neutral-border bg-brand-neutral-gray">
                          <img 
                            src={post.featuredImage?.secureUrl || 'https://placehold.co/600x400/024e33/ffffff?text=Insights+News'} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 bg-brand-secondary/90 backdrop-blur-sm text-brand-accent text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border border-brand-primary-light">
                            {post.category}
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between text-left">
                          <div>
                            <div className="flex items-center text-[11px] font-bold text-brand-neutral-muted mb-2.5 space-x-1.5 uppercase tracking-wider">
                              <Calendar className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                              <span>{post.publishedAt}</span>
                            </div>
                            <h3 className="font-heading font-bold text-sm sm:text-base md:text-lg text-brand-neutral-charcoal leading-snug mb-3 group-hover:text-brand-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed line-clamp-3">
                              {post.excerpt}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-brand-neutral-border/50">
                            <Link 
                              to={`/insights/${post.slug}`}
                              className="inline-flex items-center text-xs font-bold text-brand-primary tracking-wider uppercase group-hover:text-brand-accent-dark transition-colors"
                            >
                              <span>Read Article</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

              </div>
            ) : (
              // ৪. নো-রেজাল্ট খালি স্টেট
              <div className="max-w-md mx-auto text-center py-12 flex flex-col items-center">
                <div className="w-14 h-14 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 border border-brand-primary/10">
                  <BookOpen className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-brand-neutral-charcoal mb-2">No Articles Found</h3>
                <p className="text-sm text-brand-neutral-muted leading-relaxed mb-6">No articles matched your search query. Please clear your query or explore other categories.</p>
                <Button onClick={() => { setSearchQuery(''); setActiveTab('All'); }} variant="primary" size="md">
                  Reset Filters
                </Button>
              </div>
            )}

          </div>
        </section>

        {/* ৫. ইমেল নিউজলেটার সাবস্ক্রিপশন ব্যানার (Part 04, Section 14) */}
        <section className="py-12 bg-white text-left border-b border-brand-neutral-border relative overflow-hidden">
          <div className="premium-container px-4">
            <div className="bg-brand-secondary text-white rounded-card shadow-soft p-8 sm:p-10 md:p-12 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8">
              
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-accent/5 blur-[80px]" />
              
              {/* সাবস্ক্রিপশন কন্টেন্ট */}
              <div className="text-left max-w-xl">
                <span className="text-brand-accent font-heading font-extrabold text-[10px] tracking-wider uppercase mb-2 inline-block">Newsletter</span>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white mb-3">
                  Subscribe to B2B Sourcing Updates
                </h2>
                <p className="text-xs sm:text-sm text-brand-accent-pale leading-relaxed">
                  Stay updated with our latest wholesale supplies, export guidelines, and trade compliance tips delivered straight to your business inbox.
                </p>
              </div>

              {/* সাবস্ক্রিপশন ফর্ম */}
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-3 shrink-0 relative z-10">
                <div className="w-full sm:w-64 md:w-80">
                  <input
                    type="email"
                    placeholder="Enter business email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="w-full px-5 py-3 h-11 border border-brand-primary-light/35 bg-white text-brand-neutral-charcoal rounded-form text-sm placeholder:text-brand-neutral-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
                  />
                </div>
                <Button type="submit" variant="warning" size="md" isLoading={submitting} className="h-11 shrink-0">
                  <Mail className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* ৬. গ্লোবাল বিটুবি ইনকোয়ারি সিটিএ প্যানেল (রিসাইক্লিং) */}
        <InquiryCTASection />

      </div>
    </>
  );
};