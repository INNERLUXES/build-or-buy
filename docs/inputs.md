# Scenario inputs

A scenario is a JSON file. Amounts are in one currency; `currency` is only a label.

| Field | Required | Meaning |
|---|---|---|
| `name` | no | Shown at the top of the report |
| `currency` | no | Three-letter code, for example `USD` |
| `years` | yes | Horizon, 1 to 30 |
| `discountRate` | no | Yearly rate for present value, 0 to 1. Leave out for plain sums |
| `users.start` | yes | People using the software in year 1 |
| `users.growthPerYear` | no | Share added each year, `0.2` for 20%. Negative for shrinking use |
| `custom.build` | yes | The quoted price of the build |
| `custom.buildMonths` | yes | Months until the software can be used, 0 if it replaces nothing. See the bridge in [model.md](model.md) |
| `custom.hostingPerYear` | yes | Cloud hosting, monitoring and backups |
| `custom.supportPerYear` | one of two | Support, security updates and small changes per year |
| `custom.supportRate` | one of two | The same as a share of the build, `0.15` for 15% |
| `offTheShelf.setup` | yes | One-time setup, configuration and data import |
| `offTheShelf.pricePerUserPerMonth` | yes | Licence or subscription price per user |
| `offTheShelf.priceIncreasePerYear` | no | Yearly price rise, `0.05` for 5% |
| `offTheShelf.minimumSeats` | no | Seats paid for even when fewer people use it |
| `offTheShelf.integrationBuild` | no | One-time cost of connecting the product to your other systems |
| `offTheShelf.integrationPerYear` | no | Keeping those connections working |
| `offTheShelf.workaroundHoursPerUserPerMonth` | no | Hours each user loses working around the product. Needs `hourlyCost` |
| `offTheShelf.hourlyCost` | no | Loaded cost of one hour of that person's time |

## Where the numbers come from

- `custom.build`, `buildMonths`, `supportPerYear`: from a written quote for your scope. A quote that covers only the build leaves support out; ask for both.
- `hostingPerYear`: from the cloud provider's price calculator for the planned architecture, or from the quote.
- `pricePerUserPerMonth`, `minimumSeats`, `priceIncreasePerYear`: from the vendor's order form and the renewal terms, not the list price on the website.
- `workaroundHoursPerUserPerMonth`: ask the people who do the work, or time the task once. Leave it at zero rather than guess.

Every example in `examples/` says in its name that its figures are example inputs. They show the shape of a scenario and are not prices.
