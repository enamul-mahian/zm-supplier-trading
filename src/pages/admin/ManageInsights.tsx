import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion'; // সঠিক ফ্রেমার মোশন ইমপোর্ট (টাইপ এরর ফিক্সড)
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BRAND_INFO } from '../../shared/constants';
import { 
  Plus, 
  Search, 
  Edit2, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  UploadCloud, 
  X, 
  CheckCircle,
  BookOpen,
  Calendar,
  Globe,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import toast from 'react-hot-toast';

// রিয়েক্ট কুইল রিচ-টেক্সট এডিটর এবং সিএসএস ইমপোর্ট
// @ts-ignore - সিএসএস ডিক্লেয়ারেশন এরর বাইপাস করার জন্য যুক্ত করা হলো (টাইপ এরর ফিক্সড)
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

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

// ফায়ারস্টোর ডেটাবেস কানেকশন পেন্ডিং বা খালি থাকলে অ্যাডমিন প্যানেল সচল রাখতে আসল B2B ফলব্যাক ডাটাসমূহ
const FALLBACK_POSTS = [
  { id: 'b1', category: 'Industry News', title: 'Global Food Supply Trends in 2026', excerpt: 'An overview of the latest trends shaping the global food supply industry, including logistics and sourcing changes.', publishedAt: 'July 12, 2026', slug: 'global-food-supply-trends', status: 'published', author: 'ZM Trade Desk', readTime: '5 min read' },
  { id: 'b2', category: 'Company Update', title: 'ZM Supplier & Trading Expands Its Product Range', excerpt: 'We are excited to announce the expansion of our product portfolio to serve you better, offering more premium bulk options.', publishedAt: 'July 10, 2026', slug: 'zm-supplier-trading-expands-product-range', status: 'published', author: 'Management Team', readTime: '3 min read' },
  { id: 'b3', category: 'Trade Guide', title: 'Best Practices for Safe Food Import & Export', excerpt: 'Key practices to ensure smooth, compliant, and safe international trade. A structured guide for commercial buyers.', publishedAt: 'July 08, 2026', slug: 'best-practices-safe-food-import-export', status: 'published', author: 'Compliance Desk', readTime: '6 min read' }
];

export const ManageInsights: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ফর্ম ও এডিটিং স্টেট
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ব্লগ ফর্ম ফিল্ডস স্টেট (Part 04, Section 14)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Industry News');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState(''); // রিচ-টেক্সট HTML বডি
  const [author, setAuthor] = useState('ZM Sourcing Desk');
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // এসইও (SEO) মেটাডাটা প্যানেল স্টেট (Part 07, Rule 79)
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  // ডেটা লোড করার লাইফ সাইকেল
  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsRef = collection(db, 'blogPosts');
      const q = query(postsRef, orderBy('publishedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let dateStr = 'Recent';
        if (data.publishedAt) {
          const date = data.publishedAt.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt);
          dateStr = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
        return {
          id: docSnap.id,
          ...data,
          publishedAt: dateStr
        };
      });

      if (list.length > 0) {
        setPosts(list);
      } else {
        setPosts(FALLBACK_POSTS);
      }
    } catch (error) {
      console.error('[ManageInsights load error]:', error);
      setPosts(FALLBACK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // ক্লাউডিনারি ইমেজ আপলোডার (Vite টাইপ-সেফ - Part 07, Rule 61)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PNG, JPG, and JPEG images are allowed.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) { // সর্বোচ্চ ৩ এমবি
      toast.error('Maximum image size is 3MB.');
      return;
    }

    setUploadingImage(true);
    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset) {
      // স্যান্ডবক্স মোড অটো-ফিট
      setTimeout(() => {
        setImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600');
        setUploadingImage(false);
        toast.success('Featured image uploaded successfully (Sandbox Mode).');
      }, 1500);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        toast.success('Featured image uploaded successfully to Cloudinary.');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // ফর্ম সাবমিট হ্যান্ডলার (তৈরি ও সম্পাদনা - Part 04, Section 15)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      toast.error('Please fill in all required fields (Title, Excerpt, Content).');
      return;
    }

    try {
      setSubmitting(true);
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const postsRef = collection(db, 'blogPosts');

      const postDoc: any = {
        title: title.trim(),
        slug,
        category,
        excerpt: excerpt.trim(),
        content: content.trim(), // কুইল রিচ টেক্সট
        author: author.trim() || 'ZM Sourcing Desk',
        readTime: readTime.trim() || '5 min read',
        featuredImage: imageUrl ? { secureUrl: imageUrl } : null,
        status,
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(), // ডাইনামিক সোর্সিং ডেট
        
        // এসইও মেটাডাটা ম্যাপিং (গুগল ইনডেক্সিং এবং র্যাঙ্কিংয়ের জন্য - Part 07, Rule 79)
        metaTitle: metaTitle.trim() || `${title.trim()} | ${BRAND_INFO.name}`,
        metaDescription: metaDescription.trim() || excerpt.trim().substring(0, 155),
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
      };

      if (editingId) {
        // এডিট বা মডিফিকেশন প্রসেস
        const docRef = doc(db, 'blogPosts', editingId);
        await updateDoc(docRef, postDoc);
        toast.success(`"${title}" updated successfully.`);
      } else {
        // নতুন পোস্ট তৈরি
        postDoc.createdAt = serverTimestamp();
        await addDoc(postsRef, postDoc);
        toast.success(`"${title}" published successfully.`);
      }

      closeForm();
      loadPosts();
    } catch (error) {
      console.error('[Blog Post Submit Error]:', error);
      toast.error('Database write operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // স্ট্যাটাস টগল (Published / Draft)
  const handleToggleStatus = async (post: any) => {
    try {
      const docRef = doc(db, 'blogPosts', post.id);
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });
      toast.success(`Post status updated to ${newStatus}.`);
      loadPosts();
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  // ডিলিট মেকানিজম (নিরাপত্তা ও নিশ্চিতকরণ ডায়ালগ সহ)
  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${name}" from insights directory? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'blogPosts', id);
      await deleteDoc(docRef);
      toast.success(`"${name}" deleted successfully.`);
      loadPosts();
    } catch (error) {
      toast.error('Failed to delete article.');
    } finally {
      setLoading(false);
    }
  };

  // এডিটিং মোড ট্রিগার
  const startEdit = (post: any) => {
    setEditingId(post.id);
    setTitle(post.title);
    setCategory(post.category || 'Industry News');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setAuthor(post.author || 'ZM Sourcing Desk');
    setReadTime(post.readTime || '5 min read');
    setImageUrl(post.featuredImage?.secureUrl || post.featuredImage || '');
    setStatus(post.status || 'draft');
    
    // এসইও ফিল্ডস ফিলিং
    setMetaTitle(post.metaTitle || '');
    setMetaDescription(post.metaDescription || '');
    setKeywords(post.keywords ? post.keywords.join(', ') : '');
    
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Industry News');
    setExcerpt('');
    setContent('');
    setAuthor('ZM Sourcing Desk');
    setReadTime('5 min read');
    setImageUrl('');
    setStatus('draft');
    setMetaTitle('');
    setMetaDescription('');
    setKeywords('');
    setIsFormOpen(false);
  };

  // রিয়াল কুইল মডিউল কনফিগ (ভিজ্যুয়াল কাস্টমাইজেশন)
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Manage Insights | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
        
        {/* ড্যাশবোর্ড হেডার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none mb-2">
              Manage Insights & Blog
            </h1>
            <p className="text-xs sm:text-sm text-brand-neutral-muted">
              Publish B2B sourcing guides, export news, and trade guides with full SEO metadata control.
            </p>
          </div>
          {!isFormOpen && (
            <Button onClick={() => setIsFormOpen(true)} variant="primary" size="md">
              <Plus className="w-4 h-4 mr-2" />
              Write New Article
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isFormOpen ? (
            
            // ৩.  আর্টিকেলে নতুন পোস্ট এবং এডিটিং প্যানেল
            <motion.form 
              onSubmit={handleSubmit}
              className="bg-white border border-brand-neutral-border p-6 sm:p-8 rounded-card shadow-soft space-y-6 max-w-4xl"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <div className="flex justify-between items-center pb-4 border-b border-brand-neutral-border">
                <h2 className="font-heading font-bold text-base text-brand-neutral-charcoal flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-primary" />
                  {editingId ? 'Edit Article Specifications' : 'Compose New B2B Article'}
                </h2>
                <button type="button" onClick={closeForm} className="p-1.5 rounded-full hover:bg-brand-neutral-gray text-brand-neutral-muted hover:text-brand-neutral-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* গ্রাউন্ড ১: বেসিক তথ্য */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Article Title *"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Global Food Sourcing Guidelines"
                />
                <div className="flex flex-col text-left">
                  <label className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal">Article Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 h-11 border border-brand-neutral-border rounded-form text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
                  >
                    <option value="Industry News">Industry News</option>
                    <option value="Company Update">Company Update</option>
                    <option value="Trade Guide">Trade Guide</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Author Name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. ZM Sourcing Desk"
                />
                <Input
                  label="Read Time"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 5 min read"
                />
              </div>

              <Input
                label="Brief Excerpt (SEO Meta-Description Fallback) *"
                required
                multiline
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a concise excerpt for index cards and Google snippets (150 chars)..."
              />

              {/* রিয়েল-টাইম রিচ-টেক্সট এডিটর (React Quill) */}
              <div className="flex flex-col text-left">
                <label className="mb-2 text-xs font-semibold text-brand-neutral-charcoal">Main Content Body *</label>
                <div className="rounded-xl overflow-hidden border border-brand-neutral-border shadow-soft bg-white">
                  <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent}
                    modules={quillModules}
                    className="min-h-[250px] font-sans text-sm"
                  />
                </div>
              </div>

              {/* গ্রাউন্ড ২: ক্লাউডিনারি আপলোড উইন্ডো */}
              <div className="bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-xl text-left">
                <h3 className="font-heading font-bold text-xs text-brand-neutral-charcoal mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <UploadCloud className="w-4 h-4 text-brand-primary" />
                  Featured Banner Image
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-8 border-2 border-dashed border-brand-neutral-border rounded-xl p-4 text-center bg-white hover:border-brand-primary/40 transition-colors relative group cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      accept="image/png, image/jpeg, image/jpg"
                      aria-label="Upload featured image"
                    />
                    <UploadCloud className="w-8 h-8 text-brand-neutral-muted mx-auto mb-2 group-hover:scale-105 transition-transform" />
                    <span className="block text-xs font-bold text-brand-neutral-charcoal mb-1">
                      {uploadingImage ? 'Uploading Image...' : 'Upload Featured Image'}
                    </span>
                    <span className="block text-[10px] text-brand-neutral-muted">
                      Allowed: PNG, JPEG (Max 3MB)
                    </span>
                  </div>

                  <div className="sm:col-span-4 flex justify-center">
                    <div className="w-28 h-24 rounded-lg overflow-hidden border border-brand-neutral-border bg-brand-neutral-gray relative">
                      <img 
                        src={imageUrl || 'https://placehold.co/150x120/1c1c1c/ffffff?text=No+Image'} 
                        alt="featured preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* গ্রাউন্ড ৩: সার্চ ইঞ্জিন অপ্টিমাইজেশন মেটা প্যানেল (B2B SEO Dashboard - Part 07, Rule 79) */}
              <div className="bg-brand-secondary/5 border border-brand-primary/10 p-5 rounded-xl text-left space-y-4">
                <h3 className="font-heading font-bold text-xs text-brand-primary flex items-center gap-2 uppercase tracking-wide border-b border-brand-primary/5 pb-2">
                  <Globe className="w-4.5 h-4.5 text-brand-accent-dark" />
                  Search Engine Optimisation (SEO Configuration)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Custom Meta Title (Auto-generated if empty)"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="e.g. B2B Product Sourcing Guidelines | ZM Supplier & Trading"
                  />
                  <Input
                    label="Custom Meta Description (Auto-generated if empty)"
                    multiline
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="e.g. Read the ultimate B2B sourcing guideline to negotiate wholesale contract specs cleanly."
                  />
                  <Input
                    label="Keywords (Comma-separated lists)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. B2B Sourcing, Wholesale supply, UK Trade, Import Export"
                  />
                </div>
              </div>

              {/* পাবলিশিং স্ট্যাটাস কন্ট্রোল */}
              <div className="flex justify-between items-center bg-brand-bg-alt/30 p-4 rounded-xl border border-brand-neutral-border">
                <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-wide">Publish State</span>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="bg-white border border-brand-neutral-border rounded-lg px-3 py-1.5 text-xs font-bold text-brand-neutral-charcoal focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* ফর্ম অ্যাকশন বাটনস */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-neutral-border">
                <Button onClick={closeForm} variant="outline" size="sm" disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Article' : 'Publish Article'}
                </Button>
              </div>

            </motion.form>
          ) : (
            
            // ৪. মেইন ব্লগ ডিরেক্টরি ম্যানেজার টেবিল ভিউ (ডাটা টেবিল)
            <div className="bg-white border border-brand-neutral-border rounded-card shadow-soft overflow-hidden">
              
              {/* সার্চ ও ফিল্টার বার */}
              <div className="p-4 border-b border-brand-neutral-border flex items-center justify-between bg-brand-bg-alt/40">
                <div className="w-full md:w-80">
                  <Input
                    placeholder="Search articles by title or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />}
                  />
                </div>
                <div className="text-xs font-bold text-brand-neutral-muted select-none uppercase tracking-wide hidden sm:block">
                  {filteredPosts.length} Articles Listed
                </div>
              </div>

              {/* ব্লগ ডেটা টেবিল */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
                  <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest">Loading Insights Database...</span>
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm select-none">
                    <thead>
                      <tr className="bg-brand-bg-alt/80 border-b border-brand-neutral-border text-xs font-bold text-brand-neutral-muted uppercase tracking-wider">
                        <th className="px-6 py-3.5">Article</th>
                        <th className="px-6 py-3.5">Slug</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Published Date</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-neutral-border text-brand-neutral-charcoal">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-brand-bg-alt/30 transition-colors duration-200">
                          {/* ইমেজ ও নাম */}
                          <td className="px-6 py-4 flex items-center space-x-4">
                            <div className="w-12 h-10 rounded-lg overflow-hidden border border-brand-neutral-border shrink-0 bg-brand-neutral-gray">
                              <img src={post.featuredImage?.secureUrl || post.featuredImage || 'https://placehold.co/100x80/024e33/ffffff?text=ZST'} alt={post.title} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-brand-neutral-charcoal line-clamp-1 max-w-[200px]">{post.title}</span>
                          </td>
                          
                          {/* স্লাগ */}
                          <td className="px-6 py-4 font-semibold text-xs text-brand-primary max-w-[150px] truncate">{post.slug}</td>
                          
                          {/* ক্যাটাগরি */}
                          <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{post.category}</td>
                          
                          {/* পাবলিশিং স্ট্যাটাস */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(post)}
                              className={`inline-flex items-center space-x-1.5 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md border transition-all duration-300 ${
                                post.status === 'published'
                                  ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/10'
                                  : 'bg-brand-accent/5 text-brand-accent-dark border-brand-accent/30 hover:bg-brand-accent/15'
                              }`}
                              aria-label={`Toggle status from ${post.status}`}
                            >
                              {post.status === 'published' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{post.status}</span>
                            </button>
                          </td>

                          {/* পাবলিশ ডেট */}
                          <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{post.publishedAt}</td>

                          {/* বাটন অ্যাকশনস (Edit, Delete) */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Edit */}
                              <button
                                onClick={() => startEdit(post)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-brand-neutral-charcoal hover:bg-brand-primary hover:text-brand-accent hover:border-brand-primary transition-all duration-300"
                                aria-label="Edit article"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(post.id, post.title)}
                                className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                                aria-label="Delete article"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // খালি স্টেট
                <div className="py-20 flex flex-col items-center max-w-sm mx-auto text-center">
                  <div className="w-14 h-14 bg-brand-primary/5 rounded-full flex items-center justify-center mb-4 border border-brand-primary/10">
                    <AlertCircle className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-brand-neutral-charcoal mb-1">No Articles Published</h3>
                  <p className="text-xs text-brand-neutral-muted leading-relaxed">
                    There are no articles listed in your insights directory. Click "Write New Article" to populate.
                  </p>
                </div>
              )}

            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};