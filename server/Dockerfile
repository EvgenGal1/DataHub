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
COPY --from=builder /backend/public/favicon.ico ./public/favicon.ico
COPY --from=builder /backend/public/swagger/theme.css ./public/swagger/theme.css
COPY package*.json ./

# устан.зависимости PROD по package-lock.json
RUN npm ci --only=production

# устан. NestJS CLI для доступа к кмд. nest
RUN npm install -g @nestjs/cli

# устан.перем.окруж. PROD
ENV NODE_ENV=production

# указ.порт приложением
EXPOSE 5000 

# запуск приложения
CMD ["npm", "run", "start:docker"]
