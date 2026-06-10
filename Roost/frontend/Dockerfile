# Multi-stage: build the Angular app, serve the static output with nginx.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Backend URL is baked at BUILD time: overwrite the environment file from the build ARG.
# A runtime env var on the nginx container would NOT reach the browser.
ARG API_URL=http://localhost:4002
RUN echo "export const environment = { apiUrl: '${API_URL}' };" > src/environments/environment.ts
RUN npm run build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular's application builder emits to dist/<project>/browser — copy that exact dir.
COPY --from=build /app/dist/roost-frontend/browser /usr/share/nginx/html
EXPOSE 80
