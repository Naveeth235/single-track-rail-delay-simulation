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
    const set = (id, value) => { document.getElementById(id).textContent = value; };
    set("verified-mean", result.mean.toFixed(4) + " min");
    set("verified-error", result.error.toFixed(4) + " min");
    set("verified-tolerance", result.tolerance.toFixed(4) + " min");
    const status = document.getElementById("verification-status");
    status.textContent = result.passed ? "PASS — within tolerance" : "FAIL — outside tolerance";
    status.dataset.result = result.passed ? "pass" : "fail";
  });
})(globalThis);
