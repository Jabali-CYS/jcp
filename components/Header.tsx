"use client";

import Link from "next/link";

import { Menu, X, Moon, Sun, ChevronDown, Globe, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useLanguage } from "./LanguageProvider";
import { usePathname } from "next/navigation";
import { FacebookIcon } from "./icons/FacebookIcon";



export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
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
    gallery: isAr ? "معرض الصور" : "Gallery",
    ecosystem: isAr ? "منظومة الأكاديمية" : "Academy Ecosystem",
    explore: isAr ? "استكشف" : "Explore",
    units: isAr ? "الوحدات الإدارية" : "Administrative Units",
    skills: isAr ? "تطوير المهارات" : "Skills Development",
    services: isAr ? "الخدمات" : "Services",
    onlineCourses: isAr ? "الدورات الأونلاين" : "Online Courses",
    contact: isAr ? "تواصل معنا" : "Contact Us",
    login: isAr ? "تسجيل الدخول" : "Login",
    themeToggle: isAr ? "تبديل الوضع الليلي" : "Toggle Theme",
  };

  const navLinkClass = (path: string) => 
    `transition-colors focus:outline-none ${pathname === path ? 'text-jcp-navy dark:text-white' : 'hover:text-jcp-navy dark:hover:text-white'}`;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-8 py-3 flex justify-between items-center min-h-[5rem] gap-2 lg:gap-4">
        
        {/* Right Side: Academy Logo (RTL context) */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-jcp-navy rounded-md p-1 transition-colors">
            <div className="dark:bg-white dark:p-1.5 dark:rounded-lg transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/academy-logo.png" 
                alt={isAr ? "شعار الأكاديمية الحزبية" : "JCP Academy Logo"}
                width={96} 
                height={96} 
                className="object-contain h-16 md:h-20 lg:h-24 w-auto transition-all mix-blend-multiply dark:mix-blend-normal"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-almarai font-black text-2xl text-jcp-navy dark:text-white leading-tight group-hover:text-jcp-green transition-colors">
                {t.academy}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 tracking-wide font-almarai font-bold mt-1">
                {t.party}
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation & Title */}
        <div className="hidden xl:flex flex-1 min-w-0 flex-col items-center justify-center gap-1.5">
          <div className="font-readex font-bold text-2xl text-jcp-red tracking-wide drop-shadow-sm whitespace-nowrap">{t.platform}</div>
          <nav className="flex items-center gap-6 font-almarai font-semibold text-[14px] text-slate-700 dark:text-slate-300">
            <Link href="/" className={navLinkClass("/")}>{t.home}</Link>
            <Link href="/about" className={navLinkClass("/about")}>{t.about}</Link>
            <Link href="/packages" className={navLinkClass("/packages")}>{t.packages}</Link>
            <Link href="/programs" className={navLinkClass("/programs")}>{t.programs}</Link>
            <Link href="/gallery" className={navLinkClass("/gallery")}>{t.gallery}</Link>
            
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
        </div>

        {/* Left Side: Party Logo & Controls */}
        <div className="flex items-center justify-end gap-2 lg:gap-4 shrink-0">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-500 hover:text-jcp-navy dark:text-slate-400 dark:hover:text-white focus:outline-none transition-colors"
              aria-label={t.themeToggle}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-sm font-almarai text-slate-500 dark:text-slate-400 border-e border-slate-200 dark:border-slate-700 pe-4">
            <button onClick={() => setLanguage('ar')} className={`font-bold focus:outline-none focus:underline ${isAr ? 'text-jcp-navy dark:text-white' : 'hover:text-jcp-navy dark:hover:text-white transition-colors'}`} aria-label={isAr ? "اللغة العربية" : "Arabic Language"}>AR</button>
            <span>|</span>
            <button onClick={() => setLanguage('en')} className={`font-bold focus:outline-none focus:underline ${!isAr ? 'text-jcp-navy dark:text-white' : 'hover:text-jcp-navy dark:hover:text-white transition-colors'}`} aria-label="English Language">EN</button>
          </div>
          
          <div className="hidden md:block border-e border-slate-200 dark:border-slate-700 pe-4">
             <Link 
               href="/login" 
               className="text-sm bg-jcp-navy text-white px-5 py-2.5 rounded-md font-almarai font-bold hover:bg-jcp-green transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jcp-navy shadow-sm"
             >
               {t.login}
             </Link>
          </div>

          {/* Social Links Snippet */}
          <div className="hidden lg:flex items-center gap-3 border-e border-slate-200 dark:border-slate-700 pe-4 text-slate-400 dark:text-slate-500">
            <a href="https://www.facebook.com/share/p/1C9UhbHiye/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors"><FacebookIcon size={20} /></a>
            <a href="https://conservativesparty.jo" target="_blank" rel="noopener noreferrer" className="hover:text-jcp-navy dark:hover:text-white transition-colors"><Globe size={20} /></a>
            <a href="https://maps.app.goo.gl/eAw53e9hAtzN845D8?g_st=aw" target="_blank" rel="noopener noreferrer" className="hover:text-jcp-red transition-colors"><MapPin size={20} /></a>
          </div>

          <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-jcp-navy rounded-md p-1 transition-colors">
             <div className="dark:bg-white dark:p-1.5 dark:rounded-full transition-colors flex items-center justify-center">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src="/party-logo.png" 
                 alt={isAr ? "شعار حزب المحافظين الأردني" : "Jordanian Conservative Party Logo"}
                 width={80} 
                 height={80} 
                 className="object-contain h-14 md:h-16 lg:h-20 w-auto transition-all mix-blend-multiply dark:mix-blend-normal"
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
              <Link href="/gallery" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.gallery}</Link>
              <Link href="/services" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.services}</Link>
              <Link href="/online-courses" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.onlineCourses}</Link>
              <Link href="/contact" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{t.contact}</Link>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                <Link href="/login" className="block text-center w-full bg-jcp-navy text-white px-4 py-3 rounded-md hover:bg-jcp-green transition-colors">
                  {t.login}
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
