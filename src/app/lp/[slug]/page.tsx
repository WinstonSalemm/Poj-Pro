import { redirect } from 'next/navigation';

export const dynamic = 'force-static';

export default function DeprecatedLPPage() {
  // Permanently redirect all LP pages to the catalog landing
  redirect('/catalog');
}
