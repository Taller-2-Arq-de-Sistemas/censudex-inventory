
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .


FROM node:20-alpine AS runtime
WORKDIR /src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/src ./src
COPY --from=build /app/protos ./protos

EXPOSE 5005
CMD ["node", "src/app.js"]