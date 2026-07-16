import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  HelpCircle, 
  LogOut, 
  Settings, 
  Users, 
  Menu, 
  X, 
  ShieldCheck, 
  Loader2,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { BRAND_INFO } from '../../shared/constants'; // ইমপোর্ট যুক্ত করা হলো (টাইপ এরর ফিক্সড)
import toast from 'react-hot-toast';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // স্টেট ম্যানেজমেন্ট
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ফায়ারস্টোর রোল-ভ্যালিডেশন লাইফসাইকেল (Part 05D, Rule 24-26)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // ফায়ারস্টোর থেকে ইউজারের রোল ফেচ করা
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const userRole = userData.role;

            // রোল পারমিশন চেক (Super Admin, Admin, বা Editor হলেই কেবল অ্যাক্সেস পাবে)
            if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'editor') {
              setRole(userRole);
            } else {
              toast.error('Access Denied. You do not have administrative permissions.');
              await signOut(auth);
              setUser(null);
              setRole(null);
              navigate('/admin/login');
            }
          } else if ((import.meta as any).env.DEV) {
            // গ্রিনফিল্ড বুটস্ট্র্যাপ হেল্পার (লোকাল ডেভলপমেন্টে ডাটাবেস সম্পূর্ণ ফাঁকা থাকলে সাময়িক লগইন বাইপাস)
            console.warn('[ZM Admin Bootstrap]: Greenfield dev mode detected. Granting temporary "super_admin" bypass for database setup.');
            setRole('super_admin');
          } else {
            toast.error('Account configuration missing. Please contact the Super Admin.');
            await signOut(auth);
            setUser(null);
            setRole(null);
            navigate('/admin/login');
          }
        } catch (error) {
          console.error('[AdminLayout Auth Check Error]:', error);
          toast.error('Authentication check failed. Please sign in again.');
          setUser(null);
          setRole(null);
          navigate('/admin/login');
        }
      } else {
        setUser(null);
        setRole(null);
        navigate('/admin/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // পেজ পরিবর্তনের সাথে সাথে মোবাইলে সাইডবার স্বয়ংক্রিয় বন্ধ করা
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // সাইন আউট বা লগআউট হ্যান্ডলার
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully logged out from Admin Panel.');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Failed to log out. Please try again.');
    }
  };

  // একটিভ মেনু চেনার হেল্পার
  const isTabActive = (path: string) => location.pathname === path;

  const adminMenu = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Manage Products', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Manage Services', path: '/admin/services', icon: <FileText className="w-4 h-4" /> },
    { label: 'Quote Requests', path: '/admin/enquiries', icon: <FileText className="w-4 h-4 text-brand-accent-dark" /> },
    { label: 'Contact Messages', path: '/admin/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Manage FAQs', path: '/admin/faqs', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  // ফুল পেজ রুট-লেভেল সিকিউরিটি চেকিং এবং প্রফেশনাল লোডিং স্টেপার
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg-alt flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
        <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-widest select-none">
          Securing Admin Environment...
        </span>
      </div>
    );
  }

  if (!user || !role) {
    return null; // অথেনটিকেশন বা রোল ভ্যালিডেশন ফেইল হলে রেন্ডারিং ব্লক থাকবে
  }

  return (
    <div className="min-h-screen bg-brand-bg-alt flex relative text-left">
      
      {/* ১. বাম পাশের ডেস্কটপ সাইডবার (Sidebar - Hides on Mobile) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-brand-secondary border-r border-brand-secondary-dark text-white p-5 justify-between shrink-0 h-screen sticky top-0">
        <div className="flex flex-col">
          {/* লোগো ও সিকিউরিটি মার্ক */}
          <Link to="/" className="flex items-center space-x-2.5 pb-6 border-b border-brand-primary-light/10 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary text-brand-accent font-heading font-extrabold text-lg border border-brand-primary-light">
              ZS
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm text-brand-accent uppercase leading-none">ZM</span>
              <span className="font-heading text-[9px] font-bold text-brand-accent-pale mt-0.5 tracking-wider uppercase leading-none">Supplier Admin</span>
            </div>
          </Link>

          {/* মেনু আইটেমসমূহ */}
          <nav className="flex flex-col space-y-2">
            {adminMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between text-xs font-bold tracking-wide py-2.5 px-4 rounded-xl transition-all duration-300 ${
                  isTabActive(item.path)
                    ? 'bg-brand-primary text-white shadow-soft border border-brand-primary-light/10'
                    : 'text-brand-accent-pale hover:bg-brand-primary/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-40 transition-transform ${isTabActive(item.path) ? 'rotate-90' : ''}`} />
              </Link>
            ))}
          </nav>
        </div>

        {/* সাইডবারের নিচের ইউজার আইডেন্টিটি ও লগআউট */}
        <div className="pt-6 border-t border-brand-primary-light/10 flex flex-col space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-accent text-xs font-bold border border-brand-primary-light/10 select-none">
              U
            </div>
            <div className="flex flex-col text-left truncate max-w-[150px]">
              <span className="text-xs font-bold text-white leading-none mb-1">{user.displayName || 'Staff Member'}</span>
              <span className="text-[10px] text-brand-accent font-extrabold uppercase tracking-wide leading-none">{role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-xs font-bold text-red-400 hover:text-red-500 py-2 px-4 rounded-xl hover:bg-red-500/5 transition-colors duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ২. ডান পাশের প্রধান ওয়ার্কস্পেস */}
      <div className="flex-grow flex flex-col min-h-screen min-w-0">
        
        {/* অ্যাডমিন ওয়ার্কস্পেস টপ-বার */}
        <header className="bg-white border-b border-brand-neutral-border py-3 px-6 flex justify-between items-center sticky top-0 z-30 shadow-header">
          <div className="flex items-center space-x-3">
            {/* মোবাইল সাইডবার টগল বাটন */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-brand-neutral-dark hover:text-brand-primary rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <span className="font-heading font-extrabold text-brand-neutral-charcoal text-base select-none flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-brand-primary" />
              Administrator Control Panel
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-4 select-none">
            <span className="text-xs font-bold text-brand-neutral-muted uppercase tracking-wide">
              {BRAND_INFO.name}
            </span>
          </div>
        </header>

        {/* রাউট-অনুযায়ী নেস্টেড সাব-পেজ লোডিং উন্ডো */}
        <main className="flex-grow p-6 md:p-8 bg-brand-bg-alt overflow-y-auto">
          <Outlet />
        </main>

      </div>

      {/* ৩. মোবাইল সাইডবার ওভারলে প্যানেল (Backdrop blurring + Body scroll locking) */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />

        <aside className={`absolute top-0 left-0 h-full w-[260px] bg-brand-secondary border-r border-brand-secondary-dark text-white p-5 flex flex-col justify-between transition-transform duration-300 safe-bottom ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col">
            <div className="flex justify-between items-center pb-6 border-b border-brand-primary-light/10 mb-6">
              <span className="font-heading font-extrabold text-brand-accent text-sm">ADMIN MENU</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-full hover:bg-brand-primary/10">
                <X className="w-5.5 h-5.5 text-brand-accent-pale" />
              </button>
            </div>

            <nav className="flex flex-col space-y-2">
              {adminMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 text-xs font-bold tracking-wide py-2.5 px-4 rounded-xl transition-all duration-300 ${
                    isTabActive(item.path)
                      ? 'bg-brand-primary text-white shadow-soft border border-brand-primary-light/10'
                      : 'text-brand-accent-pale hover:bg-brand-primary/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-brand-primary-light/10 flex flex-col space-y-4 pb-safe">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 text-xs font-bold text-red-400 hover:text-red-500 py-2.5 px-4 rounded-xl hover:bg-red-500/5 transition-colors duration-300 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </div>

    </div>
  );
};