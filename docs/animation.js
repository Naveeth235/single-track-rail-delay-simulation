/* Playback of the independent three-train corridor. */
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
    byId("mean-result").textContent = result ? result.mean.toFixed(2) + " train-min" : "— min";
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
      observations.push(Corridor.trial(settings, random).wait);
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
    example = Corridor.trial(settings, random);
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
    const minute = 571 + Math.floor(elapsed);
    byId("elapsed").textContent = String(Math.floor(minute / 60)).padStart(2, "0") + ":" +
      String(minute % 60).padStart(2, "0");
    const blocks = ["clear", "clear"];
    for (const [i, id] of ["A", "B", "C"].entries()) {
      const route = example.legs.slice(i * 2, i * 2 + 2);
      const second = elapsed >= route[0].finish;
      const leg = route[Number(second)];
      const progress = Math.min(1, Math.max(0, (elapsed - leg.start) / (leg.finish - leg.start)));
      const position = leg.origin + progress * (leg.destination - leg.origin);
      let state = second ? "At Gampola" : "Awaiting entry";
      if (elapsed >= leg.finish) state = "Arrived at " + Corridor.stations[leg.destination];
      else if (elapsed >= leg.start) {
        state = "To " + Corridor.stations[leg.destination];
        blocks[Math.min(leg.origin, leg.destination)] = id;
      } else if (elapsed >= leg.ready) state = "Waiting at " + Corridor.stations[leg.origin];
      byId("state-" + id).textContent = state;
      byId("progress-" + id).value = (Number(second) + progress) / 2;
      byId("train-" + id).style.left = (10 + 40 * position) + "%";
      const waited = route.reduce((sum, item) => sum + Math.min(item.wait, Math.max(0, elapsed - item.ready)), 0);
      byId("wait-" + id).textContent = waited.toFixed(1) + " min waiting";
    }
    byId("resource-state").textContent = blocks.join("  /  ");
    byId("signal-label").textContent = "West block: " + blocks[0] + " · East block: " + blocks[1];
    byId("rail-scene").classList.toggle("occupied", blocks.some(value => value !== "clear"));
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
      byId("single-result").textContent = "Additional waiting across B and C: " + example.wait.toFixed(2) + " train-min.";
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
