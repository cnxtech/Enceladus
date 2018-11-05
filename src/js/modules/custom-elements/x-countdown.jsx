import { _ } from 'param.macro';
import createElement from '../createElement';

/**
 * Given a number,
 * return the string containing exactly two digits.
 *
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  if (n < 10) {
    return `0${n}`;
  }
  return String(n);
}

class Countdown extends HTMLElement {
  #t0 = null;
  #sign = '-';
  #hours = 0;
  #minutes = 0;
  #seconds = 0;
  #interval = null;
  #countdown;
  #current_display;

  get t0() {
    return this.#t0;
  }

  set t0(value) {
    this.#t0 = value;

    if (value === null) {
      clearInterval(this.#interval);
      this.#interval = null;
    } else if (this.#interval === null) {
      this.#interval = setInterval(this._update_clock.bind(this), 1_000);
    }

    this._update_clock();
  }

  /**
   * Time to be displayed on the countdown, if any.
   */
  get display_time() {
    if (this.#t0 === null) {
      return '';
    }
    if (this.#hours >= 48) {
      return `T${this.#sign}${Math.floor(this.#hours / 24)}d ${this.#hours % 24}h`;
    }
    return `T${this.#sign}${this.#hours}:${pad(this.#minutes)}:${pad(this.#seconds)}`;
  }

  /**
   * Update the countdown clock.
   */
  _update_clock() {
    this.#sign = do {
      if (this.#t0 < Date.now() / 1000) {
        '+';
      } else {
        '-';
      }
    };

    const diff = Math.floor(Math.abs(this.#t0 - Date.now() / 1000));

    this.#hours = Math.floor(diff / 3600);
    this.#minutes = Math.floor(diff % 3600 / 60);
    this.#seconds = diff % 60;

    const { display_time } = this;
    if (display_time !== this.#current_display) {
      this.#countdown.innerHTML = display_time;
      this.#current_display = display_time;
    }
  }

  /**
   * Called when the element is created.
   * Creates a shadow DOM containing the timer and the relevant CSS.
   */
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'closed' });

    const css = <link rel='stylesheet' href='x-countdown.bundle.css'/>;
    this.#countdown = <div/>;

    [
      css,
      this.#countdown,
    ].forEach(shadow.appendChild(_));
  }

  disconnectedCallback() {
    clearInterval(this.#interval);
  }
}

customElements.define('x-countdown', Countdown);
