-- ^ созд./наполн. данн.табл.
-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "fullName" VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "activatedLink" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMP,
  "coverArtId" INTEGER
);

-- Заполнение таблицы users
INSERT INTO
  users (
    id,
    "fullName",
    email,
    password,
    "activatedLink",
    "createdAt",
    "deletedAt",
    "coverArtId"
  )
VALUES
  (
    1,
    'Польз 1',
    'eml1@eml.em',
    'psw123',
    'нет',
    '2023-12-03 01:03:55.684269',
    NULL,
    NULL
  ),
  (
    2,
    'Польз 2',
    'eml2@eml.em',
    'psw234',
    NULL,
    '2024-05-12 01:03:55.684269',
    NULL,
    NULL
  ),
  (
    3,
    'Тест Тестович',
    'Test@Test_0.ru',
    '123_Test_0',
    '0',
    '2024-06-26 01:03:55.684269',
    NULL,
    NULL
  );

-- Создание таблицы roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  value VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMP
);

-- Заполнение таблицы roles
INSERT INTO
  roles (id, value, description, "createdAt", "deletedAt")
VALUES
  (
    1,
    'USER',
    'Пользователь',
    '2024-03-26 01:29:55.684269',
    NULL
  ),
  (
    2,
    'ADMIN',
    'Аминистратор',
    '2024-03-26 01:29:55.684269',
    NULL
  ),
  (
    3,
    'MODER',
    'Модернизатор',
    '2024-03-26 01:29:55.684269',
    NULL
  ),
  (
    4,
    'MELOMAN',
    'Любитель музыки',
    '2024-03-26 01:29:55.684269',
    NULL
  ),
  (
    5,
    'VISUAL',
    'Любитель картин',
    '2024-03-26 01:28:55.684269',
    NULL
  );

-- Создание таблицы user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  "userId" INTEGER REFERENCES users(id),
  "roleId" INTEGER REFERENCES roles(id),
  id SERIAL PRIMARY KEY,
  level INTEGER
);

-- Заполнение таблицы user_roles
INSERT INTO
  user_roles ("userId", "roleId", id, level)
VALUES
  (1, 1, 1, 1),
  (2, 1, 2, 1),
  (3, 1, 3, 1),
  (3, 4, 4, 4),
  (3, 2, 5, 3);

-- Создание таблицы files
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  "fileName" VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  path VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(50) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMP,
  "userId" INTEGER REFERENCES users(id)
);

-- Заполнение таблицы files
INSERT INTO
  files (
    id,
    "fileName",
    size,
    path,
    "mimeType",
    "createdAt",
    "deletedAt",
    "userId"
  )
VALUES
  (
    1,
    'трк.1.mp3',
    8494150,
    'audios/track/трк.1.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    1
  ),
  (
    2,
    'ноль АЛЬБ.jpeg',
    136606,
    'images/album/ноль АЛЬБ.jpeg',
    'image/png',
    '2024-02-29 02:12:00.899587',
    NULL,
    1
  ),
  (
    3,
    'трк.2.mp3',
    11975492,
    'audios/track/трк.2.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    2
  ),
  (
    4,
    'трк.3.mp3',
    11975492,
    'audios/track/трк.3.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    3
  ),
  (
    5,
    'Первейший.jpg',
    135505,
    'images/album/Первейший.jpg',
    'image/jpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    3
  ),
  (
    6,
    'трк.4.mp3',
    11975492,
    'audios/track/трк.4.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    3
  ),
  (
    7,
    'Вторейший.jpg',
    137707,
    'images/album/Вторейший.jpg',
    'image/jpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    3
  ),
  (
    8,
    'проба.jpeg',
    1475713,
    'images/проба.jpeg',
    'image/jpeg',
    '2023-12-04 18:57:00.684269',
    NULL,
    3
  ),
  (
    9,
    'трк.6.mp3',
    1197549,
    'audios/track/трк.6.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    3
  ),
  (
    10,
    'трк.5.mp3',
    1197542,
    'audios/track/трк.5.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    3
  ),
  (
    11,
    'трк.8.mp3',
    1197592,
    'audios/track/трк.8.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    2
  ),
  (
    12,
    'трк.7.mp3',
    526843,
    'audios/track/трк.7.mp3',
    'audio/mpeg',
    '2024-02-27 02:36:12.123765',
    NULL,
    3
  ),
  (
    13,
    'ТЕСТ трк.13.mp3',
    8494150,
    'audios/track/ТЕСТ трк.13.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    1
  ),
  (
    14,
    'ТЕСТ АЛЬБ.jpeg',
    136606,
    'images/album/ТЕСТ АЛЬБ.jpeg',
    'image/png',
    '2024-02-29 02:12:00.899587',
    NULL,
    1
  ),
  (
    15,
    'ТЕСТ трк.15.mp3',
    8494150,
    'audios/track/ТЕСТ трк.13.mp3',
    'audio/mpeg',
    '2024-02-29 02:12:00.899587',
    NULL,
    1
  );

