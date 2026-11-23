/* Times are minutes after 09:31. A, B and C each have two legs. */
const Corridor = (() => {
  const nominal = [21, 25, 27, 18, 21, 25];
  const stations = ["Peradeniya Junction", "Gampola", "Nawalapitiya"];

  function simulate(buffer, delay, entries, durations) {
    const scheduled = [8, 31, 0, 29 + buffer, 47 + buffer, 70 + buffer];
    const legs = [];
    function dispatch(index, origin, destination, previousLeg, previousBlock) {
      const train = Math.floor(index / 2);
      const ready = previousLeg === null
        ? scheduled[index] + entries[train] + (train === 0 ? delay : 0)
        : Math.max(scheduled[index], legs[previousLeg].finish + 2);
      const start = Math.max(ready, previousBlock === null ? 0 : legs[previousBlock].finish);
      legs[index] = { origin, destination, ready, start, finish: start + durations[index],
                      scheduledFinish: scheduled[index] + nominal[index], wait: start - ready };
    }
    // Evaluate the fixed route and block precedence constraints in dependency order.
    dispatch(0, 0, 1, null, null);
    dispatch(2, 2, 1, null, null);
    dispatch(1, 1, 2, 0, 2);
    dispatch(3, 1, 0, 2, 0);
    dispatch(4, 0, 1, null, 3);
    dispatch(5, 1, 2, 4, 1);
    return legs;
  }

  function trial(settings, random) {
    const entries = Array.from({ length: 3 }, () => -settings.entryMean * Math.log1p(-random()));
    const durations = nominal.map(time => time * (1 + settings.variation * (2 * random() - 1)));
    const baseline = simulate(settings.buffer, 0, entries, durations);
    const legs = simulate(settings.buffer, settings.delay, entries, durations);
    const extra = legs.map((leg, i) => leg.wait - baseline[i].wait);
    const extraB = extra[2] + extra[3];
    const extraC = extra[4] + extra[5];
    return { legs, extraB, extraC, wait: extraB + extraC, endTime: Math.max(...legs.map(leg => leg.finish)) };
  }
  return { simulate, trial, stations };
})();
if (typeof module !== "undefined") module.exports = Corridor;
