import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { BRAND_INFO } from '../../shared/constants';
import { Mail, Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  
  // ফর্ম স্টেটসমূহ
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ফায়ারবেস লগইন হ্যান্ডলার (Part 10, Section 11)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both business email and password.');
      return;
    }

    try {
      setLoading(true);
      
      // ফায়ারবেস অথেনটিকেশন সাইন-ইন অপারেশন
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      toast.success('Successfully authenticated. Welcome to ZM Admin Panel.');
      navigate('/admin/dashboard'); // লগইন সফল হলে ড্যাশবোর্ডে রিডাইরেক্ট হবে
    } catch (error: any) {
      console.error('[Admin Login Auth Error]:', error);
      
      // বায়ার এবং স্টাফদের জন্য স্ট্যান্ডার্ড ইউকে এরর মেসেজিং (Part 07, Rule 110)
      let friendlyMessage = 'Invalid email or password. Please try again.';
      
      if (error.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        friendlyMessage = 'Too many failed login attempts. This account is temporarily locked. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        friendlyMessage = 'This administrator account has been disabled. Please contact the Super Admin.';
      }

      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* অ্যাডমিন লগইন পেজের স্বাধীন এসইও ট্যাগস (ইনডেক্সিং কঠোরভাবে বন্ধ - Part 07, Rule 11) */}
      <Helmet>
        <title>Admin Login | {BRAND_INFO.name}</title>
        <meta name="description" content="Secure administrator login portal for ZM Supplier & Trading." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* প্রিমিয়াম লাক্সারি করপোরেট ব্যাকগ্রাউন্ড ও প্যানেল লেআউট (Design Tokens সিঙ্ক করা - Part 02) */}
      <section className="min-h-screen bg-brand-bg-alt flex items-center justify-center p-4 relative overflow-hidden text-left">
        {/* ব্যাকগ্রাউন্ড গোল্ডেন ফ্লেয়ার শ্যাডো */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-accent/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-brand-neutral-border p-8 rounded-card shadow-premium relative z-10 flex flex-col items-stretch">
          
          {/* লোগো ও ব্র্যান্ড উইন্ডো */}
          <div className="flex flex-col items-center text-center mb-8 select-none">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-primary text-brand-accent font-heading font-extrabold text-2xl shadow-soft border border-brand-primary-light mb-4">
              ZS
            </div>
            <span className="text-brand-primary font-heading font-extrabold text-xs tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-accent" />
              Secure Admin Gateway
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-brand-neutral-charcoal">
              Sign In to Dashboard
            </h2>
            <p className="text-xs text-brand-neutral-muted mt-1">
              ZM Supplier & Trading B2B Control Centre
            </p>
          </div>

          {/* মেইন লগইন ফর্ম (ভ্যালিডেশন ও লোডিং স্টেজ সহ - Part 04, Section 17) */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* ইমেল ইনপুট */}
            <Input
              label="Administrator Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@zmsupplier.co.uk"
              leftIcon={<Mail className="w-4 h-4 text-brand-neutral-muted" />}
              disabled={loading}
            />

            {/* পাসওয়ার্ড ইনপুট */}
            <Input
              label="Security Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-brand-neutral-muted" />}
              disabled={loading}
            />

            {/* লগইন সাবমিট অ্যাকশন বাটন */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to System
            </Button>
          </form>

          {/* ফুটার কপিরাইট সেকশন */}
          <div className="mt-8 text-center text-[10px] font-bold text-brand-neutral-muted tracking-wide uppercase select-none">
            &copy; {new Date().getFullYear()} {BRAND_INFO.name}. All Rights Reserved.
          </div>

        </div>
      </section>
    </>
  );
};