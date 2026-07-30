"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogIn, Eye, EyeOff, X } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { GifBackground } from "@/components/GifGallery";
import falinksImage from '@/assets/images/stat-falinks.png';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].login;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Traduzir alguns erros comuns do Supabase ou mostrar a mensagem original
      let errorMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = t.errorCredentials;
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = t.errorConfirm;
      }
      
      setError(errorMessage);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8">
      {/* Background (GifGallery Effect) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <GifBackground spread={true} overlay={false} className="!h-full !bg-slate-100 dark:!bg-slate-950 opacity-30 dark:opacity-20" />
      </div>

      {/* Main Split Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/40 dark:border-slate-700/50 min-h-[600px]">
        
        {/* Close button that goes to home */}
        <Link href="/" className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-20">
          <X className="w-6 h-6" />
        </Link>

        {/* Left Side: Falinks Image */}
        <div className="hidden md:flex flex-1 p-8 flex-col bg-white dark:bg-slate-900 relative">
          <div className="flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center relative">
            <div className="absolute inset-0 w-full h-full translate-x-[15%] lg:translate-x-[20%] scale-[1.15]">
              <Image src={falinksImage} alt="Falinks" fill className="object-contain -scale-x-100" />
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center mb-10 w-full">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white text-center">{t.enter}</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6 w-full max-w-md mx-auto md:mx-0">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.email}</label>
              <input
                type="email"
                required
                className="px-5 py-4 bg-[#ebf0f5] dark:bg-slate-800 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#59F7E2] transition-colors text-slate-700 dark:text-white font-medium w-full placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-5 py-4 bg-[#ebf0f5] dark:bg-slate-800 border-2 border-transparent rounded-xl focus:outline-none focus:border-[#59F7E2] transition-colors text-slate-700 dark:text-white font-medium pr-12 placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-4 bg-white dark:bg-slate-800 border-2 border-[#59F7E2] hover:bg-[#59F7E2]/10 dark:hover:bg-[#59F7E2]/20 text-slate-700 dark:text-slate-200 font-bold rounded-full shadow-sm hover:shadow-md transition-all disabled:opacity-50 text-lg flex items-center justify-center"
            >
              {loading ? t.entering : t.enter}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-400 max-w-xs mx-auto">
            {t.onlyAdmins}
          </p>
        </div>
      </div>
    </div>
  );
}
