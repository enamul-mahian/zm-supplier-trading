import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
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
          dateStr = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
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

    if (!cloudName || !preset) {
      setTimeout(() => {
        setImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600');
        setUploadingImage(false);
        toast.success('Image uploaded successfully (Sandbox Mode).');
      }, 1500);
      return;
    }

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
    } catch (err) { toast.error('Image upload failed. Please try again.'); } finally { setUploadingImage(false); }
  };

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
    } catch (error) {
      console.error('[Blog Post Submit Error]:', error);
      toast.error('Database write operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (post: any) => {
    try {
      const docRef = doc(db, 'blogPosts', post.id);
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      // ফিক্স: status আপডেট করার জন্য setDoc ব্যবহার করা নিরাপদ
      await setDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() }, { merge: true });
      toast.success(`Post status updated to ${newStatus}.`);
      loadPosts();
    } catch (error) { toast.error('Failed to update status.'); }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${name}" from insights directory? This action cannot be undone.`);
    if (!confirmDelete) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'blogPosts', id));
      toast.success(`"${name}" deleted successfully.`);
      loadPosts();
    } catch (error) { toast.error('Failed to delete article.'); } finally { setLoading(false); }
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
      {/* ... (বাকি JSX কোড আগের মতোই থাকবে) */}
    </>
  );
};