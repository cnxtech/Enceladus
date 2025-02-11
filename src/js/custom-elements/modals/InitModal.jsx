import styles from 'css/components/modal';
import { get_thread_data, initialize } from 'js/initialize';
import esfetch from 'esfetch';
import { is_host } from 'js/helpers';
import { server_url } from 'js/variable-declarations';

const subreddit_regex = /^(?:\/?r\/)?([a-zA-Z0-9_]{1,20})$/gu;

@Attr('role', 'dialog')
@Attr('aria-modal')
export class InitModal extends CustomElement {
  static html = <>
    <style>{styles}</style>

    <div class='modal'>
      <div>Continuing an existing thread?</div>

      <label>
        Enter a thread ID.
        <input
          on:keyup={this.#submit_continue_if_enter.bind(this)}
          ref:named='thread_id'
          type='number'
        />
      </label>

      <button on:click={this.#submit_continue.bind(this)}>Launch!</button>
      <div ref:named='continuation_error' />

      <ce:contents static:if={is_host()}>
        <hr />

        <div>Creating a new thread?</div>

        <label>
          Thread title
          <input
            on:keyup={this.#submit_create_if_enter.bind(this)}
            ref:named='thread_title'
          />
        </label>

        <label>
          Subreddit (optional)
          <input
            on:keyup={this.#submit_create_if_enter.bind(this)}
            ref:named='subreddit'
          />
        </label>

        <label>
          Launch name
          <input
            on:keyup={this.#submit_create_if_enter.bind(this)}
            ref:named='launch_name'
          />
        </label>

        <button on:click={this.#submit_create.bind(this)}>Create thread</button>
        <div ref:named='creation_error' />
      </ce:contents>
    </div>
  </>;

  connectedCallback() {
    this.#thread_id.focus();
  }

  #submit_continue_if_enter(e) {
    if (e.key === 'Enter') {
      this.#submit_continue();
    }
  }

  async #submit_continue() {
    const id = await initialize(await get_thread_data(this.#thread_id.value));
    const url = new URL(window.location.href);
    url.searchParams.set('thread_id', id);
    window.history.replaceState(undefined, '', url);
    this.remove();
  }

  #submit_create_if_enter(e) {
    if (e.key === 'Enter') {
      this.#submit_create();
    }
  }

  #submit_create() {
    const thread = this.#thread_title.value;
    let subreddit = this.#subreddit.value;
    const display_name = this.#launch_name.value;

    if ([thread_name, display_name].includes('')) {
      this.#creation_error.innerHTML = 'Thread and display names are required.';
      return;
    }

    if (!subreddit_regex.test(subreddit)) {
      this.#creation_error.innerHTML = 'Invalid subreddit name';
      return;
    }

    subreddit = subreddit_regex.exec(subreddit)?.[1]?.toLowerCase() ?? null;

    return esfetch(`${server_url}/v1/thread?features=space,spacex`,
      { headers: {
        Authorization: `Bearer ${localStorage.getItem('api_jwt')}`,
      }}
    )
    .post({
      thread_name,
      display_name,
      subreddit,
      event_column_headers: ['UTC', 'Countdown', 'Update'],
    })
    .then(initialize)
    .then(id => {
      const url = new URL(window.location.href);
      url.searchParams.set('thread_id', id);
      window.history.replaceState(undefined, '', url);
      this.remove();
    })
    .catch(err => {
      console.error(err);
      this.#creation_error.innerHTML = err.message;
      return err;
    });
  }
}
