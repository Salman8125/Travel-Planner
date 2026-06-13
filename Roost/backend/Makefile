DOCKER_MVN = docker run --rm -v "$(CURDIR)":/app -w /app -v roost-m2:/root/.m2 maven:3.9-eclipse-temurin-21
ITEST_ENV  = -v /var/run/docker.sock:/var/run/docker.sock -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal -e TESTCONTAINERS_RYUK_DISABLED=true

.PHONY: wrapper build test itest verify

wrapper:
	$(DOCKER_MVN) mvn -q -B wrapper:wrapper -Dmaven=3.9.9

build:
	$(DOCKER_MVN) ./mvnw -q -B -DskipTests clean package

test:
	$(DOCKER_MVN) ./mvnw -q -B test

itest:
	docker run --rm -v "$(CURDIR)":/app -w /app -v roost-m2:/root/.m2 $(ITEST_ENV) \
		maven:3.9-eclipse-temurin-21 ./mvnw -q -B -Dtest='*IT' test

verify: test itest
