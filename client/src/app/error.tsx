"use client";

import { useEffect /* , useState */ } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // счётчик, fn увелич. // ! не раб. - после reset cyfxfkf/
  // const [countErr, setCountErr] = useState(0);
  // const handleClick = () => {
  //   setCountErr(countErr + 1);
  // };

  useEffect(() => {
    // setCountErr((prevCount) => prevCount + 1);
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Что-то пошло не так!</h2>
      <div>
        <pre>{error.message}</pre>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          margin: "10px 0 0",
        }}
      >
        <button
          className="btn btn-danger"
          style={{ margin: "0 10px 0 0" }}
          onClick={() => {
            // // setCountErr((prevCount) => prevCount + 1);
            // handleClick();
            // setTimeout(() => {
            reset();
            // }, 1000);
          }}
        >
          Попробуйте еще раз
        </button>
        {/* <span>Кол-во попыток : {countErr}</span> */}
      </div>
    </div>
  );
}
