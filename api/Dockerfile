# Imagen de la API del asistente. Se construye desde la raíz del repositorio
# (contexto ".") porque el build copia también los JSON de data/.

FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY data ./data
COPY api ./api
WORKDIR /workspace/api
RUN sh ./mvnw -B -q package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 app
COPY --from=build /workspace/api/target/portfolio-api.jar app.jar
USER app
# El plan gratuito de Render tiene 512 MB: la JVM usa como máximo el 75 %
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
