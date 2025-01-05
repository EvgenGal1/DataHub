module.exports = {
  preset: 'ts-jest', // поддержка TS
  testEnvironment: 'node', // среда выполнения
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // преобразов.ф.с расшир. .ts/tsx
  },
  // игнор.пути
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // конфиг
    },
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$', //  регул.выраж. > нахождения тестов
  moduleFileExtensions: ['ts', 'js', 'json', 'node'], // поддержка расширений
};
