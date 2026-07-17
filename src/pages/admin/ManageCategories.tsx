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
  Plus, Search, Edit2, Copy, Trash2, Eye, EyeOff, Loader2, UploadCloud, X, 
  CheckCircle, Package, AlertCircle, Globe 
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import toast from 'react-hot-toast';

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

export const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ক্যাটাগরি ফর্ম ফিল্ডস স্টেট
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // এসইও স্টেট
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const catsRef = collection(db, 'productCategories');
      const q = query(catsRef, orderBy('sortOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setCategories(list);
    } catch (error) {
      console.error('[ManageCategories load error]:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setUploadingImage(true);
    const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

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
        toast.success('Category image uploaded successfully.');
      } else { throw new Error('Upload failed'); }
    } catch (err) { toast.error('Upload failed.'); } finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required.'); return; }

    try {
      setSubmitting(true);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catDoc: any = {
        name: name.trim(),
        slug,
        status,
        sortOrder: Number(sortOrder),
        cardImage: imageUrl ? { secureUrl: imageUrl } : null,
        updatedAt: serverTimestamp(),
        seo: {
          metaTitle: metaTitle.trim() || `${name.trim()} | ${BRAND_INFO.name}`,
          metaDescription: metaDescription.trim(),
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
        }
      };

      if (editingId) {
        await setDoc(doc(db, 'productCategories', editingId), catDoc, { merge: true });
        toast.success(`"${name}" updated successfully.`);
      } else {
        catDoc.createdAt = serverTimestamp();
        await addDoc(collection(db, 'productCategories'), catDoc);
        toast.success(`"${name}" created successfully.`);
      }
      closeForm();
      loadCategories();
    } catch (error) { toast.error('Database write operation failed.'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteDoc(doc(db, 'productCategories', id));
    toast.success('Deleted.');
    loadCategories();
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSortOrder(cat.sortOrder || 1);
    setStatus(cat.status || 'published');
    setImageUrl(cat.cardImage?.secureUrl || '');
    setMetaTitle(cat.seo?.metaTitle || '');
    setMetaDescription(cat.seo?.metaDescription || '');
    setKeywords(cat.seo?.keywords?.join(', ') || '');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingId(null); setName(''); setSortOrder(1); setImageUrl(''); setIsFormOpen(false);
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <Helmet><title>Manage Categories | Admin Panel | {BRAND_INFO.name}</title></Helmet>
      <div className="space-y-8 text-left">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Manage Categories</h1>
            <p className="text-sm text-gray-500">Add, edit and manage product categories.</p>
          </div>
          {!isFormOpen && <Button onClick={() => setIsFormOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>}
        </div>

        <AnimatePresence mode="wait">
          {isFormOpen ? (
            <motion.form onSubmit={handleSubmit} className="bg-white p-8 border rounded-card shadow-soft space-y-6 max-w-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Category Name *" required value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border">
                 <h3 className="text-xs font-bold mb-2 flex items-center"><UploadCloud className="w-4 h-4 mr-2"/> Category Image</h3>
                 <input type="file" onChange={handleImageUpload} className="w-full" />
                 {imageUrl && <img src={imageUrl} className="w-20 h-20 mt-2 object-cover rounded" />}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                 <h3 className="text-xs font-bold flex items-center"><Globe className="w-4 h-4 mr-2"/> SEO</h3>
                 <Input label="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                 <Input label="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                 <Input label="Keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
              </div>

              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full p-2 border rounded">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={closeForm}>Cancel</Button><Button type="submit" isLoading={submitting}>Save</Button></div>
            </motion.form>
          ) : (
            <div className="bg-white border rounded-card shadow-soft overflow-hidden">
               <div className="p-4 border-b flex justify-between bg-gray-50"><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
               <table className="w-full text-left">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y">{filteredCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold">{cat.name}</td>
                    <td className="px-6 py-4">{cat.status}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id, cat.name)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};