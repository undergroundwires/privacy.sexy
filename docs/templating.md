# Templating

## Benefits of templating

- **Code sharing:** Share code across scripts for consistent practices and easier maintenance.
- **Script independence:** Generate self-contained scripts, eliminating the need for external code.
- **Cleaner code:** Use pipes for complex operations, resulting in more readable and streamlined code.

## Expressions

**Syntax:**

Expressions are enclosed within `{{` and `}}`.
Example: `Hello {{ $name }}!`.
They are a core component of templating, enhancing scripts with dynamic capabilities and functionality.

**Syntax similarity:**

The syntax shares similarities with [Go Templates ❤️](https://pkg.go.dev/text/template), but with some differences:

**Function definitions:**

You can use expressions in function definition.
Refer to [Function](./collection-files.md#function) for more details.

Example usage:

```yaml
  name: GreetFunction
  parameters:
    - name: name
  code: Hello {{ $name }}!
```

If you assign `name` the value `world`, invoking `GreetFunction` would result in `Hello world!`.

**Function arguments:**

You can also use expressions in arguments in nested function calls.
Refer to [`Function | collection-files.md`](./collection-files.md#functioncall) for more details.

Example with nested function calls:

```yaml
-
  name: PrintMessageFunction
  parameters:
    - name: message
  code: echo "{{ $message }}"
-
  name: GreetUserFunction
  parameters:
    - name: userName
  call:
    name: PrintMessageFunction
    parameters:
      argument: 'Hello, {{ $userName }}!'
```

Here, if `userName` is `Alice`, invoking `GreetUserFunction` would execute `echo "Hello, Alice!"`.

**Nested templates:**

You can nest expressions inside expressions (also called "nested templates").
This means that an expression can output another expression where compiler will compile both.

For example, following would compile first [with expression](#with), and then [parameter substitution](#parameter-substitution) in its output:

```go
  {{ with $condition }}
    echo {{ $text }}
  {{ end }}
```

### Parameter substitution

Parameter substitution dynamically replaces variable references with their corresponding values in the script.

**Example function:**

```yaml
  name: DisplayTextFunction
  parameters:
    - name: 'text'
  code: echo {{ $text }}
```

Invoking `DisplayTextFunction` with `text` set to `"Hello, world!"` would result in `echo "Hello, World!"`.

### with

The `with` expression enables conditional rendering and provides a context variable for simpler code.

**Optional block rendering:**

If the provided variable is falsy (`false`, `null`, or empty), the compiler skips the enclosed block of code.
A "block" lies between the with start (`{{ with .. }}`) and end (`{{ end }}`) expressions, defining its boundaries.

Example:

```go
{{ with $optionalVariable }}
  Hello
{{ end }}
```

This would display `Hello` if `$optionalVariable` is truthy.

**Parameter declaration:**

You should set `optional: true` for the argument if you use it like `{{ with $argument }} .. {{ end }}`.

Declare parameters used for `with` condition as optional such as:

```yaml
name: ConditionalOutputFunction
parameters:
  - name: 'data'
    optional: true
code: |- 
  {{ with $data }}
    Data is: {{ . }}
  {{ end }}
```

**Context variable:**

`with` statement binds its context (value of the provided parameter value) as arbitrary `.` value.
`{{ . }}` syntax gives you access to the context variable.
This is optional to use, and not required to use `with` expressions.

For example:

```go
  {{ with $parameterName }}Parameter value is {{ . }} here {{ end }}
```

**Multiline text:**

It supports multiline text inside the block. You can write something like:

```go
  {{ with $argument }}
    First line
    Second line
  {{ end }}
```

**Inner expressions:**

You can also embed other expressions inside its block, such as [parameter substitution](#parameter-substitution):

```go
  {{ with $condition }}
    This is a different parameter: {{ $text }}
  {{ end }}
```

This also includes nesting `with` statements:

```go
  {{ with $condition1 }}
    Value of $condition1: {{ . }}
    {{ with $condition2 }}
      Value of $condition2: {{ . }}
    {{ end }}
  {{ end }}
```

### Pipes

Pipes are functions designed for text manipulation.
They allow for a sequential application of operations resembling [Unix pipelines](https://en.wikipedia.org/wiki/Pipeline_(Unix)), also known as "chaining".
Each pipeline's output becomes the input of the following pipe.

**Pre-defined**:

Pipes are pre-defined by the system.
You cannot create pipes in [collection files](./collection-files.md).
[A dedicated compiler](./application.md#loading-parsing-and-compiling) provides pre-defined pipes to consume in collection files.

**Compatibility:**

You can combine pipes with other expressions such as [parameter substitution](#parameter-substitution) and [with](#with) syntax.

For example:

```go
{{ with $script }} echo "{{ . | inlinePowerShell | escapeDoubleQuotes }}" {{ end }}
```

**Naming:**

❗ Pipe names must be camelCase without any space or special characters.

**Available pipes:**

- `inlinePowerShell`: Converts a multi-lined PowerShell script to a single line.
- `escapeDoubleQuotes`: Escapes `"` characters for batch command execution, allows you to use them inside double quotes (`"`).
