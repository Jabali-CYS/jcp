import { redirect } from 'next/navigation';

export default function GalleryPage() {
  redirect('/news-gallery?tab=gallery');
}
