function Updater(action, options, interval = setInterval, stopInterval = clearInterval) {
  let intervalId;
  const onUpdateCallbacks = [];
  const onErrorCallbacks = [];

  async function executeAction() {
    let response;

    try {
      response = await action();
    } catch (err) {
      triggerOnErrorCallbacks(err);
      return;
    }

    if (response && response.length >= 0) {
      response.forEach(triggerOnUpdateCallbacks);
    } else {
      triggerOnUpdateCallbacks(response);
    }
  }

  function triggerOnUpdateCallbacks(response) {
    onUpdateCallbacks.forEach(callback => callback(response));
  }

  function triggerOnErrorCallbacks(error) {
    onErrorCallbacks.forEach(callback => callback(error));
  }

  return {
    start() {
      executeAction();
      intervalId = interval(executeAction, options.interval);
    },
    stop() {
      stopInterval(intervalId);
    },
    onUpdate(callback) {
      onUpdateCallbacks.push(callback);
    },
    onError(callback) {
      onErrorCallbacks.push(callback);
    }
  };
}

module.exports = Updater;
