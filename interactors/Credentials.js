class Credentials {
  constructor(json) {
    if (json) {
      this.user = json.user;
      this.pass = json.pass;
    } else {
      this.user = null;
      this.pass = null;
    }
  }

  asJson() {
    return {user: this.user, pass: this.pass};
  }
}

module.exports = Credentials;