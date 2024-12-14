// ^ константы > команды запуска process.env.NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isDocker =
  process.env.NODE_ENV === 'production' &&
  process.env.NODE_ENV_DOCK === 'docker';

export { isProduction, isDevelopment, isDocker };
