import React from "react";

export default function Home() {
  return (
    <>
      <div className="main-screen dfccc">
        <h1>
          Добро пожаловать в <b>Центр Данных</b>!
        </h1>
        <h3>
          Хранилище Ваших файлов, аудио, видео, изображений, текстов,
          документов, схем
        </h3>
      </div>
      {/* локал.стили CSS-in-JS в NextJS на `style jsx` */}
      {/* <style jsx>
        {`
          .main-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `}
      </style> */}
    </>
  );
}
