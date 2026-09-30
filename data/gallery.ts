export type Provenance = "SOURCE_VERIFIED" | "USER_SPECIFIED" | "PLACEHOLDER";

export type GalleryAsset = {
  id: string;
  src: string;
  alt: string;
  altEn?: string;
  provenance: Provenance;
};

export const galleryData: GalleryAsset[] = [
  { id: '1', src: '/gallery/gallery-1.jpg', alt: 'توثيق بصري لفعاليات الأكاديمية الحزبية', altEn: 'Visual documentation of Academy events', provenance: 'SOURCE_VERIFIED' },
  { id: '2', src: '/gallery/gallery-2.jpg', alt: 'صورة من برامج الأكاديمية وورش العمل', altEn: 'A photo from Academy programs and workshops', provenance: 'SOURCE_VERIFIED' },
  { id: '3', src: '/gallery/gallery-3.jpg', alt: 'جانب من حضور الأنشطة الحزبية والشبابية', altEn: 'Attendees at party activities', provenance: 'SOURCE_VERIFIED' },
  { id: '4', src: '/gallery/gallery-4.jpg', alt: 'جانب من الفعاليات التدريبية وتأهيل الكوادر', altEn: 'Training events snapshot', provenance: 'SOURCE_VERIFIED' },
  { id: '5', src: '/gallery/gallery-5.jpg', alt: 'صورة جماعية من لقاءات حزب المحافظين', altEn: 'Group photo from meetings', provenance: 'SOURCE_VERIFIED' },
  { id: '6', src: '/gallery/gallery-6.jpg', alt: 'صورة توثيقية لمقر وأنشطة الحزب', altEn: 'Documentation of party activities and HQ', provenance: 'SOURCE_VERIFIED' },
  { id: '7', src: '/gallery/extra-1.jpeg', alt: 'لقاء قيادي لأعضاء الحزب والأكاديمية', altEn: 'Leadership meeting of party and academy members', provenance: 'SOURCE_VERIFIED' },
  { id: '8', src: '/gallery/extra-2.jpeg', alt: 'جلسة حوارية وتثقيف سياسي', altEn: 'Dialogue and political education session', provenance: 'SOURCE_VERIFIED' },
  { id: '9', src: '/gallery/extra-3.jpeg', alt: 'حضور الفعاليات الوطنية للحزب', altEn: 'Party national events attendance', provenance: 'SOURCE_VERIFIED' },
  { id: '10', src: '/gallery/extra-4.jpeg', alt: 'مشاركة الكوادر الشبابية في الورش التدريبية', altEn: 'Youth participation in training workshops', provenance: 'SOURCE_VERIFIED' },
  { id: '11', src: '/gallery/extra-5.jpeg', alt: 'اجتماع الأمانة العامة والمكتب السياسي', altEn: 'General Secretariat and Political Bureau meeting', provenance: 'SOURCE_VERIFIED' },
  { id: '12', src: '/gallery/extra-6.jpeg', alt: 'نقاشات تفاعلية للمشاركين بالأكاديمية', altEn: 'Interactive discussions among academy participants', provenance: 'SOURCE_VERIFIED' },
  { id: '13', src: '/gallery/extra-7.jpeg', alt: 'تكريم ومشاركات ميدانية للمنتسبين', altEn: 'Recognition and field activities of members', provenance: 'SOURCE_VERIFIED' },
  { id: '14', src: '/gallery/extra-8.jpeg', alt: 'جانب من أعمال المؤتمر الحزبي', altEn: 'Party convention proceedings', provenance: 'SOURCE_VERIFIED' },
  { id: '15', src: '/gallery/extra-9.jpeg', alt: 'ورشة عمل حول قانون الأحزاب والانتخاب', altEn: 'Workshop on political parties and election law', provenance: 'SOURCE_VERIFIED' },
  { id: '16', src: '/gallery/extra-10.jpeg', alt: 'لقاء تنسيقي لفروع المحافظات', altEn: 'Coordination meeting for governorate branches', provenance: 'SOURCE_VERIFIED' },
];
