import {notFound} from 'next/navigation';

// Unmatched paths render app/[lang]/not-found.tsx inside the site shell.
export default function CatchAll() {
  notFound();
}