-- Создание таблицы tracks
CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  author VARCHAR(255),
  genre VARCHAR(255),
  lyrics TEXT,
  listens INT DEFAULT 0,
  duration INT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMP,
  userId INT,
  fileId INT,
  coverArtId INT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY (coverArtId) REFERENCES files(id) ON DELETE
  SET
    NULL
);

-- Заполнение таблицы tracks
INSERT INTO
  tracks (
    id,
    title,
    author,
    genre,
    lyrics,
    listens,
    duration,
    "createdAt",
    "deletedAt",
    userId,
    fileId,
    coverArtId
  )
VALUES
  (
    1,
    'трк.1',
    'Артист 1',
    'РЭП',
    '-',
    1,
    193,
    '2023-12-26 01:03:26',
    NULL,
    1,
    1,
    2
  ),
  (
    2,
    'трк.2',
    'Артист 2',
    'Rock',
    NULL,
    1,
    208,
    '2023-11-06 01:03:26',
    NULL,
    2,
    3,
    8
  ),
  (
    3,
    'трк.3',
    'Артист 3',
    'Electronica/Dance',
    ' ',
    1,
    345,
    '2023-12-20 01:03:26',
    NULL,
    3,
    4,
    5
  ),
  (
    4,
    'трк.4',
    'Артист 2',
    'Rock',
    '0',
    2,
    301,
    '2023-11-03 01:03:27',
    NULL,
    3,
    6,
    7
  ),
  (
    5,
    'трк.5',
    'Артист 3',
    'Electronica',
    ' ',
    3,
    345,
    '2023-12-20 01:03:26',
    NULL,
    3,
    10,
    5
  ),
  (
    6,
    'трк.6',
    'Артист 2',
    'Rock',
    NULL,
    4,
    208,
    '2023-11-06 01:03:26',
    NULL,
    3,
    9,
    7
  ),
  (
    7,
    'трк.7',
    'Артист 3',
    'Dance',
    ' ',
    5,
    345,
    '2023-12-20 01:03:26',
    NULL,
    3,
    12,
    5
  ),
  (
    8,
    'трк.8',
    'Артист 2 +',
    'Rock',
    '0',
    3,
    301,
    '2023-11-03 01:03:27',
    NULL,
    2,
    11,
    7
  );

-- Создание таблицы albums
CREATE TABLE IF NOT EXISTS albums (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  author VARCHAR(255),
  genres VARCHAR(255),
  year INT,
  description TEXT,
  total_tracks INT DEFAULT 1,
  total_duration INTERVAL DEFAULT '00:00:00',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMP,
  userId INT,
  coverArtId INT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY (coverArtId) REFERENCES files(id) ON DELETE
  SET
    NULL
);

-- Заполнение таблицы albums
INSERT INTO
  albums (
    id,
    title,
    author,
    genres,
    year,
    description,
    total_tracks,
    total_duration,
    "createdAt",
    "deletedAt",
    userId,
    coverArtId
  )
