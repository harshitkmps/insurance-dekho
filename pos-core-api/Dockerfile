FROM maven:3.6.3-openjdk-16-slim as builder
WORKDIR /opt
COPY . /opt
RUN mvn clean package spring-boot:repackage


FROM 724772087967.dkr.ecr.ap-south-1.amazonaws.com/openjdk11:latest
WORKDIR /usr/app
COPY --from=builder /opt/src/main/resources /usr/app/resources
COPY --from=builder /opt/target/lead-onboarding-service-0.0.1-SNAPSHOT.jar /usr/app/lead-onboarding-service-0.0.1-SNAPSHOT.jar
COPY --from=builder /opt/src/main/resources/newrelic/newrelic.jar /usr/app
COPY --from=builder /opt/src/main/resources/newrelic/newrelic.yml /usr/app

EXPOSE 8080
CMD ["java", "-javaagent:/usr/app/newrelic.jar" ,"-jar", "/usr/app/lead-onboarding-service-0.0.1-SNAPSHOT.jar"]