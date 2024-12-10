Lead Onboard Service (spring boot):

Local Setup:

1.IDE: IntelliJ

2.install java-11 - sudo apt install openjdk-11-jdk

3.install maven - sudo apt install maven

4.File -> new -> project from existing sources -> select pom.xml file inside girnarsoft-insurance-pos-core-api and click ok

5.File -> project structure -> set SDK to java 11 and language level to 8

6.For running on IntelliJ : go to File -> settings -> compiler (under build, execution, deployment) -> user local build process VM options and add the following : -Djps.track.ap.dependencies=false (for mapstruct).

7.Environment variables:
- CERT_ALIAS=1 (for trackwizz integration only)

8.Enable lombok File -> settings -> plugins

9.For running the project open LeadOnboardingServiceApplication and click on green play button

Maven Commands:

1.Compiling the project:
- mvn clean install
- mvn clean test (for running all tests)

Endpoints:

1. swagger-url: http://localhost:8080/swagger-ui/index.html
2. health-check-url: http://localhost:8080/serverHealth
3. metrics: http://localhost:50000

Docker image build steps:
1. mvn spring-boot:build-image
2. docker run -p 8080:8080 -t lead-onboarding-service