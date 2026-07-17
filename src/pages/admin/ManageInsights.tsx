import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, // ফিক্সড: setDoc ইমপোর্ট করা হলো
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

// @ts-ignore
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

const FALLBACK_POSTS = [
  { id: 'b1', category: 'Industry News', title: 'Global Food Supply Trends in 2026', excerpt: 'An overview of the latest trends shaping the global food supply industry, including logistics and sourcing changes.', publishedAt: 'July 12, 2026', slug: 'global-food-supply-trends', status: 'published', author: 'ZM Trade Desk', readTime: '5 min read' },
  { id: 'b2', category: 'Company Update', title: 'ZM Supplier & Trading Expands Its Product Range', excerpt: 'We are excited to announce the expansion of our product portfolio to serve you better, offering more premium bulk options.', publishedAt: 'July 10, 2026', slug: 'zm-supplier-trading-expands-product-range', status: 'published', author: 'Management Team', readTime: '3 min read' },
  { id: 'b3', category: 'Trade Guide', title: 'Best Practices for Safe Food Import & Export', excerpt: 'Key practices to ensure smooth, compliant, and safe international trade. A structured guide for commercial buyers.', publishedAt: 'July 08, 2026', slug: 'best-practices-safe-food-import-export', status: 'published', author: 'Compliance Desk', readTime: '6 min read' }
];