VALUES
  (
    1,
    'ноль АЛЬБ',
    'Нульсон (Артист 1)',
    'Other',
    1999,
    'qwerty',
    1,
    '00:03:13',
    '2024-03-02 01:03:26',
    NULL,
    1,
    2
  ),
  (
    2,
    'Первейший',
    'Первак (Артист 3)',
    'Electronica/Dance',
    2000,
    NULL,
    3,
    '00:17:15',
    '2023-12-27 01:03:26',
    NULL,
    3,
    5
  ),
  (
    3,
    'поВторитель',
    'Втор (Артист 2)',
    'Rock',
    2002,
    NULL,
    2,
    '00:08:29',
    '2024-02-07 01:03:27',
    NULL,
    2,
    7
  ),
  (
    4,
    'поВторитель UPD',
    'Втор (Артист 2 ++)',
    'Rock',
    2004,
    NULL,
    4,
    '00:16:58',
    '2024-02-07 01:03:27',
    NULL,
    3,
    7
  );

-- Создание таблицы album_track (связующая таблица между album и track)
CREATE TABLE IF NOT EXISTS album_track (
  albumId INT,
  trackId INT,
  PRIMARY KEY (albumId, trackId),
  FOREIGN KEY (albumId) REFERENCES albums(id) ON DELETE CASCADE,
  FOREIGN KEY (trackId) REFERENCES tracks(id) ON DELETE CASCADE
);

-- Заполнение таблицы album_track
INSERT INTO
  album_track (albumId, trackId)
VALUES
  (1, 1),
  (2, 3),
  (2, 7),
  (3, 2),
  (3, 4),
  (4, 2),
  (4, 4),
  (2, 5),
  (4, 6),
  (4, 8);

-- Создание таблицы reactions
CREATE TABLE IF NOT EXISTS reactions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  author VARCHAR(255),
  genre VARCHAR(255),
  lyrics TEXT,
  listens INT DEFAULT 0,
  duration INT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMP,
  userId INT,
  fileId INT,
  coverArtId INT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE
  SET
    NULL,
    FOREIGN KEY (coverArtId) REFERENCES files(id) ON DELETE
  SET
    NULL
);

-- Заполнение таблицы reactions
INSERT INTO
  reactions (
    id,
    title,
    author,
    genre,
    lyrics,
    listens,
    duration,
    "createdAt",
    "deletedAt",
    userId,
    fileId,
    coverArtId
  )
VALUES
  (
    1,
    'реакция 1',
    'Пользователь 1',
    'РЭП',
    '-',
    1,
    193,
    '2023-12-26 01:03:26',
    NULL,
    1,
    1,
    2
  ),
  (
    2,
    'реакция 2',
    'Пользователь 2',
    'Rock',
    NULL,
    1,
    208,
    '2023-11-06 01:03:26',
    NULL,
    2,
    3,
    8
  ),
  (
    3,
    'реакция 3',
    'Пользователь 3',
    'Electronica/Dance',
    ' ',
    1,
    345,
    '2023-12-20 01:03:26',
    NULL,
    3,
    4,
    5
  ),
  (
    4,
    'реакция 4',
    'Пользователь 1',
    'Rock',
    '0',
    2,
    301,
    '2023-11-03 01:03:27',
    NULL,
    3,
    6,
    7
  ),
  (
    5,
    'реакция 5',
    'Пользователь 2',
    'Dance',
    ' ',
    5,
    345,
    '2023-12-20 01:03:26',
    NULL,
    3,
    12,
    5
  ),
  (
    6,
    'реакция 6',
    'Пользователь 3',
    'Electronica',
    ' ',
    3,
    345,
    '2023-12-20 01:03:26',
    NULL,
    3,
    10,
    5
  ),
  (
    7,
    'реакция 7',
    'Пользователь 2',
    'Rock',
    '0',
    3,
    301,
    '2023-11-03 01:03:27',
    NULL,
    2,
    11,
    7
  ),
  (
    8,
    'реакция 8',
    'Пользователь 1',
    'Rock',
    NULL,
    4,
    208,
    '2023-11-06 01:03:26',
    NULL,
    3,
    9,
    7
  ),
  (
    9,
    'ТЕСТ реакция 1',
    'Пользователь 1',
    'Other',
    '-',
    1,
    135,
    '2023-12-26 01:03:26',
    NULL,
    1,
    13,
    14
  ),
  (
    10,
    'ТЕСТ реакция 2',
    'Пользователь 2',
    'Other',
    '-',
    3,
    135,
    '2023-12-26 01:03:26',
    NULL,
    1,
    15,
    14
  );