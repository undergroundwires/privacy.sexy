# Templating

## Benefits of templating

- Generating scripts by sharing code to increase best-practice usage and maintainability.
- Creating self-contained scripts without cross-dependencies.
- Use of pipes for writing cleaner code and letting pipes do dirty work.

## Expressions

- Expressions start and end with mustaches (double brackets, `{{` and `}}`).
  - E.g. `Hello {{ $name }} !`
- Syntax is close to [Go Templates ❤️](https://pkg.go.dev/text/template) that has inspired this templating language.
- Functions enables usage of expressions.
  - In script definition parts of a function, see [`Function`](./collection-files.md#Function).
  - When doing a call as argument values, see [`FunctionCall`](./collection-files.md#Function).

### Parameter substitution

A simple function example:

```yaml
  function: EchoArgument
  parameters:
    - name: 'argument'
  code: Hello {{ $argument }} !
```

It would print "Hello world" if it's called in a [script](./collection-files.md#script) as following:

```yaml
  script: Echo script
  call:
    function: EchoArgument
    parameters:
      argument: World
```

A function can call other functions such as:

```yaml
  - 
    function: CallerFunction
    parameters:
      - name: 'value'
    call:
      function: EchoArgument
      parameters:
        argument: {{ $value }}
  -
    function: EchoArgument
    parameters:
      - name: 'argument'
    code: Hello {{ $argument }} !
```

### with

Skips its "block" if the variable is absent or empty. Its "block" is between `with` start (`{{ with .. }}`) and end (`{{ end }`}) expressions. E.g. `{{ with $parameterName }} Hi, I'm a block! {{ end }}`.

Binds its context (`.`) value of provided argument for the parameter if provided one. E.g. `{{ with $parameterName }} Parameter value is {{ . }} here {{ end }}`.

💡 Declare parameters used for `with` condition as optional. Set `optional: true` for the argument if you use it like `{{ with $argument }} .. {{ end }}`.

Example:

```yaml
  function: FunctionThatOutputsConditionally
  parameters:
    - name: 'argument'
      optional: true
  code: |- 
    {{ with $argument }}
      Value is: {{ . }}
    {{ end }}
```

### Pipes

- Pipes are functions available for handling text.
- Allows stacking actions one after another also known as "chaining".
- Like [Unix pipelines](https://en.wikipedia.org/wiki/Pipeline_(Unix)), the concept is simple: each pipeline's output becomes the input of the following pipe.
- You cannot create pipes. [A dedicated compiler](./application.md#parsing-and-compiling) provides pre-defined pipes to consume in collection files.
- You can combine pipes with other expressions such as [parameter substitution](#parameter-substitution) and [with](#with) syntax.
- ❗ Pipe names must be camelCase without any space or special characters.
- **Existing pipes**
  - `inlinePowerShell`: Converts a multi-lined PowerShell script to a single line.
  - `escapeDoubleQuotes`: Escapes `"` characters, allows you to use them inside double quotes (`"`).
- **Example usages**
  - `{{ with $code }} echo "{{ . | inlinePowerShell }}" {{ end }}`
  - `{{ with $code }} echo "{{ . | inlinePowerShell | escapeDoubleQuotes }}" {{ end }}`
