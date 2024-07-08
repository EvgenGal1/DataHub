export default function NotFound() {
  const styles = {
    err: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
    },
    errTitle: {
      fontSize: "20px",
      fontWeight: "bold",
    },
    h1: {
      margin: "0 25px 0 0",
      padding: "0 25px 0 0",
      borderRight: "1px solid rgba(0, 0, 0, 0.3)",
    },
    errMessage: {},
    errContext: {
      padding: "0",
    },
    errControl: { width: "50%" },
    errControlLink: {
      padding: "5px 10px",
      borderRadius: "10px",
      textDecoration: "underline",
      fontWeight: "bold",
    },
  };

  return (
    <>
      <div className="main-screen dfrcc err" style={styles.err}>
        {/* авто переадрес на Главную ч/з 30 сек. */}
        <head>
          <meta http-equiv="refresh" content="30;url=/" />
        </head>
        <div className="err__title dfrcc" style={styles.errTitle}>
          <h1 style={styles.h1}>404</h1>
          <div>Страница не найдена</div>
        </div>
        <div className="err__context df df-dc mt-3" style={styles.errContext}>
          <p className="err__message error__message--important">
            Проверьте URL, используйте окно поиска или ссылки ниже
          </p>
          <input
            type="search"
            placeholder="Поле поиска..."
            className="inp mt-1"
          />
        </div>
        <div
          className="err__control df df-aic df-jcse mt-5"
          style={styles.errControl}
        >
          <a
            href="javascript:history.back()"
            className="danger mr-3"
            style={styles.errControlLink}
          >
            Вернуться Назад
          </a>
          <a href="/" className="success ml-3" style={styles.errControlLink}>
            Перейти на Главную
          </a>
        </div>
      </div>
    </>
  );
}
