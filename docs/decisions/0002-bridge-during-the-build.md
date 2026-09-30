# 2. Count what the business pays while custom is being built

## Context

A comparison that starts the custom running costs on day one of the build makes custom look cheaper than it is: for the months of the build, the business still runs on what it has today and pays for it.

## Decision

- `custom.buildMonths` says how long the build takes. For those months the custom column carries the off-the-shelf running cost (licences, integration, workaround time) instead of hosting and support.
- The bridge is shown as its own column in the CSV output, so it can be checked or removed.

## Consequences

- When the business uses something cheaper than the off-the-shelf product during the build, the bridge overstates the cost of custom. docs/model.md says how to model that case: set `buildMonths` to 0 and add the real cost to `build`.
- A long build moves the break-even year later, which is the point.
