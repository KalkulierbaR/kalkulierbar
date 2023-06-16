# Implementing your own Calculus Frontend

After you have successfully [implemented the backend fo your new calculus](../../backend/docs/ImplementingACalculus.md), the next step is to implement a frontend, so people can actually use it.

Let's see how you can do this!

## Prerequisites

To implement a calculus, you should know JavaScript, [TypeScript](https://www.typescriptlang.org/), and [Preact](https://preactjs.com/) (especially [Hooks](https://preactjs.com/guide/v10/hooks)).

You should also have [Yarn](https://yarnpkg.com/) and [Node](https://nodejs.org/en/) installed.

## Types

Firstly, add the types for your calculus - it's state, parameters, and moves - to the `types/calculus` folder. Add the identifier of it to `CalculusType` in `types/calculus/index.ts`. This is where you should also add the parameters and moves to the `Move` and `Params` interfaces.

Then add a field to `AppState` in `types/app/app-state.ts` to add your calculus' state to the application state.

## The Calculus Start Page

The next step is to add a page where users can enter their formulas and configure their parameter.

Create a new component at `src/routes/my-hip-calculus/index.tsx`. As a refresher, a basic setup for components looks like this:

```tsx
const MyHipCalculus: preact.FunctionalComponent = () => {
    return (
        <div class="card">
            <h2>My Hip Calculus</h2>
        </div>
    );
};

export default MyHipCalculus;
```

Now you can use some components provided by use to allow users to enter formulas.

Add the `Format` component to explain the format to users. The `FormulaInput` component lets the user enter a formula and sends it to the backend, when they are done. Don't forget to enter the `ExampleList` component, if you want users to be able to select examples provide by an admin.

After all this, your component should look something like this:

```tsx
const MyHipCalculus: preact.FunctionalComponent = () => {
    // Set the foLogic properties to true, when your calculus is for first order

    return (
        <Fragment>
            <h2>My Hip Calculus</h2>
            <Format foLogic={false} />
            <FormulaInput calculus="my-hip-calculus" />
            <ExampleList calculus="my-hip-calculus" />
        </Fragment>
    );
};

export default MyHipCalculus;
```

Now you can add this component as a route in `components/app.tsx`.

Add an asynchronous import:

```ts
import MyHipCalculus from "!async../routes/my-hip-calculus";
```

And add the component in the `Router`:

```tsx
<MyHipCalculus path="/my-hip-calculus" />
```

Your start page is now available at `/my-hip-calculus`!

## Adding a View

After your user enters a formula, they want to actually see the formula in your calculus. For that we add a view in `routes/my-hip-calculus/view`.

Here you have a lot of freedom, and every calculus is different, so we can't really do a step-by-step tutorial here. The best way to learn is by looking at the calculi already implemented.

We'll just quickly explain some components you may want to use for your view:

-   `Zoomable`: This is very helpful, if you want to render your view as an SVG and want the user to be able to zoom and move the view around.
-   `ControlFAB`: Most calculi have variety of moves and navigation options. We found it helpful to group them in a Floating Action Button. If you want to do the same, and group all your control FABs together, this is the component for that.
-   `Dialog`: Nobody likes them, but sometimes you need a dialog.
-   Everything in `components/input`: Here we have buttons, FABs, text input, radio buttons, and some other things.
-   `Draggable`: This allows you to add drag functionality to your components, e.g. nodes in a tree.

Also check out the functions in `util`, especially `api.ts`!

After your component is ready, add it as route, just like in the previous step. And you're done!

## General tips

-   Wherever possible, use functional components with hooks instead of class components. This often leads to better code.
-   Want to access the app state? Just use the `useAppState` hook in your components and you're set!
