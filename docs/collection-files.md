# Collection files

privacy.sexy is a data-driven application that reads YAML files.
This document details the structure and syntax of the YAML files located in [`application/collections`](./../src/application/collections/), which form the backbone of the application's data model. The YAML schema [`.schema.yaml`](./../src/application/collections/.schema.yaml) is provided to provide better IDE support and be used in automated validations.

Related documentation:

- 📖 [`Collections README`](./../src/application/collections/README.md) includes references to code as documentation.
- 📖 [Script Guidelines](./script-guidelines.md) provide guidance on script creation including best-practices.

## Objects

### `Collection`

- Defines categories, scripts, and OS-specific details in a tree structure.
- Allows defining common [functions](#function) for code reuse.

#### `Collection` syntax

- `os:` *`string`* **(required)**
  - Operating system for the collection.
  - 📖 See [`OperatingSystem.ts`](./../src/domain/OperatingSystem.ts) for possible values.
- `actions: [` ***[`Category`](#category)*** `, ... ]` **(required)**
  - Renders each parent category as cards in the user interface.
  - ❗ A [Collection](#collection) must consist of at least one category.
- `functions: [` ***[`Function`](#function)*** `, ... ]`
  - Optional for code reuse.
- `scripting:` ***[`ScriptingDefinition`](#scriptingdefinition)*** **(required)**
  - Sets the scripting language for all inline code used within the collection.

### Executables

An Executable is a logical entity that can

- execute once compiled,
- include a `docs` property for documentation.

It's either [Category](#category) or a [Script](#script).

#### `Category`

Represents a logical group of scripts and subcategories.

##### `Category` syntax

- `category:` *`string`*  **(required)**
  - Name of the category.
  - ❗ Must be unique throughout the [collection](#collection).
- `children: [` ***[`Category`](#category)*** `|` [***`Script`***](#script) `, ... ]` **(required)**
  - ❗ Category must consist of at least one subcategory or script.
  - Children can be combination of scripts and subcategories.
- `docs`: *`string`* | `[`*`string`*`, ... ]`
  - Markdown-formatted documentation related to the category.

#### `Script`

Represents an individual tweak.

Types (like [functions](#function)):

1. Inline script:
   - Direct code.
   - ❗ Requires `code` and optional `revertCode`.
2. Caller script:
   - Calls other [functions](#function).
   - ❗ Requires `call`, but not `code` or `revertCode`.

📖 For detailed guidelines, see [Script Guidelines](./script-guidelines.md).

##### `Script` syntax

- `name`: *`string`* **(required)**
  - Script name.
  - ❗ Must be unique throughout the [Collection](#collection).
- `code`: *`string`* **(conditionally required)**
  - Code to execute when the user selects the script.
  - 💡 If defined, it's best practice to also define `revertCode`.
  - ❗ Cannot co-exist with `call`, define either `code` with optional `revertCode` or `call`.
- `revertCode`: *`string`*
  - Reverts changes made by `code`.
  - ❗ Cannot co-exist with `call`, define `revertCode` with `code` or `call`.
- `call`: ***[`FunctionCall`](#functioncall)*** | `[` ***[`FunctionCall`](#functioncall)*** `, ... ]` **(conditionally required)**
  - A shared function or sequence of functions to call (called in order).
  - ❗ Cannot co-exist with `code` or `revertCode`, define `code` with optional `revertCode` or `call`.
- `docs`: *`string`* | `[`*`string`*`, ... ]`
  - Markdown-formatted documentation related to the script.
- `recommend`: *`"standard"`* | *`"strict"`* | *`undefined`* (default: `undefined`)
  - Sets recommendation level.
  - Application will not recommend the script if `undefined`.

📖 For detailed guidelines, see [Script Guidelines](./script-guidelines.md).

### `FunctionCall`

Specifies a function call. It may require providing argument values to its parameters.

#### `FunctionCall` syntax

- `function`: *`string`* **(required)**
  - Name of the function to call.
  - ❗ Function with same name must defined in `functions` property of [Collection](#collection).
- `parameters`: `[` *`parameterName: parameterValue`* `, ... ]`
  - Key-value pairs representing function parameters and their corresponding argument values.
  - 📖 See [parameter substitution](./templating.md#parameter-substitution) for an example usage.
  - 💡 You can use [expressions (templating)](./templating.md#expressions) when providing argument values for parameters.

### `Function`

- Enables reusable code in scripts.
- Functions are templates compiled by privacy.sexy and uses special expression expressions.
- A function can be of two different types (like [scripts](#script)):
  1. Inline function: a function with an inline code.
     - ❗ Requires `code` and optionally `revertCode`, but not `call`.
  2. Caller function: a function that calls other functions.
     - ❗ Requires `call`, but not `code` or `revertCode`.
- 📖 Read about function expressions in [Templating](./templating.md) with [example usages](./templating.md#parameter-substitution).

#### `Function` syntax

- `name`: *`string`* **(required)**
  - Name of the function that scripts will use.
  - ❗ Function names must be unique.
  - ❗ Function names must follow camelCase and start with verbs (e.g., `uninstallStoreApp`).
- `parameters`: `[` ***[`FunctionParameter`](#functionparameter)*** `, ... ]` **(conditionally required)**
  - Lists parameters used.
  - ❗ Required to be able use in [`FunctionCall`](#functioncall) or [expressions (templating)](./templating.md#expressions).
- `code`: *`string`* **(conditionally required)**
  - Code to execute when the user selects the script.
  - 💡 You can use [expressions (templating)](./templating.md#expressions) in its value.
  - 💡 If defined, it's best practice to also define `revertCode`.
  - ❗ Cannot co-exist with `call`, define either `code` with optional `revertCode` or `call`.
- `revertCode`: *`string`*
  - Reverts changes made by `code`.
  - 💡 You can use [expressions (templating)](./templating.md#expressions) in its value.
  - ❗ Cannot co-exist with `call`, define `revertCode` with `code` or `call`.
- `call`: ***[`FunctionCall`](#functioncall)*** | `[` ***[`FunctionCall`](#functioncall)*** `, ... ]` **(conditionally required)**
  - A shared function or sequence of functions to call (called in order).
  - 💡 You can use [expressions (templating)](./templating.md#expressions) in argument values provided for parameters.
  - ❗ Cannot co-exist with `code` or `revertCode`, define `code` with optional `revertCode` or `call`.

### `FunctionParameter`

- Defines a single parameter that may require an argument value optionally or mandatory.
- A [`FunctionCall`](#functioncall) provides argument values by a caller.
  - A caller can be a [Script](#script) or [Function](#function).

#### `FunctionParameter` syntax

- `name`: *`string`* **(required)**
  - Name of the parameter that the function has.
  - ❗ Required for [expressions (templating)](./templating.md#expressions).
  - ❗ Must be unique and consists of alphanumeric characters.
- `optional`: *`boolean`* (default: `false`)
  - Indicates the caller must provide and argument value for the parameter.
  - 💡 If set to `false` i.e. an argument value is not optional then it expects a non-empty value for the variable.
    - E.g., in a [`with` expression](./templating.md#with).
  - 💡 Set it to `true` if you will use its argument value conditionally;
    - Or else set it to `false` for verbosity or do not define it as default value is `false` anyway.

### `ScriptingDefinition`

Sets global scripting properties for a [Collection](#collection).

#### `ScriptingDefinition` syntax

- `language:` *`string`* **(required)**
  - 📖 See [`ScriptingLanguage.ts`](./../src/domain/ScriptingLanguage.ts) enumeration for allowed values.
- `startCode:` *`string`* **(required)**
  - Prepends the given code to the generated script file.
  - 💡 You can use global variables such as `$homepage`, `$version`, `$date` via [parameter substitution](./templating.md#parameter-substitution) code syntax such as `Welcome to {{ $homepage }}!`.
- `endCode:` *`string`* **(required)**
  - Appends to the given code to the generated script file.
  - 💡 You can use global variables such as `$homepage`, `$version`, `$date` via [parameter substitution](./templating.md#parameter-substitution) code syntax such as `Welcome to {{ $homepage }}!`.
