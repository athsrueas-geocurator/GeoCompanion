export function createJob(onChange = () => {}) {
  let state = {
      running: false,
      done: 0,
      total: 0,
      errors: 0,
      label: 'Ready',
      log: [],
      entities: 0,
    },
    stopped = false;

  const queue = [],
    seen = new Set(),
    entities = new Set();

  function emit(patch = {}) {
    state = { ...state, ...patch };
    onChange(state);
  }

  function log(message, query = '') {
    emit({ log: [...state.log, { message, query }].slice(-80) });
  }

  function add(key, label, run) {
    if (seen.has(key)) return false;
    if (seen.size >= 300) {
      log('Task budget reached (300). Open an app to load remaining data.');
      return false;
    }
    seen.add(key);
    queue.push({ label, run });
    emit({ total: state.total + 1 });
    return true;
  }

  function discover(ids) {
    for (const id of ids) entities.add(id);
    emit({ entities: entities.size });
  }

  async function start() {
    if (state.running) return;
    stopped = false;
    emit({ running: true });

    while (queue.length && !stopped) {
      const task = queue.shift();
      emit({ label: task.label });

      try {
        await task.run({ add, discover, log, stopped: () => stopped });
        log(`Ready: ${task.label}`);
      } catch (e) {
        emit({ errors: state.errors + 1 });
        log(`Error: ${task.label}: ${e.message}`);
      }

      emit({ done: state.done + 1 });
    }

    emit({
      running: false,
      label: stopped
        ? 'Stopped'
        : state.errors
          ? 'Finished with errors'
          : 'Finished bounded cache pass',
    });
  }

  return {
    add,
    start,
    stop() {
      stopped = true;
      emit({ label: 'Stopping after current task…' });
    },
    log,
    getState: () => state,
  };
}
