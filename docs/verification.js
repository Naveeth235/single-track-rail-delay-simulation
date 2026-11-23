/* Reproduce the notebook's independent, fictional zero-gap benchmark. */
(function (root) {
  "use strict";

  function verify() {
    const replications = 50000;
    const seed = 42;
    const rng = root.QueueBenchmark.createRandom(seed);
    const settings = { delay: 0, buffer: 0, entryMean: 5, variation: 0 };
    const waits = [];
    for (let i = 0; i < replications; i++) {
      waits.push(root.QueueBenchmark.simulate(root.QueueBenchmark.sampleScenario(settings, rng)).wait);
    }
    const summary = root.QueueStatistics.summarize(waits);
    const expected = 2.5;
    // The analytical variance is 18.75 min². Fix the four-SE tolerance in advance.
    const tolerance = 4 * Math.sqrt(18.75 / replications);
    const error = Math.abs(summary.mean - expected);
    return { replications, seed, expected, mean: summary.mean, error, tolerance,
             passed: error <= tolerance };
  }

  root.QueueVerification = { verify };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { verify };
  }

  if (typeof document === "undefined") return;
  const button = document.getElementById("verify-benchmark");
  button.addEventListener("click", () => {
    const result = verify();
    const checks = [0, 5, 10, 15].map(buffer => {
      const settings = { delay: 25, buffer, entryMean: 0, variation: 0 };
      return Corridor.trial(settings, root.QueueBenchmark.createRandom(42)).wait;
    });
    const corridorPass = checks.every((wait, i) => Math.abs(wait - (50 - 10 * i)) <= 1e-9);
    document.getElementById("corridor-check").textContent =
      (corridorPass ? "PASS" : "FAIL") + " · Corridor hand check at buffers 0, 5, 10 and 15 min: " +
      checks.join(", ") + " train-min (expected 50, 40, 30, 20 within 1e−9 train-min).";
    const set = (id, value) => { document.getElementById(id).textContent = value; };
    set("verified-mean", result.mean.toFixed(4) + " min");
    set("verified-error", result.error.toFixed(4) + " min");
    set("verified-tolerance", result.tolerance.toFixed(4) + " min");
    const status = document.getElementById("verification-status");
    status.textContent = result.passed ? "PASS — within tolerance" : "FAIL — outside tolerance";
    status.dataset.result = result.passed ? "pass" : "fail";
  });
})(globalThis);
