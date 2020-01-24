# KalkulierbaR

KalkulierbaR helps you master your logic skills - learn to do proofs in various calculi with beautiful graphical representations, helpful feedback along the way, and the confidence of never building an incorrect proof.

## Try it

Check out the latest version of Kalkulierbar right here in your browser at [kalkulierbar.herokuapp.com](https://kalkulierbar.herokuapp.com) and get started faster than you can say *weaklyconnectedregulartableauxcalculus*.

## Own it

Host your own instance of KalkulierbaR, whereever you might need it. All you need is some way to serve a static website and some place to run a *jar*.  
Find the frontend and backend builds for the latest release, then simply run the backend jar (with the `--global` flag if you want to use the app from different devices and not just localhost) and point the frontend to your backend server in the settings. Done!  
Or take a look at the backend and frontend directories for more info on how to build KalkulierbaR yourself.

## Hack it

Ever wanted to play with your own calculus? We provide a set of different parsers, interfaces, and utilites to make building your own calculus as straightforward as possible - take a look at the code and dive in!  
We always appreciate your bug reports, feature ideas or pull requests - so feel free to join us in building something cool!  

Please note that this is a mirror of our private development repository. While stable features should eventually end up here, we unfortunately can't provide you with the most bleeding-edge code as of now.

## Development
### Dependencies
On `Linux` systems you can use the install script `install.sh`.
Supported OS are `debian/ubuntu`, `RHEL/CentOS/Fedora`, `OpenSUSE`, `ArchLinux`.
Just open your terminal, `cd` into source directory and type `./install.sh`.
-> Problems? Then install `java`, `nodeJS` and `yarn`.

On `Windows` install these manually:
- [Java JRE](https://www.java.com/de/download/win10.jsp) or [Java JDK](https://www.oracle.com/technetwork/java/javase/downloads/jdk11-downloads-5066655.html) > 8
- [Gradle](https://gradle.org/install/) > 6.0.1
- [Node.JS](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/en/docs/install#debian-stable)

### Run
- Linux: type `./run.sh`
- Windows: `run.bat`

