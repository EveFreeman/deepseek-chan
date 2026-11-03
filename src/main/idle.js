// Stops a helper process once nothing has used it for a while, to give its memory back.
// The next use starts it again. 0 minutes keeps it running.
function idleStopper(stop) {
  let timer = null;
  let busy = 0;
  let ms = 0;
  const arm = () => {
    clearTimeout(timer);
    timer = busy || !ms ? null : setTimeout(stop, ms);
  };
  return {
    setMinutes(minutes) {
      ms = Math.max(0, Number(minutes) || 0) * 60000;
      arm();
    },
    // The clock waits while work runs and restarts when it ends.
    async during(work) {
      busy++;
      clearTimeout(timer);
      try {
        return await work();
      } finally {
        busy--;
        arm();
      }
    },
    touch: arm,
    cancel() {
      clearTimeout(timer);
      timer = null;
    },
  };
}

module.exports = { idleStopper };
