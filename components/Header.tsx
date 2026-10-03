"use client";

import Link from "next/link";

import { Menu, X, Moon, Sun, ChevronDown, Globe, MapPin, Shield, LogOut, QrCode, User } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useLanguage } from "./LanguageProvider";
import { usePathname, useRouter } from "next/navigation";
import { FacebookIcon } from "./icons/FacebookIcon";
import { createClient } from "@/lib/supabase/client";
import SiteQrModal from "./SiteQrModal";

interface HeaderProps {
  initialUser?: { id: string; email?: string } | null;
  initialIsAdmin?: boolean;
}

export default function Header({ initialUser = null, initialIsAdmin = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(initialUser);
  const [isAdmin, setIsAdmin] = useState<boolean>(initialIsAdmin);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error", e);
    } finally {
      setUser(null);
      setIsAdmin(false);
      router.push("/login");
      router.refresh();
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle()
          .then(({ data: rData }) => {
            setIsAdmin(rData?.role === 'admin');
          });
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(({ data: rData }) => {
            setIsAdmin(rData?.role === 'admin');
          });
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close menus when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
    setIsExploreOpen(false);
  }, [pathname]);

  const isAr = language === 'ar';
  const t = {
    academy: isAr ? "الأكاديمية الحزبية" : "JCP Academy",
    party: isAr ? "حزب المحافظين الأردني" : "Jordanian Conservative Party",
    platform: isAr ? "المنصة الإلكترونية" : "Electronic Platform",
    home: isAr ? "الرئيسية" : "Home",
    about: isAr ? "من نحن" : "About Us",
    packages: isAr ? "الحقائب التثقيفية" : "Training Packages",
    programs: isAr ? "البرامج التدريبية" : "Training Programs",
    gallery: isAr ? "الأخبار والمعرض" : "News & Gallery",
    ecosystem: isAr ? "منظومة الأكاديمية" : "Academy Ecosystem",
    explore: isAr ? "استكشف" : "Explore",
    units: isAr ? "الوحدات الإدارية" : "Administrative Units",
    skills: isAr ? "تطوير المهارات" : "Skills Development",
    services: isAr ? "الخدمات" : "Services",
    onlineCourses: isAr ? "الدورات الأونلاين" : "Online Courses",
    contact: isAr ? "تواصل معنا" : "Contact Us",
    login: isAr ? "تسجيل الدخول" : "Login",
    logout: isAr ? "تسجيل الخروج" : "Logout",
    shortLogout: isAr ? "خروج" : "Logout",
    themeToggle: isAr ? "تبديل الوضع الليلي" : "Toggle Theme",
  };

  const navLinkClass = (path: string) => 
    `transition-colors focus:outline-none ${pathname === path ? 'text-jcp-navy dark:text-white' : 'hover:text-jcp-navy dark:hover:text-white'}`;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      {/* Top Utility Bar: Slogan/Social, Centered Platform Title, and Controls */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800/80 text-xs py-1.5 px-4 lg:px-8 transition-colors">
        <div className="container mx-auto flex items-center justify-between gap-3">
          {/* Right (RTL): Social & Identity */}
          <div className="hidden md:flex items-center gap-3 text-slate-400 dark:text-slate-500">
            <a href="https://www.facebook.com/share/p/1C9UhbHiye/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors" title="Facebook">
              <FacebookIcon size={14} />
            </a>
            <a href="https://conservativesparty.jo" target="_blank" rel="noopener noreferrer" className="hover:text-jcp-navy dark:hover:text-white transition-colors" title="الموقع الرسمي لحزب المحافظين">
              <Globe size={14} />
            </a>
            <a href="https://maps.app.goo.gl/eAw53e9hAtzN845D8?g_st=aw" target="_blank" rel="noopener noreferrer" className="hover:text-jcp-red transition-colors" title="الموقع الجغرافي">
              <MapPin size={14} />
            </a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-almarai font-medium text-slate-600 dark:text-slate-400">
              {isAr ? "حزب المحافظين الأردني" : "Jordanian Conservative Party"}
            </span>
          </div>

          {/* Center: Requested 'المنصة الإلكترونية' perfectly centered at the top */}
          <div className="flex-1 flex items-center justify-center">
            <div className="font-readex font-bold text-sm sm:text-base text-jcp-red tracking-wide drop-shadow-sm flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-jcp-red animate-pulse" />
              <span>{t.platform}</span>
            </div>
          </div>

          {/* Left (RTL): Quick Utilities (Theme, QR, Language) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1 text-slate-500 hover:text-jcp-navy dark:text-slate-400 dark:hover:text-white transition-colors"
                aria-label={t.themeToggle}
                title={t.themeToggle}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}

            {/* Site QR Code Button */}
            <button
              onClick={() => setIsQrOpen(true)}
              className="p-1 text-slate-500 hover:text-jcp-navy dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1"
              title={isAr ? "رمز QR للموقع" : "Site QR Code"}
              aria-label={isAr ? "رمز QR للموقع" : "Site QR Code"}
            >
              <QrCode size={14} />
              <span className="hidden sm:inline font-almarai font-semibold text-[11px]">QR</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* Language Switch */}
            <div className="flex items-center gap-1.5 font-almarai font-bold text-slate-500 dark:text-slate-400">
              <button 
                onClick={() => setLanguage('ar')} 
                className={`focus:outline-none transition-colors ${isAr ? 'text-jcp-navy dark:text-white font-black' : 'hover:text-jcp-navy dark:hover:text-white'}`} 
                aria-label={isAr ? "اللغة العربية" : "Arabic Language"}
              >
                AR
              </button>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <button 
                onClick={() => setLanguage('en')} 
                className={`focus:outline-none transition-colors ${!isAr ? 'text-jcp-navy dark:text-white font-black' : 'hover:text-jcp-navy dark:hover:text-white'}`} 
                aria-label="English Language"
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar: Academy Branding, Main Navigation & User Actions */}
      <div className="container mx-auto px-4 lg:px-8 py-2.5 flex justify-between items-center min-h-[4.5rem] lg:min-h-[5.25rem] gap-4">
        
        {/* Right Side: Academy Logo (RTL context) */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-jcp-navy rounded-md p-1 transition-colors">
            <div className="dark:bg-white dark:p-1 dark:rounded-lg transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/academy-logo.png" 
                alt={isAr ? "شعار الأكاديمية الحزبية" : "JCP Academy Logo"}
                width={100} 
                height={100} 
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="object-contain h-14 sm:h-16 md:h-20 w-auto transition-all mix-blend-multiply dark:mix-blend-normal"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-almarai font-black text-xl lg:text-2xl text-jcp-navy dark:text-white leading-tight group-hover:text-jcp-green transition-colors">
                {t.academy}
              </div>
              <div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-almarai font-bold mt-0.5">
                {t.party}
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-5 lg:gap-6 font-almarai font-semibold text-[14px] text-slate-700 dark:text-slate-300">
          <Link href="/" className={navLinkClass("/")}>{t.home}</Link>
          <Link href="/about" className={navLinkClass("/about")}>{t.about}</Link>
          <Link href="/packages" className={navLinkClass("/packages")}>{t.packages}</Link>
          <Link href="/programs" className={navLinkClass("/programs")}>{t.programs}</Link>
          <Link href="/news-gallery" className={navLinkClass("/news-gallery")}>{t.gallery}</Link>
          
          {/* Explore Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsExploreOpen(true)}
            onMouseLeave={() => setIsExploreOpen(false)}
          >
            <button 
              className={`flex items-center gap-1 transition-colors focus:outline-none ${isExploreOpen ? 'text-jcp-navy dark:text-white' : 'hover:text-jcp-navy dark:hover:text-white'}`}
              aria-haspopup="true"
              aria-expanded={isExploreOpen}
            >
              {t.explore} <ChevronDown size={14} className={`transform transition-transform duration-200 ${isExploreOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isExploreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full rtl:right-0 ltr:left-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg rounded-md overflow-hidden z-50"
                >
                  <div className="py-2 flex flex-col font-almarai text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Link href="/ecosystem" className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-jcp-navy dark:hover:text-white transition-colors">{t.ecosystem}</Link>
                    <Link href="/units" className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-jcp-navy dark:hover:text-white transition-colors">{t.units}</Link>
                    <Link href="/skills" className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-jcp-navy dark:hover:text-white transition-colors">{t.skills}</Link>
                    <Link href="/services" className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-jcp-navy dark:hover:text-white transition-colors">{t.services}</Link>
                    <Link href="/online-courses" className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-jcp-navy dark:hover:text-white transition-colors">{t.onlineCourses}</Link>
                    <Link href="/contact" className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-jcp-navy dark:hover:text-white transition-colors">{t.contact}</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Left Side: Auth Controls, Party Logo, & Mobile Toggle */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="text-xs lg:text-sm bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-almarai font-black hover:brightness-105 transition-all shadow-sm flex items-center gap-1.5 border border-amber-400"
                  >
                    <Shield size={15} className="text-slate-950" />
                    <span>{isAr ? "لوحة الإدارة" : "Admin Panel"}</span>
                  </Link>
                )}
                <Link 
                  href="/dashboard/profile" 
                  className="text-xs lg:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg font-almarai font-bold transition-all shadow-sm flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                  title={isAr ? "الملف الشخصي" : "Profile"}
                >
                  <User size={14} className="text-jcp-gold" />
                  <span>{isAr ? "الملف الشخصي" : "Profile"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs lg:text-sm bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg font-almarai font-bold transition-all shadow-sm flex items-center gap-1.5 border border-red-200 dark:border-red-900/40"
                  title={t.logout}
                  aria-label={t.logout}
                >
                  <LogOut size={14} />
                  <span>{t.logout}</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="text-xs lg:text-sm bg-jcp-navy text-white px-4 py-2 rounded-md font-almarai font-bold hover:bg-jcp-green transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jcp-navy shadow-sm"
              >
                {t.login}
              </Link>
            )}
          </div>

          {/* Party Logo */}
          <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-jcp-navy rounded-md p-1 transition-colors">
            <div className="dark:bg-white dark:p-1 dark:rounded-full transition-colors flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/party-logo.png" 
                alt={isAr ? "شعار حزب المحافظين الأردني" : "Jordanian Conservative Party Logo"}
                width={80} 
                height={80} 
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="object-contain h-12 sm:h-14 md:h-16 w-auto transition-all mix-blend-multiply dark:mix-blend-normal"
              />
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="xl:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isAr ? "القائمة الرئيسية" : "Main Menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="xl:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex flex-col px-4 py-4 space-y-2 font-almarai text-slate-700 dark:text-slate-300 font-semibold shadow-inner max-h-[70vh] overflow-y-auto">
              <Link href="/" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.home}</Link>
              <Link href="/about" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.about}</Link>
              <Link href="/packages" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.packages}</Link>
              <Link href="/programs" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.programs}</Link>
              <Link href="/units" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.units}</Link>
              <Link href="/skills" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.skills}</Link>
              <Link href="/news-gallery" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.gallery}</Link>
              <Link href="/services" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.services}</Link>
              <Link href="/online-courses" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.onlineCourses}</Link>
              <Link href="/contact" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.contact}</Link>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                {user ? (
                  <div className="space-y-2">
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center justify-center gap-2 w-full bg-gold-500 text-slate-950 font-black px-4 py-3 rounded-md hover:bg-gold-400 transition-colors shadow">
                        <Shield size={18} />
                        <span>{isAr ? "لوحة الإدارة" : "Admin Panel"}</span>
                      </Link>
                    )}
                    <Link href="/dashboard" className="block text-center w-full bg-jcp-navy text-white px-4 py-2.5 rounded-md hover:bg-jcp-green transition-colors font-bold font-almarai">
                      {isAr ? "لوحة التحكم" : "Dashboard"}
                    </Link>
                    <Link href="/dashboard/profile" className="flex items-center justify-center gap-2 w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold font-almarai">
                      <User size={16} className="text-jcp-gold" />
                      <span>{isAr ? "الملف الشخصي" : "Profile"}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-md py-2.5 font-almarai font-bold text-sm transition-colors shadow-sm"
                    >
                      <LogOut size={16} />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="block text-center w-full bg-jcp-navy text-white px-4 py-3 rounded-md hover:bg-jcp-green transition-colors">
                    {t.login}
                  </Link>
                )}

                {/* Mobile QR Button */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsQrOpen(true);
                  }}
                  className="mt-3 flex items-center justify-center gap-2 w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-almarai text-xs font-semibold"
                >
                  <QrCode size={16} className="text-jcp-navy dark:text-jcp-gold" />
                  <span>{isAr ? "رمز QR للمنصة الإلكترونية" : "Site QR Code"}</span>
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <SiteQrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </header>
  );
}
