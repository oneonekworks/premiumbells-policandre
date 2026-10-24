'use client';

export default function ErrorPage({reset}: {reset: () => void}) {
  return (
    <div role="alert" className="py-12">
      <h1 className="mb-4 font-display font-semibold text-teal-900 text-3xl">Portofoliul nu poate fi încărcat momentan.</h1>
      <p className="mb-6">Verificați conexiunea și încercați din nou.</p>
      <button className="btn btn-secondary" onClick={reset}>Încearcă din nou</button>
    </div>
  );
}
