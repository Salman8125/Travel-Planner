FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -B -q dependency:go-offline
COPY src ./src
RUN ./mvnw -B -q -DskipTests clean package \
    && java -Djarmode=layertools -jar target/app.jar extract --destination target/extracted

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=build /app/target/extracted/dependencies/ ./
COPY --from=build /app/target/extracted/spring-boot-loader/ ./
COPY --from=build /app/target/extracted/snapshot-dependencies/ ./
COPY --from=build /app/target/extracted/application/ ./
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
    CMD wget -qO- http://localhost:8080/actuator/health/readiness || exit 1
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
