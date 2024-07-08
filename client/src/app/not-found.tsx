export default function NotFound() {
  // локал.инлайн css
  const styles = {
    notf: {
      width: "50%",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
    },
    notfTitle: {
      fontSize: "20px",
      fontWeight: "bold",
    },
    // notfMessage: {},
    // notfContext: { textAlign: "center" as const },
    // notfControl: {},
    // notfControlLink: { fontWeight: "bold" },
  };

  return (
    <>
      {/* локал.use-clt стили CSS-in-JS в NextJS на `style jsx` */}
      {/* <style jsx>{`
        .main-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .notf__title {
          display: inline-block;
          margin: 0 20px 0 0;
          padding: 0 23px 0 0;
        }
        .notf__message {
          display: inline-block;
        }
        @media (prefers-color-scheme: dark) {
          .notf__title {
            border-right: 1px solid rgba(255, 255, 255, 0.3);
          }
        }
      `}</style> */}
      <div className="main-screen dfrcc notf" style={styles.notf}>
        {/* авто переадрес на Главную ч/з 30 сек. */}
        <head>
          <meta http-equiv="refresh" content="9930;url=/" />
        </head>
        <div className="notf__title dfrcc" style={styles.notfTitle}>
          <h1 className="mr-5 pr-5">404</h1>
          <div>Страница не найдена</div>
        </div>
        <div
          className="notf__context w-100 df df-dc mt-3"
          // style={styles.notfContext}
        >
          <p
            className="notf__message"
            // style={styles.notfMessage}
          >
            Проверьте URL, используйте окно поиска или ссылки ниже
          </p>
          <input
            type="search"
            placeholder="Поле поиска..."
            className="inp mt-1"
          />
        </div>
        <div
          className="notf__control w-100 df df-aic df-jcsb mt-5"
          // style={styles.notfControl}
        >
          <div>
            <span></span>
            <a href="javascript:history.back()" className="danger">
              <span>Вернуться </span>Назад
            </a>
          </div>
          <div>
            <span></span>
            <a href="/" className="success">
              Главная <span>страница</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
