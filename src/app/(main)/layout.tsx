import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>Header</div>
      <Link href="/activity">Activity</Link>
      <Link href="/deadline">Change Deadline</Link>
      {children}
    </div>
  );
}