/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: '#024E33', // Deep Emerald Green (গাঢ় পান্না সবুজ)
            dark: '#013D21',
            light: '#036548',
          },
          secondary: {
            DEFAULT: '#012E1C', // Dark Forest Green (গাঢ় বন সবুজ)
            dark: '#011F13',
            light: '#024027',
          },
          accent: {
            DEFAULT: '#D4AF37', // Premium Gold (প্রিমিয়াম সোনালী)
            dark: '#B89B2B',
            light: '#E2C253',
            pale: '#F9F6EA', // ম্লান গোল্ডেন টোন (হালকা ব্যাকগ্রাউন্ড)
          },
          neutral: {
            charcoal: '#1C1C1C', // Dark Charcoal (গাঢ় চারকোল টেক্সট)
            dark: '#2B2B2B',
            muted: '#6B7280', // Medium Gray (মিউটেড টেক্সট)
            gray: '#F3F4F6',
            border: '#EAEAEA', // লাইট বর্ডার কালার
          },
          surface: '#FCFCFC', // Soft White (কার্ডের জন্য)
          bg: {
            DEFAULT: '#FFFFFF', // Pure White (প্রধান ব্যাকগ্রাউন্ড)
            alt: '#F8F9FA', // Light Gray (বিকল্প ব্যাকগ্রাউন্ড)
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // বডি টেক্সটের জন্য
        heading: ['Plus Jakarta Sans', 'Manrope', 'sans-serif'], // হেডিংয়ের জন্য
      },
      borderRadius: {
        btn: '12px', // বাটন বর্ডার রেডিয়াস
        card: '20px', // কার্ড বর্ডার রেডিয়াস
        form: '16px', // ফর্ম ইনপুট বর্ডার রেডিয়াস
        img: '20px', // সাধারণ ছবি বর্ডার রেডিয়াস
        hero: '24px', // হিরো সেকশনের বড় ছবির বর্ডার রেডিয়াস
        badge: '999px', // ব্যাজ বর্ডার রেডিয়াস
      },
      boxShadow: {
        // ব্র্যান্ডের সাথে সামঞ্জস্যপূর্ণ সফট লাক্সারি শ্যাডো
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 8px -1px rgba(0, 0, 0, 0.02)',
        premium: '0 10px 30px -3px rgba(2, 78, 51, 0.04), 0 4px 12px -2px rgba(2, 78, 51, 0.02)',
        accent: '0 10px 25px -5px rgba(212, 175, 55, 0.15)',
        header: '0 2px 15px -1px rgba(0, 0, 0, 0.03)',
        dropdown: '0 12px 30px -4px rgba(0, 0, 0, 0.08)',
        modal: '0 20px 50px -6px rgba(0, 0, 0, 0.12)',
      },
      maxWidth: {
        container: '1280px', // সর্বোচ্চ কন্টেইনার উইডথ
        content: '1200px', // সর্বোচ্চ কন্টেন্ট উইডথ
      },
      animation: {
        // সাবলীল এবং প্রিমিয়াম অ্যানিমেশনস (Framer Motion ছাড়াও সিএসএস ট্রানজিশনের জন্য)
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'image-zoom': 'imageZoom 20s ease-out infinite alternate',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        imageZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
}