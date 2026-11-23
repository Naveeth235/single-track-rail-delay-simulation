/* Sampling statistics for independent fictional queue trials. */
(function (root) {
  "use strict";
  function summarize(values) {
    if (!values.length) return null;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.length > 1
      ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
      : 0;
    const margin = 1.96 * Math.sqrt(variance / values.length);
    return { mean, low: mean - margin, high: mean + margin };
  }

  function histogram(values) {
    // Keep zero waits separate from strictly positive observations.
    const bins = [0, 0, 0, 0, 0];
    for (const value of values) {
      const index = value === 0 ? 0 : value <= 5 ? 1 : value <= 10 ? 2 : value <= 20 ? 3 : 4;
      bins[index]++;
    }
    const labels = ["0", "0–5", "5–10", "10–20", ">20"];
    return bins.map((count, i) => ({ label: labels[i], count }));
  }

  const api = { summarize, histogram };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.QueueStatistics = api;
})(globalThis);
