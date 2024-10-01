// кнп.Входа

"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const GoogleButton = () => {
  // получ.данн.URL
  const searchParams = useSearchParams();
  // получ. адр.строку или будет /profile
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";

  return (
    // при клик вызов fn signIn с указ.провайдер (здесь google (их МНОГО)), как - здесь ч/з callbackUrl(получ.ч/з адр.строку)
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className="btn btn-primary"
    >
      Sign in with Google
    </button>
  );
};

export { GoogleButton };
