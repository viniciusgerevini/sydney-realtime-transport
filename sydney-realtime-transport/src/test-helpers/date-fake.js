const dateFake = {
  date: 1516097850519,
  now() {
    return this.date;
  },
  reset() {
    this.date = 1516097850519;
  }
};

module.exports = dateFake;
