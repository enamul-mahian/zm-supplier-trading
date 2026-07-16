import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Button } from '../atoms/Button';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
  }
];

// সিএলএস (CLS) মুক্ত করতে পালস স্কেলেটন প্লেসহোল্ডার
const BlogSkeleton: React.FC = () => (
  <div className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft h-[420px] animate-pulse overflow-hidden flex flex-col justify-between">
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

export const InsightsSection: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ফায়ারস্টোর থেকে রিসেন্ট ৩টি ব্লগ পোস্ট কোয়েরি লাইফ সাইকেল
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const postsRef = collection(db, 'blogPosts');
        // পাবলিশড পোস্টের জন্য লিমিটেড কুয়েরি
        const q = query(
          postsRef,
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc'),
          limit(3)
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
        console.error('[InsightsSection fetch error]:', error);
        setPosts(FALLBACK_POSTS);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-brand-bg-alt text-left relative overflow-hidden border-b border-brand-neutral-border">
      
      {/* ব্যাকগ্রাউন্ড গোল্ডেন ফ্লেয়ার */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[100px] pointer-events-none" />

      <div className="premium-container">
        
        {/* সেকশন হেডার */}
        <div className="max-w-xl mb-12 lg:mb-16">
          <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-3 inline-block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            Insights & News
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[40px] font-heading font-extrabold text-brand-neutral-charcoal leading-tight mb-4">
            Insights for Smarter Sourcing Decisions
          </h2>
          <p className="text-sm sm:text-base text-brand-neutral-muted leading-relaxed">
            Stay updated with the latest B2B procurement advice, trade coordination trends, and expert wholesale industry guides.
          </p>
        </div>

        {/* ৩-কলাম বিশিষ্ট নিউজ ও ব্লগ কন্টেইনার */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {posts.map((post) => (
              <motion.div
                key={post.id || post.slug}
                className="bg-brand-surface rounded-card border border-brand-neutral-border shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full group"
                variants={cardVariants}
              >
                {/* ব্লগ কার্ড ব্যানার ইমেজ (Part 02 - border radius '20px'/'rounded-card' অনুযায়ী ক্রপ) */}
                <div className="w-full h-48 overflow-hidden relative border-b border-brand-neutral-border bg-brand-neutral-gray">
                  <img 
                    src={post.featuredImage?.secureUrl || 'https://placehold.co/600x400/024e33/ffffff?text=Insights+News'} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* কাস্টম ক্যাটাগরি ফ্লোটিং ব্যাজ */}
                  <div className="absolute top-3 left-3 bg-brand-secondary/90 backdrop-blur-sm text-brand-accent text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-soft border border-brand-primary-light">
                    {post.category}
                  </div>
                </div>

                {/* ডেসক্রিপশন কন্টেইনার */}
                <div className="p-5 flex-grow flex flex-col justify-between text-left">
                  <div>
                    {/* ডেট ইন্ডিকেটর */}
                    <div className="flex items-center text-[11px] font-bold text-brand-neutral-muted mb-2.5 space-x-1.5 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                      <span>{post.publishedAt}</span>
                    </div>

                    {/* ব্লগ টাইটেল */}
                    <h3 className="font-heading font-bold text-base sm:text-lg text-brand-neutral-charcoal leading-snug mb-3 group-hover:text-brand-primary transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* ব্লগ সারসংক্ষেপ */}
                    <p className="text-xs sm:text-sm text-brand-neutral-muted leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* রিড মোর লিঙ্ক অ্যাকশন */}
                  <div className="mt-6 pt-4 border-t border-brand-neutral-border/50">
                    <Link 
                      to={`/insights/${post.slug}`}
                      className="inline-flex items-center text-xs font-bold text-brand-primary tracking-wider uppercase group-hover:text-brand-accent-dark transition-colors duration-300"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* গ্লোবাল নিউজ ভিউ অল অ্যাকশন বাটন */}
        <div className="mt-12 text-center">
          <Button to="/insights" variant="outline" size="md">
            View All Articles
          </Button>
        </div>

      </div>
    </section>
  );
};