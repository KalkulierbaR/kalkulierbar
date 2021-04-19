plugins {
    kotlin("jvm") version "1.3.50"
    application
    eclipse
    jacoco
    id("org.jmailen.kotlinter") version "2.1.2"
    id("io.gitlab.arturbosch.detekt") version "1.1.1"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.3.50"
    id("com.github.johnrengelman.shadow") version "5.2.0"
    id("java")
}

repositories {
    jcenter()
    maven("https://jitpack.io")
}

dependencies {
    implementation(kotlin("stdlib"))

    // Hashing
    implementation("com.github.komputing:khash:0.9")

    // Linting
    implementation("io.javalin:javalin:3.6.0")

    // Logging
    implementation("org.slf4j:slf4j-simple:1.8.0-beta4")

    // JVM dependency
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-runtime:0.13.0")

    // Testing
    testImplementation(kotlin("test-junit5"))
    testRuntimeOnly("org.junit.jupiter", "junit-jupiter-engine", "5.5.2")
}

application {
    mainClassName = "main.kotlin.MainKt"
}

tasks {
    test {
        useJUnitPlatform()
    }
}

eclipse {
    classpath {
        containers("org.jetbrains.kotlin.core.KOTLIN_CONTAINER")
    }
}

detekt {
    toolVersion = "1.1.1"
    input = files("src/main/kotlin")
    filters = ".*/resources/.*,.*/build/.*"
}
