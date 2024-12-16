# ^ Dockerfile для backend (Nest.js)

# использ.легковесный образ Node.js
FROM node:18-alpine AS builder

# устан.раб.п.backend
WORKDIR /backend

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

# устан.раб.п.backend
WORKDIR /backend

# копир.необходимые зависимости из предыдущ.Образа
COPY --from=builder /backend/dist ./dist
COPY --from=builder /backend/tsconfig.json ./tsconfig.json
COPY package*.json ./

# устан.зависимости PROD по package-lock.json
RUN npm ci --only=production

# устан.перем.окруж. PROD
ENV NODE_ENV=production

# указ.порт приложением
EXPOSE 5791 

# запуск приложения
CMD ["npm", "run", "start:docker"]
