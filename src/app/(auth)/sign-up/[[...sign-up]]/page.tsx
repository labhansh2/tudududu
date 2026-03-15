import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div
      className="bg-(--bg-darkest)"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}
