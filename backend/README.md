# Backend

## Requirements

### Automatic

On `Linux` systems you can use the main install script `./install`, also described in the main README.md.

### Manual

- Install a Java Version >= 9: [Oracle JDK](https://www.oracle.com/java/technologies/javase-downloads.html)
  / [OpenJDK](https://openjdk.java.net/install/index.html)
- Go into `backend` and use command `./gradlew`
- Done

## CLI Commands

- `./gradlew`: Installs dependencies

- `./gradlew build`: build, test, and analyze the project

- `./gradlew run`: creates build, runs it and by default listens on http://localhost:7000/

- `./gradlew run --args='--global'` or `./gradlew run --args='-g'`: same as run, but listens on http://0.0.0.0:7000/ by
  default

- On `Windows` replace `./gradlew` with `./gradlew.bat` for all commands mentioned above
