import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BRAND_INFO } from '../../shared/constants';
import { MediaReference } from '../../shared/types';
import { 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Share2, 
  Globe, 
  Save,
  Loader2,
  Search,
  Image as ImageIcon,
  UploadCloud,
  X
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import toast from 'react-hot-toast';

// মোশন অ্যানিমেশন ভ্যারিয়েন্টস
const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
};

export const ManageSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');

  // লোগো স্টেট
  const [logo, setLogo] = useState<MediaReference | null>(null);

  // গ্লোবাল ইনফরমেশন স্টেট
  const [generalInfo, setGeneralInfo] = useState({
    email: BRAND_INFO.email,
    phone: BRAND_INFO.phone,
    address: BRAND_INFO.address,
    workingHours: BRAND_INFO.workingHours,
    linkedin: BRAND_INFO.socials.linkedin || '',
    twitter: BRAND_INFO.socials.twitter || '',
    facebook: BRAND_INFO.socials.facebook || '',
  });

  // ফিক্সড পেজগুলোর এসইও স্টেট
  const [seoSettings, setSeoSettings] = useState({
    home: { title: '', description: '' },
    about: { title: '', description: '' },
    faq: { title: '', description: '' },
    contact: { title: '', description: '' }
  });

  // ফায়ারস্টোর থেকে বর্তমান সেটিংস লোড করা
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'siteSettings', 'global');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.contactInfo) {
            setGeneralInfo(prev => ({ ...prev, ...data.contactInfo, ...data.socialLinks }));
          }
          if (data.seoOverrides) {
            setSeoSettings(prev => ({ ...prev, ...data.seoOverrides }));
          }
          if (data.brandAssets?.logo) {
            setLogo(data.brandAssets.logo);
          }
        }
      } catch (error) {
        console.error('[ManageSettings load error]:', error);
        toast.error('Failed to load site settings.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // জেনারেল ইনফো আপডেট হ্যান্ডলার
  const handleGeneralChange = (field: string, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  // এসইও আপডেট হ্যান্ডলার
  const handleSeoChange = (page: keyof typeof seoSettings, field: 'title' | 'description', value: string) => {
    setSeoSettings(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
  };

  // লোগো আপলোড হ্যান্ডলার (Cloudinary)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ফাইল টাইপ ভ্যালিডেশন
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error('Cloudinary configuration is missing in environment variables.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload image to Cloudinary');
      
      const data = await res.json();

      const mediaRef: MediaReference = {
        secureUrl: data.secure_url,
        cloudinaryPublicId: data.public_id,
        resourceType: data.resource_type as 'image' | 'video' | 'raw',
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
        altText: 'ZM Supplier & Trading Brand Logo',
      };

      setLogo(mediaRef);
      toast.success('Logo uploaded temporarily. Please save settings to apply globally.');
    } catch (error) {
      console.error('[Cloudinary Upload Error]:', error);
      toast.error('Failed to upload logo.');
    } finally {
      setIsUploading(false);
      // ইনপুট রিসেট করা যাতে একই ফাইল পুনরায় সিলেক্ট করা যায়
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // লোগো রিমুভ হ্যান্ডলার
  const handleRemoveLogo = () => {
    setLogo(null);
  };

  // সেভ সেটিংস হ্যান্ডলার
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const docRef = doc(db, 'siteSettings', 'global');
      
      const updateData = {
        brandAssets: {
          logo: logo
        },
        contactInfo: {
          email: generalInfo.email.trim(),
          phone: generalInfo.phone.trim(),
          address: generalInfo.address.trim(),
          workingHours: generalInfo.workingHours.trim(),
        },
        socialLinks: {
          linkedin: generalInfo.linkedin.trim(),
          twitter: generalInfo.twitter.trim(),
          facebook: generalInfo.facebook.trim(),
        },
        seoOverrides: seoSettings,
        updatedAt: serverTimestamp(),
      };

      // merge: true দিলে আগের ডেটা মুছে না গিয়ে শুধু নতুন ফিল্ডগুলো আপডেট হবে
      await setDoc(docRef, updateData, { merge: true });
      toast.success('Site settings updated successfully.');
    } catch (error) {
      console.error('[ManageSettings save error]:', error);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Site Settings | Admin Panel | {BRAND_INFO.name}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-8 text-left">
        
        {/* ড্যাশবোর্ড হেডার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-neutral-charcoal leading-none mb-2 flex items-center gap-2">
              <Settings className="w-6 h-6 text-brand-primary" />
              Global Site Settings
            </h1>
            <p className="text-xs sm:text-sm text-brand-neutral-muted">
              Manage website contact information, social links, brand logo, and fixed pages SEO metadata.
            </p>
          </div>
        </div>

        {/* সেটিংস ট্যাব নেভিগেশন */}
        <div className="flex space-x-2 border-b border-brand-neutral-border pb-px">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'general' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-neutral-muted hover:text-brand-neutral-charcoal'
            }`}
          >
            General Information
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-5 py-2.5 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'seo' 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-brand-neutral-muted hover:text-brand-neutral-charcoal'
            }`}
          >
            Fixed Pages SEO
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-3" />
            <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest">Loading Settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="bg-white border border-brand-neutral-border p-6 sm:p-8 rounded-card shadow-soft max-w-4xl relative">
            <AnimatePresence mode="wait">
              
              {/* জেনারেল ইনফরমেশন ট্যাব প্যানেল */}
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  {/* ব্র্যান্ড লোগো সেকশন */}
                  <div className="space-y-4">
                    <h3 className="font-heading font-bold text-sm text-brand-primary uppercase tracking-wider border-b border-brand-neutral-border pb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Brand Logo
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-brand-secondary/5 border border-brand-neutral-border p-5 rounded-xl">
                      {/* লোগো প্রিভিউ এরিয়া */}
                      <div className="relative w-32 h-32 flex items-center justify-center bg-white border border-brand-neutral-border rounded-lg shadow-sm overflow-hidden shrink-0">
                        {logo ? (
                          <>
                            <img 
                              src={logo.secureUrl} 
                              alt="Brand Logo Preview" 
                              className="max-w-full max-h-full object-contain p-2"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-colors"
                              title="Remove Logo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-brand-neutral-muted">
                            <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">No Logo</span>
                          </div>
                        )}
                      </div>

                      {/* লোগো আপলোড বাটন */}
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-brand-neutral-charcoal">
                          Upload your primary brand logo. This will be displayed on the header, footer, and relevant emails.
                        </p>
                        <p className="text-xs text-brand-neutral-muted mb-4">
                          Recommended format: PNG (Transparent background), max size 2MB.
                        </p>
                        
                        <div className="relative inline-block">
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/svg+xml"
                            onChange={handleLogoUpload}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="pointer-events-none"
                            isLoading={isUploading}
                          >
                            {!isUploading && <UploadCloud className="w-4 h-4 mr-2" />}
                            {isUploading ? 'Uploading to Cloudinary...' : 'Upload New Logo'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* কন্টাক্ট ইনফরমেশন সেকশন */}
                  <div className="space-y-4 pt-4">
                    <h3 className="font-heading font-bold text-sm text-brand-primary uppercase tracking-wider border-b border-brand-neutral-border pb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Support Email Address"
                        value={generalInfo.email}
                        onChange={(e) => handleGeneralChange('email', e.target.value)}
                        placeholder="info@zmsupplier.co.uk"
                        leftIcon={<Mail className="w-4 h-4 text-brand-neutral-muted" />}
                      />
                      <Input
                        label="Business Phone Number"
                        value={generalInfo.phone}
                        onChange={(e) => handleGeneralChange('phone', e.target.value)}
                        placeholder="+44 1234 567890"
                        leftIcon={<Phone className="w-4 h-4 text-brand-neutral-muted" />}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Office Address"
                        value={generalInfo.address}
                        onChange={(e) => handleGeneralChange('address', e.target.value)}
                        placeholder="123 Business Park, London"
                        leftIcon={<MapPin className="w-4 h-4 text-brand-neutral-muted" />}
                      />
                      <Input
                        label="Working Hours"
                        value={generalInfo.workingHours}
                        onChange={(e) => handleGeneralChange('workingHours', e.target.value)}
                        placeholder="Mon - Fri: 9:00 AM - 6:00 PM (GMT)"
                        leftIcon={<Clock className="w-4 h-4 text-brand-neutral-muted" />}
                      />
                    </div>
                  </div>

                  {/* সোশ্যাল লিংকস সেকশন */}
                  <div className="space-y-4 pt-4">
                    <h3 className="font-heading font-bold text-sm text-brand-primary uppercase tracking-wider border-b border-brand-neutral-border pb-2 flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Social Media Links
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="LinkedIn URL"
                        value={generalInfo.linkedin}
                        onChange={(e) => handleGeneralChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/..."
                      />
                      <Input
                        label="Twitter / X URL"
                        value={generalInfo.twitter}
                        onChange={(e) => handleGeneralChange('twitter', e.target.value)}
                        placeholder="https://twitter.com/..."
                      />
                      <Input
                        label="Facebook URL"
                        value={generalInfo.facebook}
                        onChange={(e) => handleGeneralChange('facebook', e.target.value)}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ফিক্সড পেজ এসইও (SEO) ট্যাব প্যানেল */}
              {activeTab === 'seo' && (
                <motion.div
                  key="seo"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  <div className="bg-brand-secondary/5 border border-brand-primary/10 p-5 rounded-xl text-left mb-6">
                    <h3 className="font-heading font-bold text-xs text-brand-primary flex items-center gap-2 uppercase tracking-wide mb-2">
                      <Globe className="w-4.5 h-4.5 text-brand-accent-dark" />
                      SEO Metatags Configuration
                    </h3>
                    <p className="text-xs text-brand-neutral-muted">
                      Set custom Meta Titles and Descriptions for your fixed static pages. Leave blank to use the default system values.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Home Page SEO */}
                    <div className="p-5 border border-brand-neutral-border rounded-xl bg-brand-bg-alt/30">
                      <h4 className="font-bold text-brand-neutral-charcoal mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-brand-primary" /> Home Page SEO
                      </h4>
                      <div className="space-y-4">
                        <Input
                          label="Meta Title"
                          value={seoSettings.home.title}
                          onChange={(e) => handleSeoChange('home', 'title', e.target.value)}
                          placeholder={`${BRAND_INFO.name} | UK-Standard B2B Product Supply`}
                        />
                        <Input
                          label="Meta Description"
                          multiline rows={2}
                          value={seoSettings.home.description}
                          onChange={(e) => handleSeoChange('home', 'description', e.target.value)}
                          placeholder="Reliable UK-standard B2B product sourcing, wholesale supply..."
                        />
                      </div>
                    </div>

                    {/* About Us Page SEO */}
                    <div className="p-5 border border-brand-neutral-border rounded-xl bg-brand-bg-alt/30">
                      <h4 className="font-bold text-brand-neutral-charcoal mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-brand-primary" /> About Us Page SEO
                      </h4>
                      <div className="space-y-4">
                        <Input
                          label="Meta Title"
                          value={seoSettings.about.title}
                          onChange={(e) => handleSeoChange('about', 'title', e.target.value)}
                          placeholder={`About Us | ${BRAND_INFO.name} | UK-Standard B2B Sourcing`}
                        />
                        <Input
                          label="Meta Description"
                          multiline rows={2}
                          value={seoSettings.about.description}
                          onChange={(e) => handleSeoChange('about', 'description', e.target.value)}
                          placeholder="Learn about ZM Supplier & Trading, our story, corporate values..."
                        />
                      </div>
                    </div>

                    {/* FAQ Page SEO */}
                    <div className="p-5 border border-brand-neutral-border rounded-xl bg-brand-bg-alt/30">
                      <h4 className="font-bold text-brand-neutral-charcoal mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-brand-primary" /> FAQ Page SEO
                      </h4>
                      <div className="space-y-4">
                        <Input
                          label="Meta Title"
                          value={seoSettings.faq.title}
                          onChange={(e) => handleSeoChange('faq', 'title', e.target.value)}
                          placeholder={`Frequently Asked Questions | ${BRAND_INFO.name}`}
                        />
                        <Input
                          label="Meta Description"
                          multiline rows={2}
                          value={seoSettings.faq.description}
                          onChange={(e) => handleSeoChange('faq', 'description', e.target.value)}
                          placeholder="Find answers to common B2B sourcing, wholesale supply orders..."
                        />
                      </div>
                    </div>

                    {/* Contact Page SEO */}
                    <div className="p-5 border border-brand-neutral-border rounded-xl bg-brand-bg-alt/30">
                      <h4 className="font-bold text-brand-neutral-charcoal mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-brand-primary" /> Contact Page SEO
                      </h4>
                      <div className="space-y-4">
                        <Input
                          label="Meta Title"
                          value={seoSettings.contact.title}
                          onChange={(e) => handleSeoChange('contact', 'title', e.target.value)}
                          placeholder={`Contact Us | ${BRAND_INFO.name} | B2B Trade Desk`}
                        />
                        <Input
                          label="Meta Description"
                          multiline rows={2}
                          value={seoSettings.contact.description}
                          onChange={(e) => handleSeoChange('contact', 'description', e.target.value)}
                          placeholder="Get in touch with ZM Supplier & Trading. Contact our UK-standard trade..."
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ফর্ম অ্যাকশন বাটন */}
            <div className="flex justify-end pt-6 mt-8 border-t border-brand-neutral-border">
              <Button type="submit" variant="primary" size="md" isLoading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </Button>
            </div>
          </form>
        )}

      </div>
    </>
  );
};