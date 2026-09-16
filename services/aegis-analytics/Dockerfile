# Java 21 JDK & Maven ile Derleme
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY services/aegis-analytics/pom.xml .
COPY services/aegis-analytics/src ./src
RUN mvn clean package -DskipTests

# Java 21 JRE ile Çalıştırma
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
