import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import TimeZoneSetter from "@/components/TimeZoneSetter";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TimeZoneSetter />
      <Header userId={userId} />
      <main>{children}</main>
    </div>
  );
}
