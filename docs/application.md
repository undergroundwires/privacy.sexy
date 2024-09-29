# Application

Application layer is mainly responsible for:

- creating an event-based and mutable [application state](#application-state),
- [compiling](#compiling) the [application data](#application-data).

📖 Refer to [architecture.md | Layered Application](./architecture.md#layered-application) to read more about the layered architecture.

## Structure

Application layer code exists in [`/src/application`](./../src/application/) and includes following structure:

- [**`collections/`**](./../src/application/collections/): Holds [collection files](./collection-files.md).
- [**`Common/`**](./../src/application/Common/): Contains common functionality in application layer.
- `...`: rest of the application layer source code organized using folders-by-feature structure.

## Application state

It uses [state pattern](https://en.wikipedia.org/wiki/State_pattern) with context and state objects. [`ApplicationContext.ts`](./../src/application/Context/ApplicationContext.ts) the "Context" of state pattern provides an instance of [`CategoryCollectionState.ts`](./../src/application/Context/State/CategoryCollectionState.ts) (the "State" of the state pattern) for every supported collection.

Presentation layer uses a singleton (same instance of) [`ApplicationContext.ts`](./../src/application/Context/ApplicationContext.ts) throughout the application to ensure consistent state.

📖 Refer to [architecture.md | Application State](./architecture.md#application-state) to get an overview of event handling and [presentation.md | Application State](./presentation.md#application-state) for deeper look into how the presentation layer manages state.

## Application data

Application data is collection files using YAML. You can refer to [collection-files.md](./collection-files.md) to read more about the scheme and structure of application data files. You can also check the source code [collection yaml files](./../src/application/collections/) to directly see the application data using that scheme.

Application layer loads and [compiles](#compiling) application data into [`Application`](./../src/domain/Application.ts).
Once loaded, application layer provides the necessary functionality to presentation layer based on the application data.
You can read more about how presentation layer consumes the application data in [presentation.md | Application Data](./presentation.md#application-data).

Application layer enables [data-driven programming](https://en.wikipedia.org/wiki/Data-driven_programming) by leveraging the data to the rest of the source code. It makes it easy for community to contribute on the project by using a declarative language used in collection files.

### Compiling

Application layer loads the application data, compiles it, and makes it available as the domain object [`Application.ts`](./../src/domain/Application.ts).

The process looks like this:

1. *(Compile time)*
   The build tool loads (or injects) application data ([collection yaml files](./../src/application/collections/)) into the application layer in compile time.
   See [`PreloadedCollectionDataProvider.ts`](./../src/application/PreloadedCollectionDataProvider.ts)
2. *(Runtime)*
   Compiler compiles the data into a data transfer object (DTO).
   Compiler compiles templating syntax during parsing to create the end scripts
   See [`Compiler/`](./../src/application/Compiler/), [templating.md](./templating.md), [collection-files.md](./collection-files.md).
3. *(Runtime)*
   Application layer ([`ApplicationProvider.ts`](./../src/application/Loader/ApplicationProvider.ts)) provides this application object.

The steps to extend the templating syntax:

1. Add a new parser under [SyntaxParsers](./../src/application/Parser/Executable/Script/Compiler/Expressions/SyntaxParsers) where you can look at other parsers to understand more.
2. Register your in [CompositeExpressionParser](./../src/application/Parser/Executable/Script/Compiler/Expressions/Parser/CompositeExpressionParser.ts).
