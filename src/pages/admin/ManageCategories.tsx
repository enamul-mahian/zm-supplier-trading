import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, setDoc, deleteDoc, doc, query, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fetchAdminProductCategories } from '../../services/firestore';
import { BRAND_INFO } from '../../shared/constants';
import { Plus, Edit2, Trash2, Loader2, X, CheckCircle, Grid, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import toast from 'react-hot-toast';

// ডিফল্ট ক্যাটাগরি যা আপনার হোম পেজে শো করে
const DEFAULT_CATEGORIES = [
  { name: 'Packaged Foods', sortOrder: 1, status: 'published' },
  { name: 'Beverages', sortOrder: 2, status: 'published' },
  { name: 'Dry Goods', sortOrder: 3, status: 'published' },
  { name: 'Hospitality Supplies', sortOrder: 4, status: 'published' }
];

export const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchAdminProductCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  // ডাটাবেসে ডিফল্ট ক্যাটাগরি সেভ করার ফাংশন
  const initializeCategories = async () => {
    setLoading(true);
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        await addDoc(collection(db, 'productCategories'), {
          ...cat,
          slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          isEnabled: true,
          createdAt: serverTimestamp()
        });
      }
      toast.success('Default categories initialized!');
      loadCategories();
    } catch (e) { toast.error('Failed to initialize.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const catDoc = {
        name,
        slug,
        status,
        sortOrder: Number(sortOrder),
        isEnabled: true,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await setDoc(doc(db, 'productCategories', editingId), catDoc, { merge: true });
        toast.success('Category updated.');
      } else {
        await addDoc(collection(db, 'productCategories'), { ...catDoc, createdAt: serverTimestamp() });
        toast.success('Category created.');
      }
      closeForm();
      loadCategories();
    } catch (error) { toast.error('Database write operation failed.'); } finally { setSubmitting(false); }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSortOrder(cat.sortOrder || 1);
    setStatus(cat.status || 'published');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setName('');
    setSortOrder(1);
    setStatus('published');
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    await deleteDoc(doc(db, 'productCategories', id));
    toast.success('Deleted.');
    loadCategories();
  };

  return (
    <>
      <Helmet><title>Manage Categories | {BRAND_INFO.name}</title></Helmet>
      <div className="space-y-8 text-left">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Manage Categories</h1>
            <p className="text-sm text-gray-500">Add or edit product categories visible on the homepage.</p>
          </div>
          {!isFormOpen && (
             <div className="flex gap-2">
                {categories.length === 0 && (
                  <Button variant="outline" onClick={initializeCategories}><RefreshCw className="w-4 h-4 mr-2" /> Init Default</Button>
                )}
                <Button onClick={() => setIsFormOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Category</Button>
             </div>
          )}
        </div>

        {isFormOpen ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-card shadow-soft space-y-4 max-w-lg">
            <Input label="Category Name *" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full p-2 border rounded">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              <Button type="submit" isLoading={submitting}>Save</Button>
            </div>
          </form>
        ) : (
          <div className="bg-white border rounded-card shadow-soft">
            {loading ? <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8" /></div> : categories.length === 0 ? (
                <div className="p-10 text-center">
                    <AlertCircle className="mx-auto w-10 h-10 text-gray-300" />
                    <p className="mt-4">No categories found. Click "Init Default" to add standard categories.</p>
                </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y">
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td className="px-6 py-4 font-bold">{cat.name}</td>
                      <td className="px-6 py-4">{cat.status}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id, cat.name)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
};