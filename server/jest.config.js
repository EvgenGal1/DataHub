export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const transform = {
  '^.+\\.tsx?$': 'ts-jest', // преобразов.ф.с расшир. .ts/tsx
};
export const testPathIgnorePatterns = ['/node_modules/', '/dist/'];
export const globals = {
  'ts-jest': {
    tsconfig: 'tsconfig.json', // конфиг
  },
};
export const testRegex = '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$';
export const moduleFileExtensions = ['ts', 'js', 'json', 'node'];
