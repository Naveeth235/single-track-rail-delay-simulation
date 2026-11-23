/* Independent fictional two-service queue benchmark. All times are in minutes. */
(function (root) {
  "use strict";

  function createRandom(seed) {
    let state = seed >>> 0;
    return function () {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return (state + 0.5) / 4294967296;
    };
  }

  function exponential(mean, random) {
    return -mean * Math.log1p(-random());
  }

  // A fixed-order, single-server queue with two fictional jobs.
  // The simulation clock advances to the next readiness or completion event.
  function simulate({ delay = 0, buffer = 0, entryA = 0, entryB = 0,
                      durationA = 10, durationB = 10 } = {}) {
    for (const value of [delay, buffer, entryA, entryB]) {
      if (!Number.isFinite(value) || value < 0) {
        throw new RangeError("Delays and buffer must be finite and nonnegative.");
      }
    }
    for (const duration of [durationA, durationB]) {
      if (!Number.isFinite(duration) || duration <= 0) {
        throw new RangeError("Durations must be finite and positive.");
      }
    }
    const jobs = [
      { id: "A", ready: delay + entryA, duration: durationA },
      { id: "B", ready: 10 + buffer + entryB, duration: durationB }
    ];
    let clock = 0;
    const events = [];
    const movements = [];
    for (const job of jobs) {
      const start = Math.max(clock, job.ready);
      const finish = start + job.duration;
      movements.push({ id: job.id, ready: job.ready, start, finish,
                       wait: start - job.ready, duration: job.duration });
      events.push({ time: job.ready, type: "ready", id: job.id },
                  { time: start, type: "start", id: job.id },
                  { time: finish, type: "finish", id: job.id });
      clock = finish;
    }
    // At a shared timestamp, completion releases the resource before a start.
    const priority = { finish: 0, ready: 1, start: 2 };
    events.sort((a, b) => a.time - b.time || priority[a.type] - priority[b.type]);
    return { movements, events, wait: movements[1].wait, endTime: clock };
  }

  function sampleScenario({ delay = 0, buffer = 0, entryMean = 5,
                            variation = 0 } = {}, random) {
    if (typeof random !== "function") {
      throw new TypeError("Pass a seeded random generator.");
    }
    if (!Number.isFinite(entryMean) || entryMean < 0 ||
        !Number.isFinite(variation) || variation < 0 || variation >= 1) {
      throw new RangeError("Entry mean must be nonnegative; variation must be in [0, 1).");
    }
    return {
      delay, buffer,
      entryA: exponential(entryMean, random),
      entryB: exponential(entryMean, random),
      durationA: 10 * (1 + variation * (2 * random() - 1)),
      durationB: 10 * (1 + variation * (2 * random() - 1))
    };
  }

  // Valid for fixed ten-minute durations, no imposed delay, and equal means.
  function expectedWait(entryMean, buffer) {
    if (!Number.isFinite(entryMean) || entryMean < 0 ||
        !Number.isFinite(buffer) || buffer < 0) {
      throw new RangeError("Mean and buffer must be finite and nonnegative.");
    }
    return entryMean === 0 ? 0 : entryMean / 2 * Math.exp(-buffer / entryMean);
  }

  const api = { createRandom, simulate, sampleScenario, expectedWait };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.QueueBenchmark = api;
  }
})(globalThis);
