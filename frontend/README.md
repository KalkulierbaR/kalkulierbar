# Frontend

## Requirements

### Automatic

On `Linux` systems you can use the main install script `./install`, also described in the main README.md.

### Manual

-   Install [Node.JS](https://nodejs.org/en/download/) (v12 or v14)
-   Install [yarn](https://yarnpkg.com/getting-started/install)
-   Go into `frontend` and use command `yarn`
-   Done

## CLI Commands

-   `yarn`: Installs dependencies

-   `yarn start`: Runs `serve` or `dev`, depending on `NODE_ENV` value. Defaults to `dev server`

-   `yarn dev`: Run a development, HMR server

-   `yarn serve`: Run a production-like server

-   `yarn build`: Production-ready build

-   `yarn lint`: Pass TypeScript files using TSLint

-   `yarn test`: Run Jest and [`preact-render-spy`](https://github.com/mzgoddard/preact-render-spy) for your tests

For detailed explanation on how things work, checkout
the [CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).
