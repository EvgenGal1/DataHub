# ^ Dockerfile для frontend (Next.js)

# использ.легковесный образ Node.js
FROM node:18-alpine AS builder

# устан.раб.п.frontend
WORKDIR /frontend

# копир.все package*.json > устан.зависимостей
COPY package*.json ./

# устан.зависимости по package-lock.json
RUN npm ci

# копир.все ф.проекта в Контейнер
COPY . .

# сбор прилож. PROD
RUN npm run build

# запуск приложения
FROM node:18-alpine AS runner

# устан.раб.п.frontend
WORKDIR /frontend

# копир.необходимые зависимости из предыдущ.Образа
COPY --from=builder /frontend/.next ./.next
COPY --from=builder /frontend/public ./public
COPY package*.json ./

# устан.зависимости PROD по package-lock.json
RUN npm ci --only=production

# устан.перем.окруж. PROD
ENV NODE_ENV=production

# указ.порт приложением
EXPOSE 3000

# запуск приложения
CMD ["npm", "run", "start"]