import {SanityImage} from '@/components/sanity-image';
import type {GalleryImage} from '@/components/portfolio/gallery';
import type {SanityImageValue} from '@/sanity/image';
import {photoAlt} from '@/lib/alt';
import type {Lang} from '@/lib/i18n/routing';

// Pieces shared by the service sections and the catalogue section.

export const numberLocale = (lang: Lang) => (lang === 'ro' ? 'ro-RO' : 'en-GB');

/** Gallery images with generated alt text ("Uși din stejar – fotografia 3 din 12"). */
export function describedImages(images: GalleryImage[] | null | undefined, subject: string, template: string) {
  return (images ?? []).map((image, index, all) => ({
    ...image,
    alt: photoAlt(image, subject, {index, total: all.length, template}),
  }));
}

export function DialogCard({image, title, subtitle, ratio = 4 / 3, contain = false}: {
  image: SanityImageValue | null | undefined;
  title: string;
  subtitle?: string | null;
  ratio?: number;
  contain?: boolean;
}) {
  return (
    <>
      <span className={`relative block overflow-hidden rounded-lg ${contain ? 'bg-white' : 'bg-stone'}`} style={{aspectRatio: ratio}}>
        <SanityImage
          image={image && {...image, alt: photoAlt(image, title)}}
          ratio={contain ? undefined : ratio}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </span>
      <span className="mt-3 block font-display text-xl font-semibold leading-tight text-teal-900 group-hover:text-teal-700">{title}</span>
      {subtitle && <span className="mt-1 block text-sm text-ink-soft">{subtitle}</span>}
    </>
  );
}
