# Usar imagen de Node.js LTS
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Exponer el puerto del backend
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
