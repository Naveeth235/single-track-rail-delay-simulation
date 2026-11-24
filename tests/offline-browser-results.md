# Offline browser verification

## Three-train corridor

The final browser checks exercised both modes at desktop and mobile widths (1440 and 390 pixels). With fixed inputs, C reached its destination at 11:31 under both the zero- and 15-minute buffers. Its arrival lateness fell from 25 to 10 minutes. The default Monte Carlo experiment put all 1,000 trials above 30 extra train-minutes. Enabling random entry delays produced a different mean. Pause, resume, reset and both verification checks passed.

Chrome and Edge loaded the corridor dashboard directly from disk with networking disabled. Both passed layout checks at 320, 390, 768 and 1280 pixels. Playback showed B waiting at Gampola, paused and resumed, and reported 50 additional train-minutes for B and C in the zero-buffer hand calculation. The deterministic 15-minute buffer produced 20 train-minutes. Both the corridor hand checks and the independent analytical check passed.

Against the Python notebook engine, the JavaScript implementation matched all six departures, arrivals and conflict waits in each of 120 cases within 1e-9 minutes. The cases included the four hand-check buffers and seeded random delays and running times. Comparing identical sampled inputs avoids dependence on the languages' different random number generators.

## Earlier two-service prototype

Tested the fictional two-service dashboard on Windows before deployment. Chrome 157.0.8103.79 and Edge 158.0.4370.33 opened `docs/index.html` directly from disk with networking emulated offline. Both headless runs used temporary profiles and disabled the inner browser sandbox to accommodate the test environment.

| Check | Observed in both browsers |
|---|---|
| Local dependencies | The dashboard initialized and handled both modes with zero HTTP requests, page exceptions or console errors. |
| Responsive layout | At 320, 390 and 768 pixels the dashboard used one column. At 1280 pixels it used two. No horizontal page overflow at these widths. |
| Single simulation | With 10 minutes of imposed delay, a five-minute buffer and zero random entry delay, B entered the waiting state and finished with 5.00 minutes of wait. Pause froze the clock, Start resumed it, and Reset returned it to 00:00. Playback ran at 4×. |
| Monte Carlo | With seed 42, 50,000 trials, five-minute mean entry delay, zero imposed delay, zero buffer and fixed durations, mean wait was 2.48 minutes with a displayed 95% interval of 2.44–2.51 minutes. Sampling paused and resumed. Five histogram bins rendered. |
| Verification button | The dedicated benchmark reported 2.4752 minutes against the 2.5000-minute reference and displayed PASS. |

These checks cover the local dashboard in the two listed browsers. A hosted URL needs its own check after deployment.
