import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SignIn afterSignInUrl="/" signUpUrl="/sign-up" />
    </div>
  );
}
