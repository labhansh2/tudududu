import Header from "@/components/Header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>{children}</main>
    </div>
  );
}
