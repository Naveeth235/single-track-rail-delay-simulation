/* Playback of the independent fictional queue example. */
(function () {
  "use strict";
  const byId = id => document.getElementById(id);
  let example;
  let elapsed = 0;
  let frame = null;
  let previous = null;

  function resetExample() {
    stop("Ready to play");
    elapsed = 0;
    const seedInput = byId("seed");
    const seed = seedInput.valueAsNumber;
    if (!Number.isInteger(seed) || seed < 1 || seed > 4294967295) {
      seedInput.value = "42";
    }
    const settings = {
      delay: Number(byId("delay").value),
      buffer: Number(byId("buffer").value),
      entryMean: Number(byId("entry").value),
      variation: Number(byId("variation").value) / 100
    };
    for (const id of ["delay", "buffer", "entry", "variation"]) {
      byId(id + "-value").textContent = byId(id).value + (id === "variation" ? "%" : " min");
    }
    const random = QueueBenchmark.createRandom(Number(seedInput.value));
    example = QueueBenchmark.simulate(QueueBenchmark.sampleScenario(settings, random));
    byId("single-result").textContent = "Trial result pending.";
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
      byId("progress-" + job.id).value = Math.max(0, Math.min(1, (elapsed - job.start) / job.duration));
      const wait = Math.max(0, Math.min(job.wait, elapsed - job.ready));
      byId("wait-" + job.id).textContent = wait.toFixed(1) + " min waiting";
    }
    byId("resource-state").textContent = occupied ? "In use by " + occupied : "Idle";
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
  resetExample();
})();
