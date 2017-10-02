class Token {
  constructor(json) {
    if (json) {
      this.value = json.value;
      this.expiry = json.expiry;
    } else {
      this.value = null;
      this.expiry = -1;
    }
  }

  asJson() {
    return {value: this.value, expiry: this.expiry};
  }
}

module.exports = Token;