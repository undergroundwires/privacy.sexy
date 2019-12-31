# +-+-+-+-+-+ +-+-+-+-+-+
# |B|u|i|l|d| |S|t|a|g|e|
# +-+-+-+-+-+ +-+-+-+-+-+
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# For testing purposes, it's easy to run http-server on lts-alpine such as continuing from here:
#       RUN npm install -g http-server
#       EXPOSE 8080
#       CMD [ "http-server", "dist" ]

# +-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+
# |P|r|o|d|u|c|t|i|o|n| |S|t|a|g|e|
# +-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]