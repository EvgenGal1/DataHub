// стр.Профиля

import { getServerSession } from "next-auth/next";
import Image from "next/image";

import { authConfig } from "@/configs/auth/auth";

// async srv.Комп.
export default async function Profile() {
  // получ.данн.сессии
  const session = await getServerSession(authConfig);

  return (
    <div>
      {/* отрис.name и по услов.image */}
      <h1>Profile of {session?.user?.name}</h1>
      {session?.user?.image && (
        <Image
          src={session.user.image}
          alt=""
          width={100}
          height={100}
          // objectFit="contain"
          // layout="intrinsic"
          priority
          style={{ maxWidth: "100%", width: "auto", height: "auto" }}
        />
      )}
    </div>
  );
}
