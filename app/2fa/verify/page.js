import ClientVerify from './ClientVerify';

// This page uses client-side hooks inside the child ClientVerify component.
// Force dynamic rendering to avoid prerender issues.
export const dynamic = 'force-dynamic';

export default function VerifyPage({ searchParams }) {
  const email = searchParams?.email || '';
  return <ClientVerify email={email} />;
}
