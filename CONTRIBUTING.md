# Contributing

Every change goes through a pull request and is reviewed before it is merged. The pipeline runs the tests on Linux, Windows and macOS, the repository checks, CodeQL, and a secure development check of the repository itself.

## Changing the model

1. Write the new formula in docs/model.md first, in the same plain notation as the others.
2. Add a test worked out by hand: small numbers, the expected result written in the test, and a comment that shows the arithmetic.
3. A new input needs a line in docs/inputs.md that says where its value should come from.
4. A new input must not get a default price. If it is optional, its default must not favour custom software; if it has to, say so in docs/secure-defaults.md.

## Rules for the code

- No runtime dependencies. Node 22 or newer and nothing else.
- The tool reads the scenario file and writes only when `--output` is given. No network.
- Examples say in their name that their figures are example inputs.

## Before you open the pull request

```
npm test
npm run check
npm run example:operations
```
