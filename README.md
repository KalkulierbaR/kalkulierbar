# KalkulierbaR

KalkulierbaR helps you master your logic skills - learn to do proofs in various calculi with beautiful graphical
representations, helpful feedback along the way, and the confidence of never building an incorrect proof.

## Try it

Check out the latest version of Kalkulierbar right here in your browser at [kbar.app](https://kbar.app) and get started
faster than you can say _weaklyconnectedregulartableauxcalculus_.

## Own it

Host your own instance of KalkulierbaR, whereever you might need it. All you need is some way to serve a static website
and some place to run a _jar_. Find the frontend and backend builds for the latest release, then simply run the backend
jar (with the `--global` flag if you want to use the app from different devices and not just localhost) and point the
frontend to your backend server in the settings. Done!
Or take a look at the backend and frontend directories for more info on how to build KalkulierbaR yourself.

For information on how to use the admin interface to add examples or disable calculi,
see [Admin Interface](./backend/docs/AdminInterface.md).

## Hack it

Ever wanted to play with your own calculus? We provide a set of different parsers, interfaces, and utilites to
make [building your own calculus](./backend/docs/ImplementingACalculus.md) as straightforward as possible - take a look
at the code and dive in!
We always appreciate your bug reports, feature ideas or pull requests - so feel free to join us in building something
cool!

## Development

### Dependencies

On `Linux` systems you can use the install script `./install`.

Supported OS are `debian/ubuntu`, `RHEL/CentOS/Fedora`, `OpenSUSE`, `ArchLinux`.

Just open your terminal, `cd` into source directory and type `./install`.

If you want to use command `yarn` and `node` elswhere or run fronted without the run.sh script then
add `/usr/local/lib/nodejs/node-v12.14.1-linux-x64/bin` to your path.

-> Problems? Then install `java`, `nodeJS` and `yarn`.

On `Windows` install these manually:

- [Oracle JDK](https://www.oracle.com/java/technologies/javase-downloads.html)
  / [OpenJDK](https://openjdk.java.net/install/index.html) >= Java version 11
- [Node.JS](https://nodejs.org/en/download/) (v12 or v14)
- [yarn](https://yarnpkg.com/getting-started/install)

### Run

- Linux: type `./run`
- Windows: `run.bat`
