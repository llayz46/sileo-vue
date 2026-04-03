# @llayz46/sileo-vue

Physics-based toast notifications for Vue 3.

`@llayz46/sileo-vue` is a Vue port of [`sileo`](https://github.com/hiaaryan/sileo), adapted to keep the same visual language and interaction model while exposing a Vue-friendly API.

## Status

Current state of the port:
- Vue 3 compatible
- built as a library package
- uses `motion`
- supports positions, promise toasts, hover expand/collapse, gooey morphing

This project is usable, but it is still best treated as a close port rather than an unrelated implementation.

## Installation

```bash
npm install @llayz46/sileo-vue
```

Peer requirement:
- `vue >= 3.3`

## Quick Start

Mount the toaster once in your app:

```vue
<script setup lang="ts">
import { Toaster } from "@llayz46/sileo-vue"
</script>

<template>
  <Toaster />
</template>
```

Trigger toasts anywhere:

```ts
import { sileo } from "@llayz46/sileo-vue"

sileo.success({
  title: "Profile updated",
  description: "Your changes have been saved successfully.",
})
```

If your bundler does not keep CSS side effects from the package entry, import the stylesheet explicitly:

```ts
import "@llayz46/sileo-vue/styles.css"
```

## Basic API

Exports:

```ts
import { Toaster, sileo, useToast } from "@llayz46/sileo-vue"
```

Available toast methods:
- `sileo.show(options)`
- `sileo.success(options)`
- `sileo.error(options)`
- `sileo.warning(options)`
- `sileo.info(options)`
- `sileo.action(options)`
- `sileo.loading(options)`
- `sileo.promise(promise, options)`
- `sileo.dismiss(id?)`
- `sileo.clear()`

## Examples

Success toast:

```ts
sileo.success({
  title: "Changes saved",
  description: "Your profile has been updated successfully.",
})
```

Error toast with button:

```ts
sileo.error({
  title: "Upload failed",
  description: "The file exceeds the 10 MB limit.",
  button: {
    title: "Retry",
    onClick: () => {
      console.log("retry")
    },
  },
})
```

Promise toast:

```ts
await sileo.promise(uploadFile(file), {
  loading: {
    title: "Uploading file",
  },
  success: () => ({
    title: "Upload complete",
    description: "Your file is now available.",
  }),
  error: () => ({
    title: "Upload failed",
    description: "Please try again in a few minutes.",
  }),
})
```

Custom position:

```ts
sileo.info({
  title: "Heads up",
  description: "This toast is rendered top-right.",
  position: "top-right",
})
```

## Toaster Props

`Toaster` accepts:

- `position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"`
- `offset?: number | string | { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string }`
- `options?: Partial<SileoOptions>`
- `theme?: "light" | "dark" | "system"`

Example:

```vue
<script setup lang="ts">
import { Toaster } from "@llayz46/sileo-vue"
</script>

<template>
  <Toaster
    position="top-center"
    theme="system"
    :options="{ roundness: 16 }"
  />
</template>
```

## Options

Main `SileoOptions` fields:

- `id?: string`
- `title?: string`
- `description?: string | VNode | Component | null`
- `position?: SileoPosition`
- `duration?: number | null`
- `fill?: string`
- `roundness?: number`
- `icon?: string | VNode | Component | null`
- `autopilot?: boolean | { expand: number; collapse: number }`
- `button?: { title: string; onClick: () => void }`
- `styles?: { title?: string; description?: string; badge?: string; button?: string }`

Notes:
- `duration: null` keeps the toast open until replaced or dismissed
- `autopilot` controls the initial auto-expand / auto-collapse behavior for descriptive toasts
- loading toasts do not expand while they are still in `loading`

## Composable

`useToast()` exposes the reactive list of active toasts:

```ts
import { useToast } from "@llayz46/sileo-vue"

const { toasts } = useToast()
```

This is mainly useful if you want to inspect the internal toast list or build custom tooling around the store.

## Development

Local commands:

```bash
npm run dev
npm run type-check
npm run build
```

## License

MIT

## Credits

`@llayz46/sileo-vue` is a Vue port inspired by and adapted from `sileo`.

Original project:
- `https://github.com/hiaaryan/sileo`

Original package license:
- `MIT`
