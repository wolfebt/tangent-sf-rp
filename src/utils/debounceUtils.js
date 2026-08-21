/**
 * Creates a debounced function that delays invoking func until after wait milliseconds.
 * Provides a .flush() method to immediately trigger execution.
 */
export function createDebouncedSaver(saveFunction, delay = 1500) {
  let timeoutId = null;
  let latestArgs = null;
  let isPending = false;

  const debounced = (...args) => {
    latestArgs = args;
    isPending = true;
    if (timeoutId) clearTimeout(timeoutId);

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          isPending = false;
          const args = latestArgs;
          const result = await saveFunction(...args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };

  debounced.flush = async () => {
    if (!isPending || !latestArgs) return;
    if (timeoutId) clearTimeout(timeoutId);
    isPending = false;
    const args = latestArgs;
    latestArgs = null;
    return await saveFunction(...args);
  };

  debounced.isPending = () => isPending;

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    isPending = false;
    latestArgs = null;
  };

  return debounced;
}
