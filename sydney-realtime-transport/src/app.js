const FIVE_MINUTES_IN_MS = 300000;

function App(messageBus, updater, date = Date, timeout = setTimeout) {
  let timeSinceLastMessage;

  messageBus.subscribe('TRANSPORT_LIVE_POSITION_REQUESTED', (message) => {
    if (message.data.city === 'AU_SYDNEY') {
      updater.start();
      timeSinceLastMessage = date.now();
    }
  });

  updater.onUpdate((data) => {
    messageBus.publish({
      name: 'TRANSPORT_LIVE_POSITION_UPDATED',
      data,
      version: 1
    });
  });

  function stopIfMaxIntervalReached() {
    timeout(() => {
      if (date.now() - timeSinceLastMessage > FIVE_MINUTES_IN_MS) {
        updater.stop();
      }
      stopIfMaxIntervalReached();
    }, FIVE_MINUTES_IN_MS);
  }

  stopIfMaxIntervalReached();
}

module.exports = App;
