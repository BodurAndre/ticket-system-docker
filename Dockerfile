# Базовый образ
FROM openjdk:17-jdk-alpine

# Рабочая директория в контейнере
WORKDIR /app

# Копируем собранный JAR
COPY app.jar app.jar

# Пробрасываем порт
EXPOSE 8080

# Команда запуска
ENTRYPOINT ["java", "-jar", "app.jar", "--server.address=0.0.0.0"]