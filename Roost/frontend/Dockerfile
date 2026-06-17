FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG API_URL=http://localhost:4002
RUN echo "export const environment = { apiUrl: '${API_URL}' };" > src/environments/environment.ts
RUN npm run build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/roost-frontend/browser /usr/share/nginx/html
EXPOSE 80
