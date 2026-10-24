import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-[#f6f4ee] px-6 py-20 text-center text-[#173b38]">
      <p className="text-sm uppercase tracking-widest">Premium Bells</p>
      <h1 className="font-serif text-4xl">Portofoliul prinde contur.</h1>
      <p>Descoperiți lucrările publicate în noul portofoliu.</p>
      <Link className="prototype-button" href="/prototip/portofoliu">Deschide portofoliul</Link>
    </main>
  );
}
