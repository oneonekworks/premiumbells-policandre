import type {Metadata} from 'next';
import {notFound} from 'next/navigation';

export const metadata: Metadata = {
  title: {default: 'Portofoliu', template: '%s | Premium Bells'},
  robots: {index: false, follow: false},
};

// The publishing prototype is Romanian-only; there is no /en equivalent.
export default async function PortfolioLayout({children, params}: LayoutProps<'/[lang]/prototip/portofoliu'>) {
  if ((await params).lang !== 'ro') notFound();
  return <div className="container-site py-10 sm:py-16">{children}</div>;
}
