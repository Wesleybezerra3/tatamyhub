FROM node:20-alpine

WORKDIR /app

# Instala curl e netcat para healthchecks e verificação do MySQL
RUN apk add --no-cache curl netcat-openbsd

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Garante a existência do diretório de uploads e permissão de execução do entrypoint
RUN mkdir -p uploads && \
    chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