export const ManageInsights: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Industry News');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState(''); 
  const [author, setAuthor] = useState('ZM Sourcing Desk');
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

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
          dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        return { id: docSnap.id, ...data, publishedAt: dateStr };
      });
      setPosts(list.length > 0 ? list : FALLBACK_POSTS);
    } catch (error) {
      console.error('[ManageInsights load error]:', error);
      setPosts(FALLBACK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) { toast.error('Only PNG, JPG, and JPEG images are allowed.'); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error('Maximum image size is 3MB.'); return; }

    setUploadingImage(true);
    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        toast.success('Featured image uploaded successfully to Cloudinary.');
      } else { throw new Error('Upload failed'); }
    } catch (err) { toast.error('Image upload failed.'); } finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      toast.error('Please fill in all required fields.');
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
        content: content.trim(),
        author: author.trim() || 'ZM Sourcing Desk',
        readTime: readTime.trim() || '5 min read',
        featuredImage: imageUrl ? { secureUrl: imageUrl } : null,
        status,
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
        metaTitle: metaTitle.trim() || `${title.trim()} | ${BRAND_INFO.name}`,
        metaDescription: metaDescription.trim() || excerpt.trim().substring(0, 155),
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
      };

      if (editingId) {
        // ফিক্স: updateDoc এর বদলে setDoc এবং merge: true ব্যবহার করা হলো
        const docRef = doc(db, 'blogPosts', editingId);
        await setDoc(docRef, postDoc, { merge: true });
        toast.success(`"${title}" updated successfully.`);
      } else {
        postDoc.createdAt = serverTimestamp();
        await addDoc(postsRef, postDoc);
        toast.success(`"${title}" published successfully.`);
      }
      closeForm();
      loadPosts();
    } catch (error) { toast.error('Database write operation failed.'); } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (post: any) => {
    try {
      const docRef = doc(db, 'blogPosts', post.id);
      // ফিক্স: status আপডেট করার জন্য setDoc ব্যবহার করা নিরাপদ
      await setDoc(docRef, { status: post.status === 'published' ? 'draft' : 'published', updatedAt: serverTimestamp() }, { merge: true });
      toast.success('Status updated.');
      loadPosts();
    } catch (error) { toast.error('Failed to update status.'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'blogPosts', id));
      toast.success(`Deleted successfully.`);
      loadPosts();
    } catch (error) { toast.error('Failed to delete.'); } finally { setLoading(false); }
  };

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

  const quillModules = { toolbar: [ [{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'blockquote'], [{'list': 'ordered'}, {'list': 'bullet'}], ['link', 'clean'] ], };
  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()) );

  return (
    <>
      <Helmet>
        <title>Manage Insights | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Article Title *" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Global Food Sourcing Guidelines" />
                <div className="flex flex-col text-left">
                  <label className="mb-1.5 text-xs font-semibold text-brand-neutral-charcoal">Article Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 h-11 border border-brand-neutral-border rounded-form text-sm font-semibold text-brand-neutral-charcoal focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 cursor-pointer">
                    <option value="Industry News">Industry News</option>
                    <option value="Company Update">Company Update</option>
                    <option value="Trade Guide">Trade Guide</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Author Name" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. ZM Sourcing Desk" />
                <Input label="Read Time" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="e.g. 5 min read" />
              </div>

              <Input label="Brief Excerpt (SEO Meta-Description Fallback) *" required multiline rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Write a concise excerpt for index cards and Google snippets (150 chars)..." />

              <div className="flex flex-col text-left">
                <label className="mb-2 text-xs font-semibold text-brand-neutral-charcoal">Main Content Body *</label>
                <div className="rounded-xl overflow-hidden border border-brand-neutral-border shadow-soft bg-white">
                  <ReactQuill theme="snow" value={content} onChange={setContent} modules={quillModules} className="min-h-[250px] font-sans text-sm" />
                </div>
              </div>

              <div className="bg-brand-bg-alt/50 border border-brand-neutral-border p-5 rounded-xl text-left">
                <h3 className="font-heading font-bold text-xs text-brand-neutral-charcoal mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <UploadCloud className="w-4 h-4 text-brand-primary" /> Featured Banner Image
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-8 border-2 border-dashed border-brand-neutral-border rounded-xl p-4 text-center bg-white hover:border-brand-primary/40 transition-colors relative group cursor-pointer">
                    <input type="file" onChange={handleImageUpload} disabled={uploadingImage} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/png, image/jpeg, image/jpg" />
                    <UploadCloud className="w-8 h-8 text-brand-neutral-muted mx-auto mb-2 group-hover:scale-105 transition-transform" />
                    <span className="block text-xs font-bold text-brand-neutral-charcoal mb-1">{uploadingImage ? 'Uploading Image...' : 'Upload Featured Image'}</span>
                    <span className="block text-[10px] text-brand-neutral-muted">Allowed: PNG, JPEG (Max 3MB)</span>
                  </div>
                  <div className="sm:col-span-4 flex justify-center">
                    <div className="w-28 h-24 rounded-lg overflow-hidden border border-brand-neutral-border bg-brand-neutral-gray relative">
                      <img src={imageUrl || 'https://placehold.co/150x120/1c1c1c/ffffff?text=No+Image'} alt="featured preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-secondary/5 border border-brand-primary/10 p-5 rounded-xl text-left space-y-4">
                <h3 className="font-heading font-bold text-xs text-brand-primary flex items-center gap-2 uppercase tracking-wide border-b border-brand-primary/5 pb-2">
                  <Globe className="w-4.5 h-4.5 text-brand-accent-dark" /> Search Engine Optimisation (SEO Configuration)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Custom Meta Title (Auto-generated if empty)" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="e.g. B2B Product Sourcing Guidelines | ZM Supplier & Trading" />
                  <Input label="Custom Meta Description (Auto-generated if empty)" multiline rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="e.g. Read the ultimate B2B sourcing guideline to negotiate wholesale contract specs cleanly." />
                  <Input label="Keywords (Comma-separated lists)" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g. B2B Sourcing, Wholesale supply, UK Trade, Import Export" />
                </div>
              </div>

              <div className="flex justify-between items-center bg-brand-bg-alt/30 p-4 rounded-xl border border-brand-neutral-border">
                <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-wide">Publish State</span>
                <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="bg-white border border-brand-neutral-border rounded-lg px-3 py-1.5 text-xs font-bold text-brand-neutral-charcoal focus:outline-none">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-neutral-border">
                <Button onClick={closeForm} variant="outline" size="sm" disabled={submitting}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" isLoading={submitting}><CheckCircle className="w-4 h-4 mr-2" /> {editingId ? 'Update Article' : 'Publish Article'}</Button>
              </div>
            </motion.form>
          ) : (
            <div className="bg-white border border-brand-neutral-border rounded-card shadow-soft overflow-hidden">
              <div className="p-4 border-b border-brand-neutral-border flex items-center justify-between bg-brand-bg-alt/40">
                <div className="w-full md:w-80">
                  <Input placeholder="Search articles by title or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="w-4 h-4 text-brand-neutral-muted" />} />
                </div>
                <div className="text-xs font-bold text-brand-neutral-muted select-none uppercase tracking-wide hidden sm:block">{filteredPosts.length} Articles Listed</div>
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" /></div>
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
                          <td className="px-6 py-4 flex items-center space-x-4">
                            <div className="w-12 h-10 rounded-lg overflow-hidden border border-brand-neutral-border shrink-0 bg-brand-neutral-gray"><img src={post.featuredImage?.secureUrl || post.featuredImage || 'https://placehold.co/100x80/024e33/ffffff?text=ZST'} alt={post.title} className="w-full h-full object-cover" /></div>
                            <span className="font-bold text-brand-neutral-charcoal line-clamp-1 max-w-[200px]">{post.title}</span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-xs text-brand-primary max-w-[150px] truncate">{post.slug}</td>
                          <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{post.category}</td>
                          <td className="px-6 py-4">
                             <button onClick={() => handleToggleStatus(post)} className={`inline-flex items-center space-x-1.5 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${post.status === 'published' ? 'bg-brand-primary/5 text-brand-primary' : 'bg-brand-accent/5 text-brand-accent-dark'}`}>
                                {post.status === 'published' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{post.status}</span>
                             </button>
                          </td>
                          <td className="px-6 py-4 font-semibold text-xs text-brand-neutral-muted">{post.publishedAt}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                                <button onClick={() => startEdit(post)} className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border hover:bg-brand-primary hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(post.id, post.title)} className="p-2 rounded-lg bg-brand-bg-alt border border-brand-neutral-border text-red-500 hover:bg-red-500 hover:text-white"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center"><AlertCircle className="mx-auto w-10 h-10 text-brand-primary" /><p className="mt-4">No Articles Found</p></div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};