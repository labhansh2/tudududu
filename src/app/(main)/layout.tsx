import Header from "@/components/Header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-[var(--bg-darkest)] flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
