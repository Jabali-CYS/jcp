export type ContactInfo = {
  id: string;
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
  href?: string;
  type: "address" | "phone" | "email" | "website" | "map" | "social";
  provenance: "SOURCE_VERIFIED" | "USER_SPECIFIED";
};

export const contactData: ContactInfo[] = [
  {
    id: "address",
    labelAr: "المقر الرئيسي",
    labelEn: "Headquarters",
    valueAr: "عمان - شارع مكة - دخلة محطة السندباد للمحروقات - يمين الدوار - شارع الريحانة - بناية رقم 20 - الطابق الارضي شمال",
    valueEn: "Amman - Mecca Street - Sindbad Gas Station Entrance - Right of the roundabout - Al-Rayhana Street - Building 20 - Ground Floor North",
    type: "address",
    provenance: "SOURCE_VERIFIED"
  },
  {
    id: "website",
    labelAr: "الموقع الإلكتروني الرسمي",
    labelEn: "Official Website",
    valueAr: "conservativesparty.jo",
    valueEn: "conservativesparty.jo",
    href: "https://conservativesparty.jo",
    type: "website",
    provenance: "SOURCE_VERIFIED"
  },
  {
    id: "map",
    labelAr: "الموقع على الخريطة",
    labelEn: "Location Map",
    valueAr: "عرض الموقع على خرائط جوجل",
    valueEn: "View location on Google Maps",
    href: "https://maps.app.goo.gl/eAw53e9hAtzN845D8?g_st=aw",
    type: "map",
    provenance: "SOURCE_VERIFIED"
  },
  {
    id: "facebook",
    labelAr: "فيسبوك",
    labelEn: "Facebook",
    valueAr: "الصفحة الرسمية لحزب المحافظين الأردني",
    valueEn: "Official Facebook Page",
    href: "https://www.facebook.com/share/p/1C9UhbHiye/",
    type: "social",
    provenance: "SOURCE_VERIFIED"
  },
  {
    id: "iec",
    labelAr: "الهيئة المستقلة للانتخاب",
    labelEn: "Independent Election Commission",
    valueAr: "سجل حزب المحافظين الأردني لدى الهيئة",
    valueEn: "Party registration on IEC portal",
    href: "https://parties.iec.jo/%D8%A7%D9%84%D8%A7%D8%AD%D8%B2%D8%A7%D8%A8/almohfden",
    type: "website",
    provenance: "SOURCE_VERIFIED"
  },
  {
    id: "ministry",
    labelAr: "وزارة الشؤون السياسية والبرلمانية",
    labelEn: "Ministry of Political Affairs",
    valueAr: "البوابة الرسمية للوزارة",
    valueEn: "Official Ministry Portal",
    href: "https://moppa.gov.jo",
    type: "website",
    provenance: "SOURCE_VERIFIED"
  }
];
