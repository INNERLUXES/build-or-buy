# The cost model

Every figure the tool prints comes from these formulas and the numbers in the scenario file. There is no built-in price.

## Years

Year 0 holds the one-time costs. Years 1 to N hold the running costs. N is `years` in the scenario.

Users in year `y` (from 1):

```
users(y) = max(1, round(users.start × (1 + users.growthPerYear)^(y − 1)))
```

## Off-the-shelf

```
year 0 = setup + integrationBuild

seats(y)     = max(users(y), minimumSeats)
price(y)     = pricePerUserPerMonth × (1 + priceIncreasePerYear)^(y − 1)
licences(y)  = seats(y) × price(y) × 12
workaround(y) = users(y) × workaroundHoursPerUserPerMonth × hourlyCost × 12
year y       = licences(y) + integrationPerYear + workaround(y)
```

`workaround` is the time people spend working around a product that does not fit the process: exporting to a spreadsheet, retyping between two tools, waiting for a report. Leave it out when the product fits.

## Custom

```
year 0 = build

support per year = supportPerYear, or build × supportRate
```

While the software is being built (`buildMonths`), it cannot be used, so the business keeps paying for what it runs today. The model counts that as the off-the-shelf running cost for those months:

```
bridge months in year y = clamp(buildMonths − 12 × (y − 1), 0, 12)
live share in year y    = (12 − bridge months) / 12

year y = (hostingPerYear + support per year) × live share
         + off-the-shelf year y × bridge months / 12
```

If the business uses something cheaper than the off-the-shelf product during the build, the bridge overstates the cost of custom. Set `buildMonths` to 0 and add the real cost to `build` instead.

## Present value

With a `discountRate` `r`, each year's cost is divided by `(1 + r)^y`. Year 0 is not discounted. The verdict ("custom costs X less") uses present values; the cumulative columns are plain sums.

## Break-even

The first year after which the cumulative cost of custom stays at or below the cumulative cost of off-the-shelf until the end of the horizon, with the crossing placed linearly inside that year. A crossing that is later undone does not count. `null` when custom never catches up inside the horizon.

## Sensitivity

Each input in the list is moved down and up by the same share (20% by default) while every other input stays. The table shows the present-value difference at both ends, largest swing first. Inputs that are zero in the scenario are skipped.

## Users to break even

The smallest starting user count at which custom costs less over the horizon, found by bisection between 1 and 1,000,000. The difference grows with users, because licences grow with users and the running cost of custom does not.
