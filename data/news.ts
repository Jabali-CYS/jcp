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
  },
  {
    id: "2",
    title: "اعتماد برنامج إعداد القيادات المحافظة (الفوج الأول)",
    titleEn: "Approval of the Conservative Leadership Preparation Program (Cohort 1)",
    summary: "اعتمدت الأكاديمية برنامج الفصل الدراسي الكامل (12 أسبوعاً) لتأهيل القيادات في مجالات الاتصال السياسي، صياغة البرامج، وإدارة الحملات الانتخابية.",
    summaryEn: "The Academy approved the 12-week leadership program focusing on political communication and campaign management.",
    date: "2026-09-25",
    category: "البرامج التدريبية",
    categoryEn: "Training Programs",
    image: "/gallery/extra-1.jpeg"
  },
  {
    id: "3",
    title: "عقد ورشة عمل حول قانون الأحزاب والانتخاب ورؤية التحديث السياسي",
    titleEn: "Workshop on Political Parties Law and Modernization Vision",
    summary: "نظمت الأكاديمية جلسة حوارية موسعة حول الأوراق النقاشية الملكية والمنظومة القانونية الناظمة للحياة السياسية بمشاركة نخبة من قيادات الحزب والمتدربين.",
    summaryEn: "A dialogue session was held on Royal Discussion Papers and political reform laws.",
    date: "2026-09-20",
    category: "ورش العمل",
    categoryEn: "Workshops",
    image: "/gallery/extra-4.jpeg"
  },
  {
    id: "4",
    title: "توسيع برامج تمكين المرأة والشباب في فروع المحافظات",
    titleEn: "Expanding Women & Youth Empowerment Programs across Governorates",
    summary: "ضمن خطة الأكاديمية التشغيلية، انطلقت لقاءات ميدانية لتعزيز الحضور الشبابي والنسائي في الهيئات القيادية وفروع الحزب بالمملكة.",
    summaryEn: "Field meetings commenced to enhance youth and female leadership across party branches.",
    date: "2026-09-15",
    category: "أنشطة الحزب",
    categoryEn: "Party Activities",
    image: "/gallery/extra-3.jpeg"
  }
];
