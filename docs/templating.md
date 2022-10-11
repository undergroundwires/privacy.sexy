# Templating

## Benefits of templating

- Generating scripts by sharing code to increase best-practice usage and maintainability.
- Creating self-contained scripts without cross-dependencies.
- Use of pipes for writing cleaner code and letting pipes do dirty work.

## Expressions

- Expressions start and end with mustaches (double brackets, `{{` and `}}`).
  - E.g. `Hello {{ $name }} !`
- Syntax is close to [Go Templates ❤️](https://pkg.go.dev/text/template) but not the same.
- Functions enables usage of expressions.
  - In script definition parts of a function, see [`Function`](./collection-files.md#Function).
  - When doing a call as argument values, see [`FunctionCall`](./collection-files.md#Function).
- Expressions inside expressions (nested templates) are supported.
  - An expression can output another expression that will also be compiled.
  - E.g. following would compile first [with expression](#with), and then [parameter substitution](#parameter-substitution) in its output.

    ```go
      {{ with $condition }}
        echo {{ $text }}
      {{ end }}
    ```

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

Skips its "block" if the variable is absent or empty. Its "block" is between `with` start (`{{ with .. }}`) and end (`{{ end }`}) expressions.
E.g. `{{ with $parameterName }} Hi, I'm a block! {{ end }}` would only output `Hi, I'm a block!` if `parameterName` has any value..

It binds its context (value of the provided parameter value) as arbitrary `.` value. It allows you to use the argument value of the given parameter when it is provided and not empty such as:

```go
  {{ with $parameterName }}Parameter value is {{ . }} here {{ end }}
```

It supports multiline text inside the block. You can have something like:

```go
  {{ with $argument }}
    First line
    Second line
  {{ end }}
```

You can also use other expressions inside its block, such as [parameter substitution](#parameter-substitution):

```go
  {{ with $condition }}
    This is a different parameter: {{ $text }}
  {{ end }}
```

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
