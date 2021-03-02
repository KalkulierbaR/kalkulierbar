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
    id("jacoco")
}

repositories {
    jcenter()
    maven("https://jitpack.io")
}

dependencies {
    implementation("org.xerial:sqlite-jdbc:3.32.3.2")
    implementation(kotlin("stdlib"))
    implementation("com.github.komputing:khash:0.9")
    testImplementation(kotlin("test-junit5"))
    testRuntimeOnly("org.junit.jupiter", "junit-jupiter-engine", "5.5.2")
    compile("io.javalin:javalin:3.6.0")
    compile("org.slf4j:slf4j-simple:1.8.0-beta4")
    compile("org.jetbrains.kotlinx:kotlinx-serialization-runtime:0.13.0") // JVM dependency
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
    config = files("$projectDir/config/detekt/detekt.yml")
}

kotlinter {
    ignoreFailures = false
    indentSize = 4
    reporters = arrayOf("checkstyle", "plain")
    experimentalRules = false
    disabledRules = arrayOf("no-wildcard-imports", "filename")
}
