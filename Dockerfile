# One image for the whole app: the React build is served by Spring Boot.
FROM node:22.14.0-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
# same origin as the page, so no host is needed
ENV VITE_API_URL=/expense-tracker/api/v1
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app
COPY backend .
COPY --from=frontend /app/dist src/main/resources/static
RUN mvn clean package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
