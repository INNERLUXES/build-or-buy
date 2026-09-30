# build-or-buy

Compares the total cost of building custom software with renting an off-the-shelf product, year by year.

It answers the questions that come up in every build-or-buy discussion: what does each option cost over five years, in which year does custom catch up, from how many users does custom cost less, and which of our estimates actually decides the answer?

Plain JavaScript, no dependencies. **The tool has no prices of its own.** Every amount comes from a scenario file you write from real quotes; a missing price is an error, never a default.

```
npm test
```

```
# tests 34
# pass 34
# fail 0
```

## Try it

Requires Node 22 or newer. There is nothing to install.

```
git clone https://github.com/INNERLUXES/build-or-buy.git
cd build-or-buy
node bin/build-or-buy.js examples/internal-operations-tool.json --break-even-users
```

```
Internal operations tool (example inputs, replace with your own quotes) (USD)

Year     Users          Custom    Off-the-shelf    Custom, total   Off-the-shelf, total
0            -         120,000           35,000          120,000                 35,000
1           60          41,333           76,000          161,333                111,000
2           69          24,000           89,491          185,333                200,491
3           79          24,000          105,116          209,333                305,607
4           91          24,000          124,388          233,333                429,995
5          105          24,000          147,650          257,333                577,645
```

Year 0 holds the one-time costs. In year 1 the custom column is higher than later years because the software is still being built for four months, and the business keeps paying for what it uses today.

The figures in `examples/` are example inputs that show the shape of a scenario. They are not prices.

## A scenario

```json
{
  "name": "Order desk",
  "currency": "USD",
  "years": 5,
  "discountRate": 0.08,
  "users": { "start": 40, "growthPerYear": 0.1 },
  "custom": { "build": 0, "buildMonths": 0, "hostingPerYear": 0, "supportRate": 0 },
  "offTheShelf": { "setup": 0, "pricePerUserPerMonth": 0, "priceIncreasePerYear": 0 }
}
```

Replace every zero with a figure from a quote. [docs/inputs.md](docs/inputs.md) lists every field and where its value should come from: the build and support from a written quote for your scope, hosting from the cloud provider's calculator, licence prices from the vendor's order form and renewal terms rather than the list price.

## Options

| Option | What it does |
|---|---|
| `--format text\|markdown\|csv\|json` | Text for a terminal, Markdown for a document, CSV for a spreadsheet, JSON for your own scripts |
| `--output <file>` | Write the report to a file |
| `--years <n>` | Override the horizon |
| `--discount <rate>` | Override the discount rate, for example `0.08` |
| `--sensitivity` | Move each input 20% down and up and rank them by how far they move the answer |
| `--break-even-users` | The smallest starting user count at which custom costs less |

Exit codes: 0 done, 2 wrong usage or an invalid scenario.

## What is counted

| Custom software | Off-the-shelf product |
|---|---|
| The build | Setup, configuration and data import |
| Hosting, monitoring and backups | Licences per seat, with a minimum seat count |
| Support: a yearly figure or a share of the build | Yearly price rises |
| What the business keeps paying for during the build | Integration with your other systems, one-time and yearly |
| | Time people lose working around a product that does not fit |

Every formula is in [docs/model.md](docs/model.md). What the model leaves out (fit, risk, exit cost, tax treatment, your own staff time) is in [docs/limits.md](docs/limits.md). Read the result next to that list.

## As a library

```js
import { readFile } from 'node:fs/promises';
import { parseScenario, compare, sensitivity, usersToBreakEven, toMarkdown } from './src/index.js';

const scenario = parseScenario(JSON.parse(await readFile('scenario.json', 'utf8')));
const result = compare(scenario);
console.log(result.breakEven, result.totals.difference);
console.log(toMarkdown(result));
```

## How this repository is kept

- No runtime dependencies, a committed lock file, `npm ci` in the pipeline.
- Tests on Linux, Windows and macOS with Node 22 and 24, CodeQL, and repository checks for syntax, exports, credentials, leftovers and example labels.
- Every workflow sets its token permissions and pins every action to a full commit hash; Dependabot keeps them current.
- The pipeline checks the repository against NIST SP 800-218 with [ssdf-repo-check](https://github.com/INNERLUXES/ssdf-repo-check).
- Releases come with a CycloneDX SBOM, SHA-256 checksums and a build provenance attestation.
- [SECURITY.md](SECURITY.md), [threat model](docs/threat-model.md), [secure defaults](docs/secure-defaults.md), [design decisions](docs/decisions).

## Related

Built by the [custom software development team at INNERLUXES](https://innerluxes.dev/software-development/custom), where the same comparison is part of deciding whether a client should build at all.

## License

MIT
