# How to use Railway Delay Simulator

Open `docs/index.html` from the extracted project or visit the [GitHub Pages demo](https://naveeth235.github.io/single-track-rail-delay-simulation/).

## Follow one crossing

1. Select **Single simulation**, keep the defaults and press **Start**. A and C travel from left to right. B travels from right to left. Gampola, in the middle, has space for two trains to cross.
2. Watch B reach Gampola and wait for A to clear the track towards Peradeniya Junction. C waits at Peradeniya Junction until B arrives and releases that same track. The block labels show which train occupies each segment.
3. At the end, read the destination arrival times and combined extra waiting. B and C each incur 25 extra minutes, giving **50 train-minutes**. Set the buffer to 15 and run again. Their combined extra wait falls to **20 train-minutes**.

## Controls

| Control | Range and default | What it changes |
|---|---|---|
| Experiment mode | Single simulation (default) or Monte Carlo | Watch one journey or sample many paired timetables. |
| Train A disruption | 0–40 min, default 25 | Adds a fixed entry delay to A in the disrupted timetable. |
| Buffer | 0–15 min, default 0 | Moves B’s scheduled departure from Gampola and C’s schedule later, giving A more time to clear the crossing. |
| Mean entry delay | 0–10 min, default 0 | Mean of the independent exponential entry delays for A, B and C. Zero disables them. |
| Segment running-time variation | 0–30%, default 0% | Each leg varies uniformly within the selected percentage of its usual duration. |
| Monte Carlo replications | 100–50,000, default 1,000 | Number of paired comparisons in an experiment. |
| Random seed | 1–4,294,967,295, default 42 | Repeat the same settings and seed to reproduce the browser result. |
| Start / Pause / Reset | Both modes | Start begins or resumes. Pause holds the current position or trial count. Reset clears progress. Changing a model input also resets the run. |
| Playback speed | 1×, 2× or 4×, default 1× | Changes how quickly the single journey is shown. |

## Read a Monte Carlo result

Select **Monte Carlo experiment**. First keep the default model inputs and press **Start**. All 1,000 trials yield 50 train-minutes because both random inputs are zero. The confidence interval reads **50.00–50.00** and the **>20** bar contains every trial.

Then set **Mean entry delay** to **5 minutes** and start again. In each trial the model samples background delays and uses them twice, once with A’s imposed disruption and once without. This measures how much additional waiting A caused under those particular conditions.

| Output | How to read it |
|---|---|
| Mean extra B + C waiting | Average additional conflict waiting summed over the two trains, in train-minutes per trial. |
| 95% confidence interval | Approximate sampling uncertainty in the estimated **mean**. Individual trials can fall outside it. |
| Completed replications | Number of timetable pairs included so far. |
| Waiting time distribution | Percentage of trials in each range. Zero has its own bar. Each positive range includes its upper endpoint. |

## Verify the numbers

Press **Run verification**. The separate two-service queue uses 50,000 trials and seed 42. Its simulated mean is about **2.4752 min**, within **0.0775 min** of the theoretical **2.5000 min**. The button also checks corridor waits of **50, 40, 30 and 20 train-minutes** at buffers of 0, 5, 10 and 15 minutes, with tolerance **10⁻⁹ train-minutes**. These tests use fixed settings, so moving a dashboard slider changes your experiment while the reference values stay the same.

The constructed timetable illustrates delay propagation. The notebook also examines final-arrival lateness, large-delay risk and convergence. [Model details](THEORY.md)
