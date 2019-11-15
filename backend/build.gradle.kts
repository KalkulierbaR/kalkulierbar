plugins {
    kotlin("jvm") version "1.3.50"
    application
    eclipse
    id("org.jmailen.kotlinter") version "2.1.2"
    id("io.gitlab.arturbosch.detekt") version "1.1.1"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.3.50"
}

repositories {
    jcenter()
}

dependencies {
    implementation(kotlin("stdlib"))
    testImplementation(kotlin("test-junit5"))
    testRuntimeOnly("org.junit.jupiter", "junit-jupiter-engine", "5.5.2")
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.4.2")
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
}