FROM node:18 as build-stage

WORKDIR /app

COPY package*.json ./

#RUN npm install --legacy-peer-deps --force
RUN npm ci --legacy-peer-deps

#RUN npm rebuild node-sass --legacy-peer-deps --force

COPY . .

RUN npm run build

FROM nginxinc/nginx-unprivileged  

COPY --from=build-stage /app/build /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

USER 1000
