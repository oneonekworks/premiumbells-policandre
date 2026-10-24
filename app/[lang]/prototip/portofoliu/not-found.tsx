import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-12">
      <h1 className="mb-6 font-display font-semibold text-teal-900 text-3xl">
        Lucrarea sau pagina nu este disponibilă.
      </h1>
      <Link className="btn btn-secondary" href="/prototip/portofoliu">
        Înapoi la portofoliu
      </Link>
    </div>
  );
}
