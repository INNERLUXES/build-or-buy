# 1. No built-in prices

## Context

Build-or-buy calculators on vendor websites usually come with prices filled in: an hourly rate, a typical build cost, a typical licence. Whoever fills them in decides the answer, and the reader rarely sees how.

## Decision

- The tool has no price, rate or cost of its own. Every amount comes from the scenario file.
- Optional inputs default to the value that does not favour custom software: no growth, no price rise, no time lost to workarounds, no minimum seats, no integration cost. The build time has no default. The one exception is the discount rate, which defaults to none; docs/secure-defaults.md says so.
- The examples carry figures so that they run, and each one says in its name that the figures are example inputs. A repository check enforces that.

## Consequences

- A result is only as good as the quotes behind it. The README and docs/inputs.md say where each number should come from.
- The tool cannot answer "roughly how much would custom cost?". That question needs a scope, and a scope is outside this tool.
