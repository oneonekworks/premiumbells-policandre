import {revalidateTag} from 'next/cache';
import {handleRevalidate} from '@/sanity/revalidate';

// Sanity publish webhook (POST, signed with SANITY_REVALIDATE_SECRET). Tags
// expire at once so the first visit after a publish renders fresh content.
export function POST(request: Request) {
  return handleRevalidate(request, {
    secret: process.env.SANITY_REVALIDATE_SECRET,
    revalidate: (tag) => revalidateTag(tag, {expire: 0}),
  });
}
