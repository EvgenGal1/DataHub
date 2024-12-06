# использ.легковесный образ Node.js
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /frontend

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# устан.зависимости PROD по package-lock.json
RUN npm ci

# Копируем все файлы проекта в контейнер
COPY . .

# сбор прилож. PROD
RUN npm run build

# запуск приложения
FROM node:18-alpine AS runner

# устан.раб.п.
WORKDIR /frontend

# копир.опред.зависимости из предыдущ.Образа
COPY --from=builder /frontend/.next ./.next
COPY --from=builder /frontend/public ./public
COPY --from=builder /frontend/package.json ./package.json

# устан.зависимости PROD
RUN npm install --only=production

# копир.ф.окруж. PROD
COPY .env.production .env

# устан.перем.окруж. PROD
ENV NODE_ENV=production

# указ.порт приложением
EXPOSE 3000

# запуск приложение
CMD ["npm", "start"]