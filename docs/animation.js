/* Playback of the independent three-train corridor. */
(function () {
  "use strict";
  const byId = id => document.getElementById(id);
  let example;
  let elapsed = 0;
  let frame = null;
  let previous = null;
  let settings, random, observations, target;

  // Map coordinates are percentages across the scene and pixels above the main line.
  const loop = [[36, 0], [42, 33], [58, 33], [64, 0]];
  function loopRise(x) {
    for (let i = 1; i < loop.length; i++) {
      const [left, height] = loop[i - 1];
      const [right, nextHeight] = loop[i];
      if (x >= left && x <= right) {
        const fraction = (x - left) / (right - left);
        const eased = fraction * fraction * (3 - 2 * fraction);
        return height + (nextHeight - height) * eased;
      }
    }
    return 0;
  }
  function drawTrack() {
    const canvas = byId("rail-map");
    const width = canvas.clientWidth;
    if (!width) return;
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(92 * scale);
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.lineJoin = "round";
    const curvedLoop = Array.from({ length: 113 }, (_, i) => {
      const x = 36 + i / 4;
      return [x, loopRise(x)];
    });
    for (const points of [[[0, 0], [100, 0]], curvedLoop]) {
      ctx.beginPath();
      points.forEach(([x, rise], i) => {
        ctx[i ? "lineTo" : "moveTo"](width * x / 100, 72 - rise);
      });
      // Ballast, sleepers and two bright rail edges.
      for (const [color, thickness, dash] of [["#17342d", 15, []], ["#8d8974", 12, []],
                                                ["#504737", 11, [3, 5]], ["#e4dcc2", 6, []],
                                                ["#414b42", 2, []]]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.setLineDash(dash);
        ctx.stroke();
      }
    }
    // Station markers align with the station names below.
    ctx.setLineDash([]);
    for (const x of [10, 50, 90]) {
      ctx.beginPath();
      ctx.arc(width * x / 100, 72, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#f8e7b5";
      ctx.fill();
      ctx.strokeStyle = "#233b31";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  new ResizeObserver(drawTrack).observe(byId("rail-map"));

  function monteMode() {
    return byId("mode").value === "monte";
  }

  function renderStatistics() {
    const result = QueueStatistics.summarize(observations);
    byId("sample-data").hidden = !result;
    byId("sampling-hint").hidden = Boolean(result);
    byId("mean-result").textContent = result ? result.mean.toFixed(2) + " train-min" : "— min";
    byId("ci-result").textContent = result && observations.length > 1
      ? result.low.toFixed(2) + " – " + result.high.toFixed(2) + " train-min" : "— min";
    byId("replications-result").textContent = observations.length.toLocaleString();
    const large = observations.filter(wait => wait > 30).length;
    byId("risk-result").textContent = result
      ? (100 * large / observations.length).toFixed(1) + "% (" + large.toLocaleString() +
        " of " + observations.length.toLocaleString() + " trials)" : "Pending";
    const fixedInputs = settings.entryMean === 0 && settings.variation === 0;
    byId("interval-note").textContent = result && fixedInputs
      ? "With random entry delays and running-time variation both off, every trial gives " +
        result.mean.toFixed(2) + " train-minutes. Both ends of the interval are equal."
      : "The interval estimates uncertainty in the mean across trials.";
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
      byId("playback-state").textContent = samplingStatus("Sampling");
      frame = requestAnimationFrame(sampleBatch);
    }
  }

  function resetExample() {
    stop(monteMode() ? "Ready to sample" : "Ready to play");
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
    byId("activity-title").textContent = monteMode() ? "Experiment progress" : "Live visualization";
    runs.disabled = !monteMode();
    byId("journey-results").hidden = monteMode();
    byId("sampling-results").hidden = !monteMode();
    byId("speed").disabled = monteMode();
    byId("single-view").hidden = monteMode();
    byId("rail-scene").hidden = monteMode();
    byId("clock-panel").hidden = monteMode();
    byId("mode-badge").textContent = monteMode() ? "Monte Carlo experiment" : "Single simulation";
    byId("single-result").textContent = "Additional B + C waiting is calculated at the end of this run.";
    renderStatistics();
    render();
  }

  function clockTime(offset) {
    const minute = 571 + Math.floor(offset);
    return String(Math.floor(minute / 60)).padStart(2, "0") + ":" +
      String(minute % 60).padStart(2, "0");
  }

  function render() {
    byId("elapsed").textContent = clockTime(elapsed);
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
      const train = byId("train-" + id);
      // Park C behind A at the western terminus and animate continuously
      // from its parking position when the first leg begins.
      const x = id === "C" && !second
        ? 3.5 + (50 - 3.5) * progress
        : 10 + 40 * position;
      train.style.left = x + "%";
      train.style.setProperty("--loop-rise", (id === "B" ? loopRise(x) : 0) + "px");
      train.hidden = elapsed >= route[1].finish;
      byId("scheduled-" + id).textContent = clockTime(route[1].scheduledFinish);
      byId("arrival-" + id).textContent = train.hidden ? clockTime(route[1].finish) : "Pending";
      byId("late-" + id).textContent = train.hidden
        ? (route[1].finish - route[1].scheduledFinish).toFixed(1) : "—";
      const waited = route.reduce((sum, item) => sum + Math.min(item.wait, Math.max(0, elapsed - item.ready)), 0);
      byId("wait-" + id).textContent = waited.toFixed(1) + " min waiting";
    }
    byId("resource-state").textContent = blocks.join("  /  ");
    byId("signal-label").textContent = "West block: " + blocks[0] + " · East block: " + blocks[1];
    byId("rail-scene").classList.toggle("occupied", blocks.some(value => value !== "clear"));
  }

  function samplingStatus(message) {
    return message + " · " + observations.length.toLocaleString() + " of " +
      target.toLocaleString() + " trials completed";
  }

  function stop(message) {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previous = null;
    byId("start").disabled = false;
    byId("pause").disabled = true;
    byId("playback-state").textContent = monteMode() && (message === "Complete" || message === "Paused")
      ? samplingStatus(message) : message;
  }

  function tick(timestamp) {
    if (previous !== null) {
      elapsed = Math.min(example.endTime, elapsed + (timestamp - previous) / 1000 * 2 * Number(byId("speed").value));
    }
    previous = timestamp;
    render();
    if (elapsed >= example.endTime) {
      stop("Complete");
      byId("single-result").textContent = "Extra waiting caused by A’s disruption: B " +
        example.extraB.toFixed(2) + " min + C " + example.extraC.toFixed(2) +
        " min = " + example.wait.toFixed(2) + " train-min.";
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
      byId("playback-state").textContent = samplingStatus("Sampling");
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
