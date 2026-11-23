# How the delay model works

## Three trains and two blocks

Peradeniya Junction and Nawalapitiya are the endpoints. Gampola is the crossing station and can accommodate two trains. A and C start at Peradeniya Junction. B starts at Nawalapitiya. The notebook groups intermediate stops into two single-track blocks and uses this fixed order on each.

| Block | Order of use | Running time towards Nawalapitiya | Running time towards Peradeniya |
|---|---|---:|---:|
| Peradeniya Junction–Gampola | A, B, C | 21 min | 18 min |
| Gampola–Nawalapitiya | B, A, C | 25 min | 27 min |

Each block holds one train. Trains dwell at Gampola for at least two minutes. A train can enter a block at the instant its previous occupant releases it. The timetable and priority order are fixed for each run. [Baseline timetable and sources](data/README.md)

## Departure, arrival and conflict waiting

All times below are in minutes on the same clock. For a train’s first leg, its ready time $R$ is its scheduled departure plus its sampled entry delay. The disrupted run also adds the imposed delay to A. For its second leg, $R$ is the later of the scheduled departure and the first leg’s arrival plus two minutes.

If the block becomes free at $F$ and the leg takes $T$ minutes, the model computes

$$
D=\max(R,F), \qquad A_{\mathrm{arr}}=D+T, \qquad W=D-R.
$$

Here $D$ is actual departure, $A_{\mathrm{arr}}$ is arrival and $W$ is conflict waiting. A late entry changes the ready time. Waiting starts only when a ready train must hold for the track. Final-arrival lateness is a separate measure: actual destination arrival minus scheduled arrival under the selected buffer.

The Python notebook processes events in time order, releasing a block before a departure at the same time. The browser computes the six movements in an order that respects each train’s route and each block’s priority. Both use the same movement constraints.

## Why a 25-minute disruption produces 50 train-minutes

With zero buffer and fixed inputs, A reaches Gampola at 10:25. B was ready to leave Gampola at 10:00 and waits 25 minutes. B then reaches Peradeniya Junction at 10:43. C was ready at 10:18 and also waits 25 minutes. Their total additional wait is 50 train-minutes.

A buffer of $b$ minutes shifts B’s scheduled departure from Gampola and C’s schedule later by $b$. For this hand check the combined additional wait is $2\max(25-b,0)$. A 15-minute buffer saves 30 train-minutes of waiting and moves C’s scheduled finish 15 minutes later.

## Random trials and uncertainty

Each train draws an independent exponential entry delay with the selected mean. Each leg independently draws a duration uniformly between $T_0(1-r)$ and $T_0(1+r)$, where $T_0$ is its nominal time and $r$ is the variation expressed as a fraction. A zero setting fixes the corresponding input.

For each trial, run the timetable twice using identical draws. Let $W_{BC}$ be the total conflict waiting over all four legs of B and C. The trial outcome in train-minutes is

$$
Y=W_{BC,\mathrm{disrupted}}-W_{BC,\mathrm{background}}.
$$

Across $N$ independent trials, report the sample mean $\bar Y$ and the approximate 95% interval $\bar Y \pm 1.96s_Y/\sqrt N$, where $s_Y$ is the sample standard deviation. For buffer savings, calculate the difference within each matched trial before averaging. The notebook also estimates the probability that $Y>30$ using the observed fraction and a Wilson interval. These intervals describe simulation sampling uncertainty under the chosen inputs.

## Verification and experiments

| Check | Expected | Observed |
|---|---|---|
| Corridor hand calculation, buffers 0, 5, 10, 15 min | 50, 40, 30, 20 train-min | All four values reproduced |
| Independent two-service queue at zero planned gap | Mean wait 2.5 min | Browser 2.4752 min, absolute error 0.0248 min within the 0.0775 min tolerance |
| Monte Carlo error scaling | RMSE proportional to $N^{-1/2}$ | Fitted log–log slope −0.526 across 60 batches at each sample size |
| Physical consistency | Valid movement order and exclusive block occupancy | Notebook checks passed over 24,000 scenario runs |
| Random running times | Zero variation recovers the fixed-duration case | Notebook compares fixed and variable durations using matched inputs |

The independent queue uses two exponential entry delays with equal mean $\mu$ and fixed service duration. At planned gap $g$, its expected waiting time is $(\mu/2)e^{-g/\mu}$. Setting $\mu=5$ and $g=0$ gives 2.5 minutes. At zero gap the theoretical variance is 18.75 minutes squared. The browser accepts absolute error up to four theoretical standard errors, $4\sqrt{18.75/50000}$. The corridor hand calculation separately verifies the three-train model.

The notebook varies the crossing buffer, mean entry delay and running-time variation. These experiments link discrete-event resource constraints to random sampling and Monte Carlo estimation. Published schedules ground the running times. Measuring predictive accuracy would require observed train movements. [Convergence figure](figures/monte-carlo-convergence.png) · [Buffer sensitivity](figures/corridor-buffer-effects.png) · [Running-time sensitivity](figures/corridor-running-time-effects.png)
