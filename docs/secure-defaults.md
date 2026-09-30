# Secure defaults

What the tool does when an input is left out, and why.

| Input left out | What the tool does | Why |
|---|---|---|
| Any price or cost (`build`, `hostingPerYear`, `setup`, `pricePerUserPerMonth`, support), or `buildMonths` | Stops with an error | A default price would decide the answer without anyone choosing it. A build time of zero would hide what the business pays while it waits. |
| `discountRate` | Plain sums, no discounting | The simplest reading. It is the one default that favours custom, because the cost of custom comes first and later licence payments are not discounted. Add the rate your finance team uses. |
| `users.growthPerYear` | No growth | Growth favours custom; leaving it out never flatters custom. |
| `priceIncreasePerYear` | No price rise | Rises favour custom; same reason. |
| `workaroundHoursPerUserPerMonth` | Zero | The hardest input to know. It stays out unless someone measures it. |
| `--output` | Prints to the terminal | Nothing is written to disk unless asked. |

Apart from the discount rate, the defaults lean towards off-the-shelf. When the result still favours custom with a discount rate set and every other optional input left out, the case does not rest on estimates of growth, price rises or lost time.
