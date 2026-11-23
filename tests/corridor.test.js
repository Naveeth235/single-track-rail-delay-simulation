const test = require("node:test");
const assert = require("node:assert/strict");
const { trial } = require("../docs/corridor");
const { createRandom } = require("../docs/simulation");
const { summarize } = require("../docs/statistics");

test("25-minute disruption matches all four corridor hand calculations", () => {
  for (const [buffer, expected] of [[0, 50], [5, 40], [10, 30], [15, 20]]) {
    const settings = { delay: 25, buffer, entryMean: 0, variation: 0 };
    assert.equal(trial(settings, createRandom(42)).wait, expected);
  }
});

test("paired random timetables have zero additional wait without a disruption", () => {
  const settings = { delay: 0, buffer: 5, entryMean: 5, variation: 0.2 };
  const random = createRandom(42);
  for (let i = 0; i < 100; i++) assert.equal(trial(settings, random).wait, 0);
});

test("interval uses the notebook formula even near zero", () => {
  const result = summarize([0, 2]);
  assert.equal(result.mean, 1);
  assert.equal(result.low, 1 - 1.96);
  assert.equal(result.high, 1 + 1.96);
});
