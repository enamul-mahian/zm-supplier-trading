/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  // প্রয়োজনে আপনার ফায়ারবেস বা অন্যান্য env ভ্যারিয়েবলগুলোও এখানে যুক্ত করতে পারবেন
  // readonly VITE_FIREBASE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}