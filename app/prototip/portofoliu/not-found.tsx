import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-12">
      <h1 className="mb-6 font-serif text-3xl">
        Lucrarea sau pagina nu este disponibilă.
      </h1>
      <Link className="prototype-button" href="/prototip/portofoliu">
        Înapoi la portofoliu
      </Link>
    </div>
  );
}
