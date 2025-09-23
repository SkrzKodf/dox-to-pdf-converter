FROM node:22.12.0-slim AS build

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libreoffice-core \
      libreoffice-writer \
      fonts-dejavu-core && \
    rm -rf /var/lib/apt/lists/* \

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]