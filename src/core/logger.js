export default class Logger {
  #info;
  #status;
  #error;
  #warning;

  constructor(info, status, error, warning) {
    this.#info = info;
    this.#status = status;
    this.#error = error;
    this.#warning = warning;
  }

  info(...args) {
    this.#info(...args);
  }
  status(...args) {
    this.#status(...args);
  }
  error(...args) {
    this.#error(...args);
  }
  warning(...args) {
    this.#warning(...args);
  }
}
