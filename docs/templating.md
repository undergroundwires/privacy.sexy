# Templating

## Benefits of templating

- Generating scripts by sharing code to increase best-practice usage and maintainability.
- Creating self-contained scripts without depending on each other that can be easily shared.
- Use of pipes for writing cleaner code and letting pipes do dirty work.

## Expressions

- Expressions in the language are defined inside mustaches (double brackets, `{{` and `}}`).
- Expression syntax is inspired mainly by [Go Templates](https://pkg.go.dev/text/template).

## Syntax

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

- Skips the block if the variable is absent or empty.
- Binds its context (`.`) value of provided argument for the parameter if provided one.
- A block is defined as `{{ with $parameterName }} Parameter value is {{ . }} here {{ end }}`.
- The parameters used for `with` condition should be declared as optional, otherwise `with` block becomes redundant.
- Example:

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

- Pipes are set of functions available for handling text in privacy.sexy.
- Allows stacking actions one after another also known as "chaining".
- Just like [Unix pipelines](https://en.wikipedia.org/wiki/Pipeline_(Unix)), the concept is simple: each pipeline's output becomes the input of the following pipe.
- Pipes are provided and defined by the compiler and consumed by collection files.
- Pipes can be combined with [parameter substitution](#parameter-substitution) and [with](#with).
- ❗ Pipe names must be camelCase without any space or special characters.
- **Existing pipes**
  - `inlinePowerShell`: Converts a multi-lined PowerShell script to a single line.
  - `escapeDoubleQuotes`: Escapes `"` characters to be used inside double quotes (`"`)
- **Example usages**
  - `{{ with $code }} echo "{{ . | inlinePowerShell }}" {{ end }}`
  - `{{ with $code }} echo "{{ . | inlinePowerShell | escapeDoubleQuotes }}" {{ end }}`
