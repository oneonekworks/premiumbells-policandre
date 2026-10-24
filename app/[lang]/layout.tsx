import type {Metadata} from 'next';
import {Cormorant_Garamond, Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import {SiteFooter} from '@/components/site/footer';
import {SiteHeader} from '@/components/site/header';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {isLang, languages} from '@/lib/i18n/routing';
import '../globals.css';

// Both fonts include latin-ext for Romanian ș/ț and cyrillic for a possible
// future language.
const inter = Inter({subsets: ['latin', 'latin-ext'], variable: '--font-inter'});
const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: {default: 'Premium Bells', template: '%s | Premium Bells'},
  description: 'Policandre, clopote și iconostase pentru biserici ortodoxe.',
  // The whole site stays noindex until launch.
  robots: {index: false, follow: false},
};

export function generateStaticParams() {
  return languages.map((lang) => ({lang}));
}

export default async function RootLayout({children, params}: LayoutProps<'/[lang]'>) {
  const {lang} = await params;
  if (!isLang(lang)) notFound();
  const dictionary = getDictionary(lang);

  return (
    <html lang={lang} className={`${inter.variable} ${cormorant.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#continut"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-paper focus:px-4 focus:py-2"
        >
          {dictionary.skipToContent}
        </a>
        <SiteHeader lang={lang} dictionary={dictionary} />
        <main id="continut" className="flex-1">{children}</main>
        <SiteFooter lang={lang} dictionary={dictionary} />
      </body>
    </html>
  );
}
