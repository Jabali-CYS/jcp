export interface NewsItem {
  id: string;
  title: string;
  titleEn?: string;
  summary: string;
  summaryEn?: string;
  date: string;
  category: string;
  categoryEn?: string;
  image?: string;
}

export const newsData: NewsItem[] = [
  {
    id: "1",
    title: "إطلاق الأكاديمية الحزبية لحزب المحافظين الأردني رسمياً",
    titleEn: "Official Launch of the JCP Academy for Political Qualification",
    summary: "أعلن حزب المحافظين الأردني عن إطلاق المنصة الإلكترونية للأكاديمية الحزبية، بهدف تدريب وتأهيل الكوادر الحزبية وتطوير الفكر المحافظ وفق أسس علمية ومؤسسية.",
    summaryEn: "The Jordanian Conservative Party announced the launch of the JCP Academy electronic platform to train and qualify party cadres.",
    date: "2026-09-28",
    category: "أخبار الأكاديمية",
    categoryEn: "Academy News",
    image: "/gallery/gallery-1.jpg"
  }
];
