# Threat model

The tool reads a JSON file written by a person and prints numbers that may be used to spend money. The main risk is not an attacker; it is a wrong number that looks right. This page lists what could go wrong and what the tool does about it.

| Threat | Response |
|---|---|
| A missing input is silently filled with a default price and decides the answer | Every price is required. A missing one stops the run with a list of every missing field. Defaults exist only for neutral values: no growth, no discount, no price rise, no workaround time. |
| A typo such as a string instead of a number, or a rate of 15 instead of 0.15 | Every field is type-checked and range-checked. Rates are limited to sensible bounds and the error names the field. |
| Example figures are copied into a real decision as if they were prices | Every example says in its name that its figures are example inputs; a repository check fails the build if one does not. The README says the same. |
| A formula changes and old results no longer match | Every formula is written out in docs/model.md and pinned by tests worked out by hand. CODEOWNERS asks for a maintainer review on the model and the input rules. |
| A crafted scenario file makes the tool hang | Years are capped at 30. The only search, users to break even, is a bisection with a fixed upper bound. |
| The report is mistaken for a recommendation | The verdict states a cost difference and a break-even year, nothing more. docs/limits.md lists what the model leaves out. |
| The tool sends the scenario somewhere | It opens no network connection and writes a file only when `--output` is given. |

## Outside this model

- Whether the inputs are true. The tool can only check that they are well-formed.
- A compromised Node runtime or a modified copy of the tool. Install from a release and check the attestation and checksums.
