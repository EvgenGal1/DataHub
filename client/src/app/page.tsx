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
      {/* локал.use-clt стили CSS-in-JS в NextJS на `style jsx` */}
      {/* <style jsx>
        {`
          .main-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `}
      </style> */}
      {/* <div className="hr"></div> */}
      {/* .main-scree>h1{Три Вопроса}+section.section*3>.content>div{вопрос $}+.req{ ?}+.res{Ответь}>span{ {'>'} : }+inp[id="res_$"] */}
      <div className="main-screen dfccc">
        <h1>Система бартера</h1>
        <form
          action="/submit_barter"
          method="post"
          className="barter barter-form df df-col"
        >
          <div>
            <label htmlFor="offer">
              Что <span> ВЫ </span> Умеете ? :
            </label>
            <input type="text" id="offer" name="offer" required />
            <select id="skills" name="skills">
              <option value="skills_1">Вариант 1</option>
              <option value="skills_2">Вариант 2</option>
              <option value="skills_3">Вариант 3</option>
              <option value="skills_4">Вариант 4</option>
            </select>
            <a href="/barter_catalog/">Научим</a>
          </div>
          <div>
            <label htmlFor="request">
              Что <span>ВЫ</span> Ищeте ? :
            </label>
            <input type="text" id="request" name="request" required />
            {/* <button>ДА</button>
            <button>НЕТ</button> */}
            <select id="skills" name="skills">
              <option value="skills_1">Вариант 1</option>
              <option value="skills_2">Вариант 2</option>
              <option value="skills_3">Вариант 3</option>
              <option value="skills_4">Вариант 4</option>
            </select>
            <a href="/barter_catalog/">Поможем</a>
          </div>

          <button type="submit">{/* Предложить обмен */}БАРТЕР</button>
        </form>
      </div>
      {/* <div className="hr"></div> */}
      <div className="main-screen dfccc">
        <h1>Три Вопроса</h1>
        <section className="section">
          <div className="content">
            <div>вопрос 1</div>
            <div className="req">
              Что <span>ТЫ</span> Умеешь ?
            </div>
            <div className="res">
              Ответь<span> {">"} : </span>
              <input type="text" name="" id="res_1" />
              <select id="skills" name="skills">
                <option value="skills_1">Вариант 1</option>
                <option value="skills_2">Вариант 2</option>
                <option value="skills_3">Вариант 3</option>
                <option value="skills_4">Вариант 4</option>
              </select>
              <a href="/barter_catalog/">Научим</a>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="content">
            <div>вопрос 2</div>
            <div className="req">
              Это <span>НАМ</span> Нужно ?
            </div>
            <div className="res">
              Ответь<span> {">"} : </span>
              <input type="text" name="" id="res_2" />
              <button>ДА</button>
              <button>НЕТ</button>
              <a href="/barter_catalog/">Узнать</a>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="content">
            <div>вопрос 3</div>
            <div className="req">
              Готов <span>БАРТЕР</span> ? Здесь !
            </div>
            <div className="res">
              Ответь<span> {">"} : </span>
              <input type="text" name="" id="res_3" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
