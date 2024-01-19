# Build
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY . .
RUN npm run install-deps
RUN npm run build \
    && npm run check:verify-build-artifacts -- --web
RUN mkdir /dist \
    && dist_directory=$(node 'scripts/print-dist-dir.js' --web) \
    && cp -a "${dist_directory}/." '/dist'

# Production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
