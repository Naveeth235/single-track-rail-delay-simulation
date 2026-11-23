/* Playback of the independent fictional queue example. */
(function () {
  "use strict";
  const byId = id => document.getElementById(id);
  let example;
  let elapsed = 0;
  let frame = null;
  let previous = null;
  let settings, random, observations, target;

  function monteMode() {
    return byId("mode").value === "monte";
  }

  function renderStatistics() {
    const result = QueueStatistics.summarize(observations);
    byId("mean-result").textContent = result ? result.mean.toFixed(2) + " min" : "— min";
    byId("ci-result").textContent = result && observations.length > 1
      ? result.low.toFixed(2) + " – " + result.high.toFixed(2) : "— min";
    byId("replications-result").textContent = observations.length.toLocaleString();
    const chart = byId("histogram");
    chart.replaceChildren();
    if (!result) {
      chart.textContent = "Experiment results will appear here.";
      return;
    }
    for (const bin of QueueStatistics.histogram(observations)) {
      const row = document.createElement("div");
      row.className = "histogram-row";
      const label = document.createElement("span");
      label.textContent = bin.label;
      const track = document.createElement("div");
      track.className = "histogram-track";
      const bar = document.createElement("div");
      bar.className = "histogram-bar";
      const percentage = 100 * bin.count / observations.length;
      bar.style.width = percentage + "%";
      track.append(bar);
      const value = document.createElement("span");
      value.className = "histogram-value";
      value.textContent = percentage.toFixed(1) + "%";
      row.append(label, track, value);
      chart.append(row);
    }
  }

  function sampleBatch() {
    const limit = Math.min(target, observations.length + 500);
    while (observations.length < limit) {
      observations.push(QueueBenchmark.simulate(QueueBenchmark.sampleScenario(settings, random)).wait);
    }
    renderStatistics();
    if (observations.length >= target) {
      stop("Complete");
    } else {
      frame = requestAnimationFrame(sampleBatch);
    }
  }

  function resetExample() {
    stop("Ready to play");
    elapsed = 0;
    const seedInput = byId("seed");
    const seed = seedInput.valueAsNumber;
    if (!Number.isInteger(seed) || seed < 1 || seed > 4294967295) {
      seedInput.value = "42";
    }
    settings = {
      delay: Number(byId("delay").value),
      buffer: Number(byId("buffer").value),
      entryMean: Number(byId("entry").value),
      variation: Number(byId("variation").value) / 100
    };
    for (const id of ["delay", "buffer", "entry", "variation"]) {
      byId(id + "-value").textContent = byId(id).value + (id === "variation" ? "%" : " min");
    }
    random = QueueBenchmark.createRandom(Number(seedInput.value));
    example = QueueBenchmark.simulate(QueueBenchmark.sampleScenario(settings, random));
    random = QueueBenchmark.createRandom(Number(seedInput.value));
    observations = [];
    const runs = byId("runs");
    target = runs.valueAsNumber;
    if (!Number.isInteger(target) || target < 100 || target > 50000) {
      target = 1000;
      runs.value = String(target);
    }
    runs.disabled = !monteMode();
    byId("speed").disabled = monteMode();
    byId("single-view").hidden = monteMode();
    byId("rail-scene").hidden = monteMode();
    byId("clock-panel").hidden = monteMode();
    byId("mode-badge").textContent = monteMode() ? "Monte Carlo experiment" : "Single simulation";
    byId("single-result").textContent = monteMode() ? "Repeated sampling mode." : "Trial result pending.";
    renderStatistics();
    render();
  }

  function render() {
    const seconds = Math.floor(elapsed * 60);
    byId("elapsed").textContent = String(Math.floor(seconds / 60)).padStart(2, "0") +
      ":" + String(seconds % 60).padStart(2, "0");
    let occupied = null;
    for (const job of example.movements) {
      let state = "Pending";
      if (elapsed >= job.finish) {
        state = "Complete";
      } else if (elapsed >= job.start) {
        state = "In service";
        occupied = job.id;
      } else if (elapsed >= job.ready) {
        state = "Waiting";
      }
      byId("state-" + job.id).textContent = state;
      const progress = Math.max(0, Math.min(1, (elapsed - job.start) / job.duration));
      byId("progress-" + job.id).value = progress;
      // A starts ahead of B. Separate berths keep both visible at either end.
      const berth = job.id === "A" ? 24 : 8;
      byId("train-" + job.id).style.left = (berth + 68 * progress) + "%";
      const wait = Math.max(0, Math.min(job.wait, elapsed - job.ready));
      byId("wait-" + job.id).textContent = wait.toFixed(1) + " min waiting";
    }
    byId("resource-state").textContent = occupied ? "In use by " + occupied : "Idle";
    byId("signal-label").textContent = occupied ? "Track occupied · " + occupied : "Track clear";
    byId("rail-scene").classList.toggle("occupied", Boolean(occupied));
  }

  function stop(message) {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    byId("start").disabled = false;
    byId("pause").disabled = true;
    byId("playback-state").textContent = message;
  }

  function tick(timestamp) {
    if (previous !== null) {
      elapsed = Math.min(example.endTime, elapsed + (timestamp - previous) / 1000 * 2 * Number(byId("speed").value));
    }
    previous = timestamp;
    render();
    if (elapsed >= example.endTime) {
      stop("Complete");
      byId("single-result").textContent = "Completed trial: service B waited " + example.wait.toFixed(2) + " min.";
    } else {
      frame = requestAnimationFrame(tick);
    }
  }

  byId("start").addEventListener("click", () => {
    if (frame !== null) return;
    if (monteMode()) {
      if (observations.length >= target) resetExample();
      byId("start").disabled = true;
      byId("pause").disabled = false;
      byId("playback-state").textContent = "Sampling";
      frame = requestAnimationFrame(sampleBatch);
      return;
    }
    if (elapsed >= example.endTime) resetExample();
    previous = null;
    render();
    byId("start").disabled = true;
    byId("pause").disabled = false;
    byId("playback-state").textContent = "Playing";
    frame = requestAnimationFrame(tick);
  });
  byId("pause").addEventListener("click", () => stop("Paused"));
  byId("reset").addEventListener("click", resetExample);
  for (const id of ["delay", "buffer", "entry", "variation"]) {
    byId(id).addEventListener("input", resetExample);
  }
  byId("seed").addEventListener("change", resetExample);
  byId("mode").addEventListener("change", resetExample);
  byId("runs").addEventListener("change", resetExample);
  resetExample();
})();
