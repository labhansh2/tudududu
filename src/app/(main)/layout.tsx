import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>Header</div>
      <Link href="/stats">Stats</Link> 
      {children}
    </div>
  );
}