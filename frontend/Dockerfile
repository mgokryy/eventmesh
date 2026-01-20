FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

# SUPPRIME la config par défaut d'Apache/nginx
RUN rm -rf /usr/share/nginx/html/* && rm -f /etc/nginx/conf.d/default.conf

# Vite génère /dist
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
