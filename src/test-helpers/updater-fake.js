const updaterFake = {
  onStop: () => {},
  onStart: () => {},
  onUpdateCallback: () => {},
  start() {
    this.onStart();
  },
  stop() {
    this.onStop();
  },
  onUpdate(callback) {
    this.onUpdateCallback = callback;
  },
  reset() {
    this.onStop = () => {};
    this.onStart = () => {};
    this.onUpdateCallback = () => {};
  }
};

module.exports = updaterFake;
