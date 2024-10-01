// форма Входа

"use client";

import { useState, type FormEventHandler } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const SignInForm = () => {
  // нов.хук навигации NextJS
  const router = useRouter();
  // сост.входа/ошб.
  const [err, setErr] = useState<string>("");

  // async обраб.кнп.с типами формы
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    // объ.формы ч/з конструктор с данн.формы
    const formData = new FormData(event.currentTarget);

    // в перем.вызов signIn с провайдер `Реквизиты для входа`, данн.формы и без перенаправления при ошб.на стандарт.форму
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    // логика Вход(редирект в profile) / ошб.(логи)
    if (res && !res.error) router.push("/profile");
    else {
      setErr(res?.error || "Неизвестная ошибка");
      console.log(res); // отраж на CLT
    }
  };

  // обраб.сброса ошибки
  const handleChange = () => {
    setErr("");
  };

  return (
    <>
      {/* форма с обязат.полями + кнп. */}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
        />
        <button type="submit" className="btn btn-primary">
          Sign In
        </button>
        {err && <p style={{ color: "red" }}>Ошибка: {err}</p>}
      </form>
    </>
  );
};

export { SignInForm };
