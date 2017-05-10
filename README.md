> :warning: WARNING: This project is still experimental / under development. Do not use in production. :warning:

# Accessible Autocomplete

[![npm version](https://img.shields.io/npm/v/accessible-autocomplete.svg)](http://npm.im/accessible-autocomplete)
[![Build Status](https://travis-ci.org/alphagov/accessible-autocomplete.svg?branch=master)](https://travis-ci.org/alphagov/accessible-autocomplete)
[![Coverage Status](https://coveralls.io/repos/github/alphagov/accessible-autocomplete/badge.svg?branch=master)](https://coveralls.io/github/alphagov/accessible-autocomplete?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![gzip size](http://img.badgesize.io/https://unpkg.com/accessible-autocomplete/dist/accessible-autocomplete.min.js?compression=gzip)](https://unpkg.com/accessible-autocomplete/dist/accessible-autocomplete.min.js)

[![Sauce Labs Build Status](https://saucelabs.com/browser-matrix/tvararu-alphagov.svg)](https://saucelabs.com/u/tvararu-alphagov)

`accessible-autocomplete` is a JavaScript autocomplete built from the ground up to be accessible. The design goals are:

- **Accessibility**: Following WAI-ARIA best practices and testing with assistive technologies.
- **User experience**: Supporting a wide variety of user needs.
- **Compatibility**: Working with as many browsers, devices, and assistive technologies as possible.

[Try out the examples!](https://alphagov.github.io/accessible-autocomplete/examples/)

## Installation / Usage

### Using npm

Install it by running:

```bash
npm install --save accessible-autocomplete
```

Import it using a module system like Webpack:

```js
import accessibleAutocomplete from 'accessible-autocomplete'
```

Or using a script tag:

```html
<script type="text/javascript" src="node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.js"></script>
```

And then call the `accessibleAutocomplete` function, providing a suggestion engine:

```js
function suggest (query, populateResults) {
  const results = [
    'France',
    'Germany',
    'United Kingdom'
  ]
  const filteredResults = results.filter(result => result.indexOf(query) !== -1)
  populateResults(filteredResults)
}

accessibleAutocomplete({
  element: document.querySelector('#my-autocomplete-container'),
  id: 'my-autocomplete',
  source: suggest
})
```

Don't forget to include the stylesheet:

```html
<link rel="stylesheet" href="node_modules/accessible-autocomplete/dist/accessible-autocomplete.min.css" />
```

## API Documentation

> :warning: WARNING: This is a work in progress and will change significantly. :warning:

### Required options

#### `element`

Type: `PropTypes.instanceOf(HTMLElement)`

The container element in which the autocomplete will be rendered in.

#### `source`

Type: `PropTypes.func`

Arguments: `query: string, populateResults: Function`

Similar to the [`source` argument for typeahead.js](https://github.com/corejavascript/typeahead.js/blob/47d46b40cb834d8285ac9328c4b436e5eccf7197/doc/jquery_typeahead.md#datasets), a backing data source for suggestions. `query` is what gets typed into the input field, which will callback to `populateResults` synchronously with the array of string results to display in the menu.

An example of a simple suggestion engine:

```js
function suggest (query, populateResults) {
  const results = [
    'France',
    'Germany',
    'United Kingdom'
  ]
  const filteredResults = results.filter(result => result.indexOf(query) !== -1)
  populateResults(filteredResults)
}
```

### Other options

#### `autoselect` (default: `false`)

Type: `PropTypes.bool`

Set to true to highlight the first option when the user types in something and receives results. Pressing enter will select it.

#### `cssNamespace` (default: `'autocomplete'`)

Type: `PropTypes.string`

The default CSS classes use [BEM](http://getbem.com/) with `autocomplete` as the block name. If you already have CSS rules for `.autocomplete--menu` or any of the other default classes, you can use this property to rename them and prevent clashes.

TODO: Better styling docs.

#### `defaultValue` (default: `''`)

Type: `PropTypes.string`

Specify a string to prefill the autocomplete with.

#### `displayMenu` (default: `'inline'`)

Type: `PropTypes.oneOf(['inline', 'overlay'])`

You can set this property to specify the way the menu should appear, whether inline or as an overlay.

#### `id` (default: `'autocomplete'`)

Type: `PropTypes.string`

The `id` for the autocomplete input field, to use with a `<label for=id>`. Required if you're instantiating more than one autocomplete in one page.

#### `minLength` (default: `0`)

Type: `PropTypes.number`

The minimum number of characters that should be entered before the autocomplete will attempt to suggest options. When the query length is under this, the aria status region will also provide helpful text to the user informing them they should type in more.

#### `name` (default: `'input-autocomplete'`)

Type: `PropTypes.string`

The `name` for the autocomplete input field, to use with a parent `<form>`.

#### `onSelect` (default: `() => {}`)

Type: `PropTypes.func`

Arguments: `selected: Object`

This function will be called when the user selects an option, with the option they've selected.

#### `selectOnBlur` (default: `true`)

Type: `PropTypes.bool`

Set this value to `false` to stop the autocomplete from automatically confirming a value when it has been selected using autoselect or the keyboard and the user "blurs" (clicks outside of the component).

#### `showNoOptionsFound` (default: `true`)

Type: `PropTypes.bool`

Set this value to `false` to not display the "No options found" template when there are no results available. Some autocompletes might intermittently display results between different search term roots (like one based on [lunrjs](http://lunrjs.com/)), and as such wouldn't need to use this.

#### `templates` (default: `undefined`)

Type:
```js
PropTypes.shape({
  inputValue: PropTypes.func,
  suggestion: PropTypes.func
})
```

This object defines templates (functions) that are used for displaying parts of the autocomplete.

`inputValue` is a function that receives one argument, the currently selected suggestion. It is used to populate the value of the input field, and should return a string.

`suggestion` is a function that receives one argument, a suggestion to be displayed. It is used when rendering suggestions, and should return a string, which can contain HTML. :warning: **Caution:** because this function allows you to output arbitrary HTML, you should [make sure it's trusted](https://en.wikipedia.org/wiki/Cross-site_scripting), and accessible.

#### `placeholder` (default: `''`, :warning: not recommended :warning:)

Type: `PropTypes.string`

This option will populate the `placeholder` attribute on the input element.

We think [placeholders have usability issues](http://adamsilver.io/articles/placeholders-are-problematic/) and that there are [better alternatives to input placeholder text](https://govuk-elements.herokuapp.com/form-elements/#form-hint-text), so we do not recommend using this option.

## Progressive enhancement

If your autocomplete is meant to select from a small list of options (a few hundreds), we strongly suggest that you render a `<select>` menu on the server, and use progressive enhancement.

If you have the following HTML:

```html
<select id="location-picker">
  <option value="fr">France</option>
  <option value="de">Germany</option>
  <option value="gb">United Kingdom</option>
</select>
```

You can use the `accessibleAutocomplete.enhanceSelectElement` function to enhance it into an autocomplete:

```js
accessibleAutocomplete.enhanceSelectElement({
  selectElement: document.querySelector('#location-picker')
})
```

This will:

- Place an autocomplete input field adjacent to the specified `<select>`
- Default the autocomplete `defaultValue` to the select's `option[selected]`
- Default the autocomplete `id` to the `<select>`'s `id`
- Default the autocomplete `name` attribute to `''` to prevent it being included in form submissions
- Default the autocomplete `source` to a basic one that uses any existing `<option>`s from the `<select>`
- Hide the `<select>` using inline `display: none`
- Set the `<select>`'s id to `${id}-select` to decouple from any `<label>`
- Upon selecting a value in the autocomplete, update the original `<select>`

This function takes the same options as `accessibleAutocomplete`, with the only difference being that it uses `selectElement` instead of `element`, which needs to be an instance of `HTMLSelectElement`.

> **Note**: The `accessibleAutocomplete.enhanceSelectElement` function is fairly light and wraps the public API for `accessibleAutocomplete`. If your use case doesn't fit the above defaults, try [reading the source](src/wrapper.js) and seeing if you can write your own.

## Analytics & Tracking

The following events get triggered on he input element during the life cycle of the autocomplete:

- `onSelect` - This function will be called when the user selects an option, with the option they've selected.

Example usage:

```js
accessibleAutocomplete({
  // …
  onSelect: (val) => {
    track(val)
  }
})
```

## Why another autocomplete?

`accessible-autocomplete` was built after studying many existing solutions and prototyping patches to fix user experience or accessibility issues. It draws heavy inspiration from the following (and a lot of others):

- [ljwatson/design-patterns](http://ljwatson.github.io/design-patterns/autocomplete/index.html): great accessible experience
- [corejavascript/corejs-typeahead](https://github.com/corejavascript/typeahead.js): flexible autocomplete/suggestion engine architecture
- [JamieAppleseed/selectToAutocomplete](https://github.com/JamieAppleseed/selectToAutocomplete): ease of use

## Developing locally

Check out the [CONTRIBUTING](CONTRIBUTING.md) guide for instructions.

If you want to help and want to get more familiar with the codebase, try starting with the ["good for beginners"](https://github.com/alphagov/accessible-autocomplete/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+for+beginners%22) issues.

## License

[MIT](LICENSE.txt).
