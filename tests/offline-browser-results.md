# Offline browser verification

Tested the fictional two-service dashboard on Windows before deployment. Chrome 157.0.8103.79 and Edge 158.0.4370.33 opened `docs/index.html` directly from disk with networking emulated offline. Both headless runs used temporary profiles and disabled the inner browser sandbox to accommodate the test environment.

| Check | Observed in both browsers |
|---|---|
| Local dependencies | The dashboard initialized and handled both modes with zero HTTP requests, page exceptions or console errors. |
| Responsive layout | At 320, 390 and 768 pixels the dashboard used one column. At 1280 pixels it used two. No horizontal page overflow at these widths. |
| Single simulation | With 10 minutes of imposed delay, a five-minute buffer and zero random entry delay, B entered the waiting state and finished with 5.00 minutes of wait. Pause froze the clock, Start resumed it, and Reset returned it to 00:00. Playback ran at 4×. |
| Monte Carlo | With seed 42, 50,000 trials, five-minute mean entry delay, zero imposed delay, zero buffer and fixed durations, mean wait was 2.48 minutes with a displayed 95% interval of 2.44–2.51 minutes. Sampling paused and resumed. Five histogram bins rendered. |
| Verification button | The dedicated benchmark reported 2.4752 minutes against the 2.5000-minute reference and displayed PASS. |

These checks cover the local dashboard in the two listed browsers. A hosted URL needs its own check after deployment.
