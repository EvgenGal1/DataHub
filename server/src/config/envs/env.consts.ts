// ^ константы > команды запуска process.env.NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTotal = process.env.NODE_ENV === 'total';

export { isProduction, isDevelopment, isTotal };
