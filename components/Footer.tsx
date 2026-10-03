"use client";
import Link from "next/link";
import Image from "next/image";
import { Globe, MapPin, Phone, QrCode } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { FacebookIcon } from "./icons/FacebookIcon";



export default function Footer() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  
  const t = {
    academy: isAr ? "الأكاديمية الحزبية" : "JCP Academy",
    party: isAr ? "حزب المحافظين الأردني" : "Jordanian Conservative Party",
    vision: isAr ? "تطوير العمل الحزبي الوطني برؤية وطنية صادقة تحقق الإنجاز، وترسيخ العمل الحزبي كرافعة للمشاركة السياسية." : "Developing national party work with a sincere national vision that achieves success, and consolidating party work as a lever for political participation.",
    quickLinks: isAr ? "روابط هامة" : "Important Links",
    contact: isAr ? "تواصل معنا" : "Contact Us",
    location: isAr ? "الموقع الجغرافي" : "Location",
    address: isAr ? "عمان-شارع مكة - دخلة محطة السندباد للمحروقات - يمين الدوار- شارع الريحانة - بناية رقم 20 - الطابق الارضي شمال" : "Amman - Mecca Street - Sindbad Gas Station Entrance - Right of the Roundabout - Rayhana Street - Building 20 - Ground Floor North",
    phoneText: isAr ? "هاتف الأمين العام: 0795553367" : "Sec. General Phone: +962 79 555 3367",
    website: isAr ? "الموقع الإلكتروني" : "Website",
    facebook: isAr ? "فيسبوك" : "Facebook",
    iec: isAr ? "الهيئة المستقلة للانتخاب" : "Independent Election Commission",
    politicalMinistry: isAr ? "وزارة الشؤون السياسية والبرلمانية" : "Ministry of Political & Parliamentary Affairs",
  };

  return (
    <footer className="bg-jcp-navy text-white mt-auto pt-16 pb-8 border-t-4 border-jcp-red">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="font-almarai font-black text-2xl mb-2 text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-jcp-red rounded-full inline-block"></span>
              {t.academy}
            </h3>
            <h4 className="text-jcp-gold font-bold mb-6 font-almarai">{t.party}</h4>
            <p className="text-slate-300 font-almarai leading-relaxed max-w-md">
              {t.vision}
            </p>

            {/* Site QR Mini Card */}
            <div className="mt-6 flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 max-w-xs shadow-md">
              <div className="bg-white p-1 rounded-xl shrink-0">
                <Image
                  src="/jcpacademy-qr.png"
                  alt="QR Code"
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white font-almarai">{isAr ? "امسح الرمز للدخول السريع" : "Scan for Quick Access"}</p>
                <Link href="/qr" className="text-jcp-gold hover:underline font-cairo mt-1 inline-block font-semibold">
                  {isAr ? "عرض الرمز بالحجم الكامل ←" : "View Full QR ←"}
                </Link>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-almarai border-b border-slate-700 pb-2 inline-block">{t.quickLinks}</h4>
            <ul className="space-y-3 font-almarai text-slate-300">
              <li><Link href="/qr" className="hover:text-jcp-gold transition-colors flex items-center gap-2"><QrCode size={16} /> {isAr ? "رمز QR الرسمي للمنصة" : "Official Academy QR Code"}</Link></li>
              <li><a href="https://conservativesparty.jo/about/" target="_blank" rel="noopener noreferrer" className="hover:text-jcp-gold transition-colors flex items-center gap-2"><Globe size={16} /> {isAr ? "الموقع الرسمي للحزب" : "Official Party Website"}</a></li>
              <li><a href="https://parties.iec.jo/%D8%A7%D9%84%D8%A7%D8%AD%D8%B2%D8%A7%D8%A8/almohfden" target="_blank" rel="noopener noreferrer" className="hover:text-jcp-gold transition-colors flex items-center gap-2"><Globe size={16} /> {t.iec}</a></li>
              <li><a href="https://moppa.gov.jo" target="_blank" rel="noopener noreferrer" className="hover:text-jcp-gold transition-colors flex items-center gap-2"><Globe size={16} /> {t.politicalMinistry}</a></li>
              <li><Link href="/programs" className="hover:text-jcp-gold transition-colors flex items-center gap-2">{isAr ? "البرامج التدريبية للأكاديمية" : "Academy Training Programs"}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-almarai border-b border-slate-700 pb-2 inline-block">{t.contact}</h4>
            <ul className="space-y-4 font-almarai text-slate-300">
              <li className="flex items-start gap-3">
                <MapPin className="text-jcp-gold shrink-0 mt-1" size={20} />
                <a href="https://maps.app.goo.gl/eAw53e9hAtzN845D8?g_st=aw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm leading-relaxed">
                  {t.address}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-jcp-gold shrink-0" size={20} />
                <span className="text-sm" dir="ltr">{t.phoneText}</span>
              </li>
              <li className="flex gap-4 mt-6">
                <a href="https://www.facebook.com/share/p/1C9UhbHiye/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-slate-400" aria-label={t.facebook}>
                  <FacebookIcon size={20} />
                </a>
                <a href="https://conservativesparty.jo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-jcp-gold hover:text-jcp-navy transition-all text-slate-400" aria-label={t.website}>
                  <Globe size={20} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 font-almarai">
          <p>{t.academy} - {t.party} © {new Date().getFullYear()}</p>
          <p className="text-slate-400 text-center">
            {isAr ? "جميع الحقوق محفوظة لـ " : "All rights reserved to "}
            <span className="font-bold text-white tracking-wider bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">QFIX</span>
          </p>
          <p className="text-jcp-gold font-bold tracking-widest">{isAr ? "هويَّة – انتماء – مواطنة" : "Identity – Belonging – Citizenship"}</p>
        </div>
      </div>
    </footer>
  );
}
