"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Laptop, Clock, Award, Users, BookOpen, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OnlineCoursesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const courses = [
    {
      id: "beginner",
      title: isAr ? "دورة حزبي مبتدئ" : "Beginner Party Member Course",
      subtitle: isAr ? "المستوى الأول والثاني: تأهيل الحزبي الجديد" : "Levels 1 & 2: New Member Qualification",
      duration: isAr ? "8 أسابيع (16 محاضرة - 90 دقيقة للمحاضرة)" : "8 weeks (16 lectures - 90 min each)",
      target: isAr ? "إجباري لكل منتسب جديد" : "Mandatory for all new members",
      certificate: isAr ? "شهادة إتمام معتمدة بعد اجتياز الاختبار (70% فما فوق)" : "Certified completion certificate (70%+ passing grade)",
      description: isAr 
        ? "حقيبة تدريبية متكاملة لترسيخ الوعي الدستوري، وفهم الحياة الحزبية وقانون الأحزاب، والتعريف بهوية حزب المحافظين وأركانه الأربعة ومبادئه." 
        : "A comprehensive training package to consolidate constitutional awareness, understand party life, and introduce conservative party identity.",
      topics: [
        isAr ? "الدولة الأردنية وتاريخ الحياة الحزبية ورؤية التحديث السياسي" : "Jordanian State, political life history and modernization vision",
        isAr ? "الدستور والقوانين الناظمة (قانون الأحزاب والانتخاب الجديد)" : "The Constitution and governing laws (Parties & Elections laws)",
        isAr ? "هوية حزب المحافظين الأردني وأركانه الأربعة (سياسياً، اقتصادياً، اجتماعياً، أمنياً)" : "Party identity and 4 core pillars",
        isAr ? "التنظيم الداخلي والحقوق والواجبات ومدونة السلوك" : "Internal organization, rights, duties and code of conduct",
        isAr ? "الأيديولوجيات السياسية وموقع الحزب في الوسط المحافظ" : "Political ideologies and the party's conservative position",
        isAr ? "المواطنة الفاعلة، الديمقراطية والحوار، وتمكين المرأة والشباب" : "Active citizenship, democracy, dialogue, women & youth empowerment",
        isAr ? "الثوابت الوطنية والوصاية الهاشمية ومكافحة الشائعات والأخبار المضللة" : "National constants, Hashemite custodianship, and combating rumors",
        isAr ? "المشروع النهائي: إعداد ورقة سياسات ومبادرة مجتمعية" : "Final project: Policy paper and community initiative",
      ]
    },
    {
      id: "leadership",
      title: isAr ? "دورة قيادي حزبي" : "Party Leadership Course",
      subtitle: isAr ? "المستوى الثالث والرابع: المهارات القيادية والتخصصية للكوادر المتقدمة" : "Levels 3 & 4: Leadership and Advanced Skills",
      duration: isAr ? "12 أسبوعاً (الفوج الأول - إعداد القيادات المحافظة)" : "12 weeks (Cohort 1 - Conservative Leadership Preparation)",
      target: isAr ? "الكوادر المتقدمة ورؤساء الفروع والمكاتب واللجان" : "Advanced cadres, branch heads, and committee leaders",
      certificate: isAr ? "شهادة قيادية معتمدة ومسجلة من الحزب والهيئة المستقلة" : "Accredited leadership certificate registered with IEC and party",
      description: isAr 
        ? "برنامج قيادي مكثف يركز على مهارات القيادة الميدانية، فن الخطابة، إدارة الحملات الانتخابية، صياغة أوراق السياسات، والتفاوض الدبلوماسي الحزبي." 
        : "An intensive leadership program focused on field leadership, public speaking, campaign management, policy paper drafting, and diplomacy.",
      topics: [
        isAr ? "القيادة الحزبية وإدارة الفروع والمكاتب التنظيمية" : "Party leadership and branch management",
        isAr ? "صياغة البرامج الحزبية والبيان الانتخابي وأوراق السياسات" : "Formulating party programs, election manifestos and policy papers",
        isAr ? "الاتصال السياسي، فن الخطابة والإلقاء والظهور الإعلامي" : "Political communication, public speaking and media presence",
        isAr ? "إدارة الحملات الانتخابية ميدانياً ورقمياً (من الباب للباب)" : "Election campaign management (field and digital)",
        isAr ? "التفاوض السياسي، بناء التحالفات والائتلافات، والدبلوماسية الحزبية" : "Political negotiation, coalition building and party diplomacy",
        isAr ? "إدارة الأزمات والسمعة الحزبية والتثقيف الإعلامي المتقدم" : "Crisis management, party reputation and advanced media education",
        isAr ? "المالية الحزبية، الحوكمة الرشيدة، والشفافية الرقابية" : "Party finance, governance, and transparency",
        isAr ? "إعداد المدربين TOT في الثقافة الحزبية وبناء الكوادر" : "Training of Trainers (TOT) in political education",
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold font-cairo">
            <Laptop className="w-4 h-4" />
            <span>{isAr ? "المسارات التدريبية المعتمدة" : "Accredited Training Tracks"}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-jcp-navy dark:text-white font-kufi">
            {isAr ? "الدورات والمسارات التدريبية" : "Training Courses & Tracks"}
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-cairo max-w-2xl mx-auto">
            {isAr 
              ? "مناهج معتمدة رسمياً مبنية على وثائق الأكاديمية الحزبية لحزب المحافظين لتأهيل الأعضاء وإعداد القيادات الوطنية." 
              : "Officially accredited curricula based on JCP Academy documents to qualify members and prepare national leaders."}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div 
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 font-cairo uppercase tracking-wider">
                    {course.subtitle}
                  </span>
                  <h2 className="text-2xl font-bold text-jcp-navy dark:text-white font-kufi mt-1">
                    {course.title}
                  </h2>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 font-cairo leading-relaxed">
                  {course.description}
                </p>

                <div className="space-y-2 py-4 border-y border-slate-100 dark:border-slate-800 font-cairo text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-jcp-gold shrink-0" />
                    <span><strong>{isAr ? "المدة:" : "Duration:"}</strong> {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-jcp-gold shrink-0" />
                    <span><strong>{isAr ? "الفئة المستهدفة:" : "Target:"}</strong> {course.target}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-jcp-gold shrink-0" />
                    <span><strong>{isAr ? "الشهادة:" : "Certificate:"}</strong> {course.certificate}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-cairo mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                    <span>{isAr ? "المحاور والحقائب التدريبية المتضمنة:" : "Included modules and topics:"}</span>
                  </h3>
                  <ul className="space-y-2">
                    {course.topics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 font-cairo">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/programs"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white bg-jcp-navy hover:bg-jcp-green transition-colors font-bold font-cairo shadow-sm"
                >
                  <span>{isAr ? "التسجيل في البرامج المعتمدة" : "Enroll in Accredited Programs"}</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
