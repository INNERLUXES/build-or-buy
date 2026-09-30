# Security

## Reporting a problem

Write to info@innerluxes.dev with the subject line "build-or-buy security", or use private vulnerability reporting on this repository. Please do not open a public issue for a vulnerability.

Include the scenario file that shows the problem (made-up figures are best), what you expected and what happened.

## Scope

In scope:

- a scenario that passes validation but produces a wrong number
- a scenario that makes the tool hang or use unbounded memory
- anything that makes the tool read or write a file it was not given, or open a network connection

Out of scope: a result you disagree with because of what the model leaves out. docs/limits.md lists those; open a normal issue if you think one belongs in the model.

## What this tool assumes

- The scenario file comes from the person running the tool.
- The inputs are true. The tool checks that they are well-formed, not that they are right.

Read [docs/threat-model.md](docs/threat-model.md) for the rest.
