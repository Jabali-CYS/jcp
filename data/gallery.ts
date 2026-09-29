export type Provenance = "SOURCE_VERIFIED" | "USER_SPECIFIED" | "PLACEHOLDER";

export type GalleryAsset = {
  id: string;
  src: string;
  alt: string;
  altEn?: string;
  provenance: Provenance;
};

export const galleryData: GalleryAsset[] = [
  { id: '1', src: '/gallery/gallery-1.jpg', alt: 'توثيق بصري لفعاليات الأكاديمية', altEn: 'Visual documentation of Academy events', provenance: 'SOURCE_VERIFIED' },
  { id: '2', src: '/gallery/gallery-2.jpg', alt: 'صورة من برامج الأكاديمية', altEn: 'A photo from Academy programs', provenance: 'SOURCE_VERIFIED' },
  { id: '3', src: '/gallery/gallery-3.jpg', alt: 'جانب من حضور الأنشطة الحزبية', altEn: 'Attendees at party activities', provenance: 'SOURCE_VERIFIED' },
  { id: '4', src: '/gallery/gallery-4.jpg', alt: 'جانب من الفعاليات التدريبية', altEn: 'Training events snapshot', provenance: 'SOURCE_VERIFIED' },
  { id: '5', src: '/gallery/gallery-5.jpg', alt: 'صورة جماعية من اللقاءات', altEn: 'Group photo from meetings', provenance: 'SOURCE_VERIFIED' },
  { id: '6', src: '/gallery/gallery-6.jpg', alt: 'صورة توثيقية لأنشطة الحزب', altEn: 'Documentation of party activities', provenance: 'SOURCE_VERIFIED' },
];
