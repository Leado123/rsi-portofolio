// Web Worker for ColorBends time calculations
let clockStart = null;
let intervalId = null;

self.onmessage = function(e) {
  const { type } = e.data;

  if (type === 'start') {
    clockStart = performance.now();
    // Send time updates at 60fps
    intervalId = setInterval(() => {
      const elapsed = (performance.now() - clockStart) / 1000;
      self.postMessage({
        type: 'tick',
        elapsed: elapsed
      });
    }, 16); // ~60fps
  } else if (type === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};

