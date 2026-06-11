FROM node:22-alpine AS build
WORKDIR /app
ARG PUBLIC_API_URL=http://localhost:4003
ENV PUBLIC_API_URL=$PUBLIC_API_URL
COPY . .
RUN npm ci
RUN npm run build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
