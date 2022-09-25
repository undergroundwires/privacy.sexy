# Collection files

- privacy.sexy is a data-driven application where it reads the necessary OS-specific logic from yaml files in [`application/collections`](./../src/application/collections/)
- 💡 Best practices
  - If you repeat yourself, try to utilize [YAML-defined functions](#Function)
  - Always try to add documentation and a way to revert a tweak in [scripts](#Script)
- 📖 Types in code: [`collection.yaml.d.ts`](./../src/application/collections/collection.yaml.d.ts)

## Objects

### `Collection`

- A collection simply defines:
  - different categories and their scripts in a tree structure
  - OS specific details
- Also allows defining common [function](#Function)s to be used throughout the collection if you'd like different scripts to share same code.

#### `Collection` syntax

- `os:` *`string`*  (**required**)
  - Operating system that the [Collection](#collection) is written for.
  - 📖 See [OperatingSystem.ts](./../src/domain/OperatingSystem.ts) enumeration for allowed values.
- `actions: [` ***[`Category`](#Category)*** `, ... ]` **(required)**
  - Each [category](#category) is rendered as different cards in card presentation.
  - ❗ A [Collection](#collection) must consist of at least one category.
- `functions: [` ***[`Function`](#Function)*** `, ... ]`
  - Functions are optionally defined to re-use the same code throughout different scripts.
- `scripting:` ***[`ScriptingDefinition`](#ScriptingDefinition)*** **(required)**
  - Defines the scripting language that the code of other action uses.

### `Category`

- Category has a parent that has tree-like structure where it can have subcategories or subscripts.
- It's a logical grouping of different scripts and other categories.

#### `Category` syntax

- `category:` *`string`*  (**required**)
  - Name of the category
  - ❗ Must be unique throughout the [Collection](#collection)
- `children: [` ***[`Category`](#Category)*** `|` [***`Script`***](#Script) `, ... ]`  (**required**)
  - ❗ Category must consist of at least one subcategory or script.
  - Children can be combination of scripts and subcategories.
- `docs`: *`string`* | `[`*`string`*`, ... ]`
  - Documentation pieces related to the category.
  - Rendered as markdown.

### `Script`

- Script represents a single tweak.
- A script can be of two different types (just like [functions](#function)):
  1. Inline script; a script with an inline code
     - Must define `code` property and optionally `revertCode` but not `call`
  2. Caller script; a script that calls other functions
     - Must define `call` property but not `code` or `revertCode`
- 🙏 For any new script, please add `revertCode` and `docs` values if possible.

#### `Script` syntax

- `name`: *`string`* (**required**)
  - Name of the script
  - ❗ Must be unique throughout the [Collection](#collection)
  - E.g. `Disable targeted ads`
- `code`: *`string`* (may be **required**)
  - Batch file commands that will be executed
  - 💡 If defined, best practice to also define `revertCode`
  - ❗ If not defined `call` must be defined, do not define if `call` is defined.
- `revertCode`: `string`
  - Code that'll undo the change done by `code` property.
  - E.g. let's say `code` sets an environment variable as `setx POWERSHELL_TELEMETRY_OPTOUT 1`
    - then `revertCode` should be doing `setx POWERSHELL_TELEMETRY_OPTOUT 0`
  - ❗ Do not define if `call` is defined.
- `call`: ***[`FunctionCall`](#FunctionCall)*** | `[` ***[`FunctionCall`](#FunctionCall)*** `, ... ]` (may be **required**)
  - A shared function or sequence of functions to call (called in order)
  - ❗ If not defined `code` must be defined
- `docs`: *`string`* | `[`*`string`*`, ... ]`
  - Documentation pieces related to the script.
  - Rendered as markdown.
- `recommend`: `"standard"` | `"strict"` | `undefined` (default)
  - If not defined then the script will not be recommended
  - If defined it can be either
    - `standard`: Only non-breaking scripts without limiting OS functionality
    - `strict`: Scripts that can break certain functionality in favor of privacy and security

### `FunctionCall`

- Describes a single call to a function by optionally providing values to its parameters.
- 👀 See [parameter substitution](./templating.md#parameter-substitution) for an example usage

#### `FunctionCall` syntax

- `function`: *`string`* (**required**)
  - Name of the function to call.
  - ❗ Function with same name must defined in `functions` property of [Collection](#collection)
- `parameters`: `[ parameterName:` *`parameterValue`*`, ... ]`
  - Defines key value dictionary for each parameter and its value
  - E.g.

    ```yaml
      parameters:
        userDefinedParameterName: parameterValue
        # ...
        appName: Microsoft.WindowsFeedbackHub
    ```

  - 💡 [Expressions (templating)](./templating.md#expressions) can be used as parameter value

### `Function`

- Functions allow re-usable code throughout the defined scripts.
- Functions are templates compiled by privacy.sexy and uses special expression expressions.
- A function can be of two different types (just like [scripts](#script)):
  1. Inline function: a function with an inline code.
     - Must define `code` property and optionally `revertCode` but not `call`.
  2. Caller function: a function that calls other functions.
     - Must define `call` property but not `code` or `revertCode`.
- 👀 Read more on [Templating](./templating.md) for function expressions and [example usages](./templating.md#parameter-substitution).

#### `Function` syntax

- `name`: *`string`* (**required**)
  - Name of the function that scripts will use.
  - Convention is to use camelCase, and be verbs.
  - E.g. `uninstallStoreApp`
  - ❗ Function names must be unique
- `parameters`: `[` ***[`FunctionParameter`](#FunctionParameter)*** `, ... ]`
  - List of parameters that function code refers to.
  - ❗ Must be defined to be able use in [`FunctionCall`](#functioncall) or [expressions (templating)](./templating.md#expressions)
 `code`: *`string`* (**required** if `call` is undefined)
  - Batch file commands that will be executed
  - 💡 [Expressions (templating)](./templating.md#expressions) can be used in its value
  - 💡 If defined, best practice to also define `revertCode`
  - ❗ If not defined `call` must be defined
- `revertCode`: *`string`*
  - Code that'll undo the change done by `code` property.
  - E.g. let's say `code` sets an environment variable as `setx POWERSHELL_TELEMETRY_OPTOUT 1`
    - then `revertCode` should be doing `setx POWERSHELL_TELEMETRY_OPTOUT 0`
  - 💡 [Expressions (templating)](./templating.md#expressions) can be used in code
- `call`: ***[`FunctionCall`](#FunctionCall)*** | `[` ***[`FunctionCall`](#FunctionCall)*** `, ... ]` (may be **required**)
  - A shared function or sequence of functions to call (called in order)
  - The parameter values that are sent can use [expressions (templating)](./templating.md#expressions)
  - ❗ If not defined `code` must be defined

### `FunctionParameter`

- Defines a parameter that function requires optionally or mandatory.
- Its arguments are provided by a [Script](#script) through a [FunctionCall](#FunctionCall).

#### `FunctionParameter` syntax

- `name`: *`string`* (**required**)
  - Name of the parameters that the function has.
  - Parameter names must be defined to be used in [expressions (templating)](./templating.md#expressions).
  - ❗ Parameter names must be unique and include alphanumeric characters only.
- `optional`: *`boolean`* (default: `false`)
  - Specifies whether the caller [Script](#script) must provide any value for the parameter.
  - If set to `false` i.e. an argument value is not optional then it expects a non-empty value for the variable;
    - Otherwise it throws.
  - 💡 Set it to `true` if a parameter is used conditionally;
    - Or else set it to `false` for verbosity or do not define it as default value is `false` anyway.
  - 💡 Can be used in conjunction with [`with` expression](./templating.md#with).

### `ScriptingDefinition`

- Defines global properties for scripting that's used throughout its parent [Collection](#collection).

#### `ScriptingDefinition` syntax

- `language:` *`string`* (**required**)
  - 📖 See [ScriptingLanguage.ts](./../src/domain/ScriptingLanguage.ts) enumeration for allowed values.
- `startCode:` *`string`* (**required**)
  - Code that'll be inserted on top of user created script.
  - Global variables such as `$homepage`, `$version`, `$date` can be used using [parameter substitution](./templating.md#parameter-substitution) code syntax such as `Welcome to {{ $homepage }}!`
- `endCode:` *`string`* (**required**)
  - Code that'll be inserted at the end of user created script.
  - Global variables such as `$homepage`, `$version`, `$date` can be used using [parameter substitution](./templating.md#parameter-substitution) code syntax such as `Welcome to {{ $homepage }}!`
