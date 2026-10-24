import type {Metadata} from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {default: 'Portofoliu | Premium Bells', template: '%s | Premium Bells'},
  robots: {index: false, follow: false},
};

export default function PortfolioLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen bg-[#f6f4ee] text-[#173b38]">
      <a className="sr-only focus:not-sr-only" href="#continut">Sari la conținut</a>
      <header className="border-b border-[#173b38]/15 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link className="text-xl font-semibold tracking-wide" href="/prototip/portofoliu">Premium Bells</Link>
          <span className="text-sm">Prototip de portofoliu</span>
        </div>
      </header>
      <main id="continut" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16">{children}</main>
    </div>
  );
}
