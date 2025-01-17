<h2 align='center'><samp>vite-plugin-turbo-reload</samp></h2>

<p align='center'>Automatically reload the page via Hotwired Turbo when files are modified</p>

<p align='center'>
  <a href='https://www.npmjs.com/package/vite-plugin-turbo-reload'>
    <img src='https://img.shields.io/npm/v/vite-plugin-turbo-reload?color=222&style=flat-square'>
  </a>
  <a href='https://github.com/ElMassimo/vite-plugin-turbo-reload/blob/main/LICENSE.txt'>
    <img src='https://img.shields.io/badge/license-MIT-blue.svg'>
  </a>
</p>

<br>

[vite-plugin-turbo-reload]: https://github.com/ermolaev/vite-plugin-turbo-reload
[vite-plugin-full-reload]: https://github.com/ElMassimo/vite-plugin-full-reload
[vite-plugin-live-reload]: https://github.com/arnoson/vite-plugin-live-reload
[Vite Ruby]: https://github.com/ElMassimo/vite_ruby
[picomatch]: https://github.com/micromatch/picomatch#globbing-features
[Hotwire Turbo]: https://turbo.hotwired.dev/

## Why? 🤔

When using _[Vite Ruby]_, I wanted to see changes to server-rendered layouts and templates without having to manually reload the page.

_[vite-plugin-turbo-reload]_ is a replacement for the _[vite-plugin-full-reload]_ plugin, offering smoother and faster DOM updates when using _[Hotwire Turbo]_.

## Installation 💿

Install the package as a development dependency:

```bash
npm i -D vite-plugin-turbo-reload # yarn add -D vite-plugin-turbo-reload
```

## Usage 🚀

Add it to your plugins in `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import TurboReload from 'vite-plugin-turbo-reload'

export default defineConfig({
  plugins: [
    TurboReload(['config/routes.rb', 'app/views/**/*', 'app/components/**/*'])
  ],
})
```

This is useful to trigger a page refresh for files that are not being imported, such as server-rendered templates.

To see which file globbing options are available, check [picomatch].

## Limitation
- work only with Turbo version 8.0+
- if using plugin `vite-plugin-rails` you should set `fullReload: false`:
```js
import { defineConfig } from 'vite'
import rails from "vite-plugin-rails"
import TurboReload from 'vite-plugin-turbo-reload'

export default defineConfig({
  plugins: [
    rails({ fullReload: false }),
    TurboReload(['app/views/**/*', 'app/components/**/*']),
  ],
})
```

## Configuration ⚙️

The following options can be provided:

- <kbd>root</kbd>
  
  Files will be resolved against this directory.

  __Default:__ `process.cwd()`

  ``` js
  TurboReload('config/routes.rb', { root: __dirname }),
  ``` 

- <kbd>delay</kbd>

  How many milliseconds to wait before reloading the page after a file change.
  It can be used to offset slow template compilation in Rails.

  __Default:__ `0`
  
  ```js
  TurboReload('app/views/**/*', { delay: 100 })
  ```

- <kbd>tailwindDirectivePath</kbd>

  Path to file, that contains Tailwind directive - `@tailwind base` or `@import "tailwindcss"`

  __Default:__ `false`

  ```js
  TurboReload('app/views/**/*', {
    tailwindDirectivePath: "app/frontend/stylesheets/tailwind.scss"
  })
  ```

## License

This library is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
