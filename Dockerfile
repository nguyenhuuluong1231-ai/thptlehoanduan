FROM node:20-alpine
WORKDIR /app
COPY package.json server.js app.cjs ./
COPY public ./public
COPY shared ./shared
COPY data ./data
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]

