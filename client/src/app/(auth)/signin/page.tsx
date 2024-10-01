// стр.кастомный вход

import { GoogleButton } from "@/components/auth/GoogleButton";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function Signin() {
  return (
    <div className="stack">
      <h1 className="mb-3">SignIn</h1>
      {/* кнп.Входа */}
      <GoogleButton />
      <div>or</div>
      {/* форма Входа */}
      <SignInForm />
    </div>
  );
}
