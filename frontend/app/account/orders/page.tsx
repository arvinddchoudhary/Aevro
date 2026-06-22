import { AccountOrdersPageContent } from '../../../components/orders/AccountOrdersPageContent';

export default function AccountOrdersPage() {
  return (
    <main className="aevro-container min-h-screen py-14">
      <div className="mb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Account
        </p>
        <h1 className="text-4xl font-light md:text-5xl">Orders</h1>
      </div>
      <AccountOrdersPageContent />
    </main>
  );
}
