import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

// ESM ডিরেক্টরি পাথ রেজোলিউশন
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@atoms': path.resolve(__dirname, './src/components/atoms'),
      '@molecules': path.resolve(__dirname, './src/components/molecules'),
      '@organisms': path.resolve(__dirname, './src/components/organisms'),
      '@layouts': path.resolve(__dirname, './src/components/layouts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    host: true, // লোকাল নেটওয়ার্কে টেস্টিংয়ের সুবিধা নিশ্চিত করার জন্য
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // প্রোডাকশনে সিকিউরিটি বাড়ানোর জন্য সোর্সম্যাপ নিষ্ক্রিয় করা হয়েছে
    rollupOptions: {
      output: {
        manualChunks: {
          // রুট-লেভেল কোড স্প্লিটিং ও পারফরম্যান্স অপ্টিমাইজেশন
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          animations: ['framer-motion'],
        },
      },
    },
  },
});