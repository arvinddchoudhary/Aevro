import { AccountOrderDetailsPageContent } from '../../../../components/orders/AccountOrderDetailsPageContent';

export default async function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <AccountOrderDetailsPageContent id={id} />
    </main>
  );
}
