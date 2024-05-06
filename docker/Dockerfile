FROM node:12 as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --force

RUN npm rebuild node-sass --legacy-peer-deps --force

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build-stage /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]