import { AccountOrderDetailsPageContent } from '../../../../components/orders/AccountOrderDetailsPageContent';

export default async function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="aevro-container min-h-screen py-14">
      <AccountOrderDetailsPageContent id={id} />
    </main>
  );
}
