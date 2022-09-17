plugins {
    kotlin("jvm") version "1.6.21"
    kotlin("plugin.serialization") version "1.6.21"
    application
    id("org.jmailen.kotlinter") version "3.10.0"
    id("io.gitlab.arturbosch.detekt") version "1.20.0"
    id("com.github.johnrengelman.shadow") version "7.1.2"
    id("java")
    id("jacoco")
}

repositories {
    mavenCentral()
    maven("https://jitpack.io")
}

dependencies {
    implementation(kotlin("stdlib"))

    // JVM dependency
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.3.2")

    // Web framework
    implementation("io.javalin:javalin:4.5.0")

    // Logging
    implementation("org.slf4j:slf4j-simple:2.0.0")

    // Hashing
    implementation("com.github.komputing:khash:1.1.1")

    // Testing
    testImplementation(kotlin("test-junit5"))
    testRuntimeOnly("org.junit.jupiter", "junit-jupiter-engine", "5.8.2")
}

application {
    mainClass.set("main.kotlin.MainKt")
}

tasks {
    test {
        useJUnitPlatform()
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

java {
    sourceCompatibility = JavaVersion.VERSION_1_8
    targetCompatibility = JavaVersion.VERSION_1_8
}

detekt {
    toolVersion = "1.19.0-RC1"
    source = files("src/main/kotlin")
    config = files("$projectDir/config/detekt/detekt.yml")
}

kotlinter {
    ignoreFailures = false
    reporters = arrayOf("checkstyle", "plain")
    experimentalRules = false
    disabledRules = arrayOf("no-wildcard-imports", "filename")
}
