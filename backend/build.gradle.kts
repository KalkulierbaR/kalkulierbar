plugins {
    kotlin("jvm") version "1.3.50"
    application
    eclipse
    id("org.jmailen.kotlinter") version "2.1.2"
    id("io.gitlab.arturbosch.detekt") version "1.1.1"
}

repositories {
    jcenter()
}

dependencies {
    implementation(kotlin("stdlib"))
    testImplementation(kotlin("test-junit"))
    compile("io.javalin:javalin:3.6.0")
    compile("org.slf4j:slf4j-simple:1.8.0-beta4")
}

application {
    mainClassName = "main.kotlin.MainKt"
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