plugins {
    kotlin("jvm") version "2.2.20"
    kotlin("plugin.serialization") version "2.2.20"
    application
    id("org.jmailen.kotlinter") version "5.2.0"
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
    id("com.gradleup.shadow") version "9.0.1"
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
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")

    // Web framework
    implementation("io.javalin:javalin:6.7.0")

    // Logging
    implementation("org.slf4j:slf4j-simple:2.0.17")

    // Hashing
    implementation("com.github.komputing.khash:keccak:1.1.3")

    // Testing
    testImplementation(kotlin("test-junit5"))
    testRuntimeOnly("org.junit.jupiter", "junit-jupiter-engine", "5.13.4")

    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:1.23.8")
}

application {
    mainClass.set("main.kotlin.MainKt")
}

tasks {
    test {
        useJUnitPlatform()
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile>().configureEach {
    jvmTargetValidationMode.set(org.jetbrains.kotlin.gradle.dsl.jvm.JvmTargetValidationMode.WARNING)
}

kotlin {
    jvmToolchain(21)
}

detekt {
    toolVersion = "1.23.8"
    source.setFrom("src/main/kotlin")
    config.setFrom("$projectDir/config/detekt/detekt.yml")
}

kotlinter {
    ignoreFormatFailures = false
    reporters = arrayOf("checkstyle", "plain")
}
