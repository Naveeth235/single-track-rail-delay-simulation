/* Playback of the independent fictional queue example. */
(function () {
  "use strict";
  const byId = id => document.getElementById(id);
  const example = QueueBenchmark.simulate({ delay: 5 });
  let elapsed = 0;
  let frame = null;
  let previous = null;

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
    } else {
      frame = requestAnimationFrame(tick);
    }
  }

  byId("start").addEventListener("click", () => {
    if (frame !== null) return;
    if (elapsed >= example.endTime) elapsed = 0;
    previous = null;
    render();
    byId("start").disabled = true;
    byId("pause").disabled = false;
    byId("playback-state").textContent = "Playing";
    frame = requestAnimationFrame(tick);
  });
  byId("pause").addEventListener("click", () => stop("Paused"));
  byId("reset").addEventListener("click", () => {
    stop("Ready to play");
    elapsed = 0;
    render();
  });
  render();
})();
