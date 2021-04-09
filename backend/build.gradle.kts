plugins {
    kotlin("jvm") version "1.4.30"
    kotlin("plugin.serialization") version "1.4.30"
    application
    id("org.jmailen.kotlinter") version "3.4.0"
    id("io.gitlab.arturbosch.detekt") version "1.16.0"
    id("com.github.johnrengelman.shadow") version "5.2.0"
    id("java")
    id("jacoco")
}

repositories {
    jcenter()
    maven("https://jitpack.io")
}

dependencies {
    implementation(kotlin("stdlib"))
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.1.0")
    implementation("io.javalin:javalin:3.13.4")
    implementation("org.slf4j:slf4j-simple:1.8.0-beta4")
    implementation("com.github.komputing:khash:1.1.0")
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

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

detekt {
    toolVersion = "1.16.0"
    input = files("src/main/kotlin")
    config = files("$projectDir/config/detekt/detekt.yml")
}

kotlinter {
    ignoreFailures = false
    indentSize = 4
    reporters = arrayOf("checkstyle", "plain")
    experimentalRules = false
    disabledRules = arrayOf("no-wildcard-imports", "filename")
}
