# sveltekit-package-template

A barebones project that provides the essentials for writing highly-optimized, reusable packages in Svelte using SvelteKit's [`package`](https://kit.svelte.dev/docs#packaging) feature.

All styles are component-scoped and preprocessed into minified and prefixed CSS during packaging using [cssnano](https://cssnano.co/) and [autoprefixer](https://github.com/postcss/autoprefixer). TypeScript type definitions are generated automatically from your components using [svelte2tsx](https://github.com/sveltejs/language-tools/tree/master/packages/svelte2tsx).

## The Problem

One of Svelte's largest pitfalls currently is it's ecosystem. Compared to more mainstream frameworks, it's userland is tiny in comparison to the thousands of available components on npm. While popularity is a large contribution to this, lack of documentation and resources is also a problem.

Many packages at the moment have some sort of pitfall. Some require bundling a large stylesheet for the entire library just to use a single component. Others require developers using it to setup a package such as [`svelte-preprocess`](https://github.com/sveltejs/svelte-preprocess) because they use TypeScript internally. Most of all, there really just isn't much information out there on library authoring. What many don't realize is that all of these aformentioned pitfalls can be worked around.

While svelte does offer an [official component template](https://github.com/sveltejs/component-template), it lacks many features required for a production-ready package (typescript, preprocessing, styling conventions).

## Getting Started

These commands will set you up with a SvelteKit development environment:

```bash
npx degit tropix126/sveltekit-package-template my-package
cd my-package
npm install # or pnpm, yarn, etc...
npm run dev
```

From there, you can edit the example Counter component in [src/lib/Counter/Counter.svelte](/src/lib/Counter/Counter.svelte).

The [`index.ts`](/src/lib/index.ts) file in [`src/lib`](/src/lib) exports your components for use in the package.

## Packaging and Publishing

### Packaging

To package your components, simply run the package command:

```bash
npm run package
```

This will preprocess the contents of [`src/lib`](/src/lib) into a `package` folder at the root of your project.

### Publishing to NPM

After you have generated the `package` folder, run `npm publish ./package` to publish your library to NPM.

Be sure to properly configure `package.json` with the correct data before publishing.

## Routes

Since the package command only generates it's files from [`src/lib`](/src/lib), you are free to put whatever you wish in the [`routes`](/src/routes) folder. This could be used as a documentation site for your component, as an example.

## Using your Package

Consumers of your package can import components from it in external projects like so:
```html
<script>
    import { Component } from "my-package";
</script>

<Component />
```

## Setting up Documentation

Most components will need documentation in some form. This template doesn't have any opinions on how documentation should be handled, however it does provide you with SvelteKit's `routes` folder which can be used for this. Below are some very useful svelte-focused tools that can make your life considerably easier when documenting components:
- [vite-plugin-svled](https://github.com/mattjennings/vite-plugin-sveld) is a vite port of [sveld](https://github.com/carbon-design-system/sveld/), which allows you to automatically generate API documentation for your svelte components using typescript types and JSDoc comments.
- [mdsvex](https://mdsvex.pngwn.io/) is a superset of markdown that allows the usage of Svelte components and interactive logic. Since mdsvex preprocesses your markdown files into Svelte components, it can also be used as SvelteKit routes.
- [mdsvex-sveld](https://github.com/mattjennings/mdsvex-sveld) is an mdsvex plugin that automatically outputs markdown tables for component API documentation using [sveld](https://github.com/carbon-design-system/sveld/).

## Setting up Theming

If you plan to develop a large amount of components, it may become necessary to have people import a theme stylesheet containing variables. This can be done by creating a `theme.css` file in [`src/lib`](/src/lib) and having people import it from `node_modules`.

Developers using your library could import the theme file like so:
```html
<script>
    import "my-package/theme.css";
    import { ComponentThatUsesTheming } from "my-package";
</script>

<ComponentThatUsesTheming />
```

Many modern bundlers support importing CSS as ES Modules. This is likely to be the best way of importing theme files, as they can be easily resolved from `node_modules`. Alternatively, you can use @import syntax with the postcss-import plugin or sass in your \<style> tags, or consider CDNS such as [unpkg](https://unpkg.com/).
