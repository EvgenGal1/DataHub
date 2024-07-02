"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Что-то пошло не так!</h2>
      <div>
        <pre>{error.message}</pre>
      </div>
      <button onClick={() => reset()}>Попробуйте еще раз</button>
    </div>
  );
}
