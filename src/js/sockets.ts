import { cache, header_elem, thread_id, youtube_elem } from './initialize';
import Sockette from 'sockette';

export const ws = new Sockette('ws://localhost:3000', {
  onopen,
  onmessage,
  onreconnect: onopen,
});

export function join_rooms(...rooms: string[]): void {
  ws.json({ join: rooms.join(',') });
}

function onopen(): void {
  join_rooms(`thread_${thread_id}`);
}

function onmessage(event: MessageEvent): void {
  const {
    room,
    action,
    data_type,
    data,
  }: {
    room: string;
    action: 'create' | 'update' | 'delete';
    data_type: 'thread' | 'section' | 'event';
    data: CUD<unknown>;
  } = JSON.parse(event.data); // tslint:disable-line no-unsafe-any

  if (room !== `thread_${thread_id}`) {
    // we should never reach this state
    return;
  }

  data.action = action;

  if (data_type === 'thread') {
    thread_handler(data as CUD<APIThread>);
  } else if (data_type === 'section') {
    section_handler(data as CUD<APISection>);
  } else if (data_type === 'event') {
    event_handler(data as CUD<APIEvent>);
  }
  // other options are `user` and `preset_event`,
  // neither of which we care about here
}

function thread_handler(data: CUD<APIThread>): void {
  if (data.action === 'delete') {
    // TODO ???
  } else if (data.action === 'update') {
    if (data.t0 !== undefined) {
      header_elem.t0 = data.t0;
    }
    if (data.youtube_id !== undefined) {
      youtube_elem.video_id = data.youtube_id;
    }
    if (data.sections_id !== undefined) {
      // TODO
    }
  }
}

function section_handler(data: CUD<APISection>): void {
  if (data.action === 'delete') {
    cache.sections[data.id].remove();
    delete cache.sections[data.id];
  } else if (data.action === 'update') {
    const section = cache.sections[data.id];

    if (data.name !== undefined) {
      section.header = data.name;
    }
    if (data.content !== undefined) {
      section.body = data.content;
    }
    if (data.events_id !== undefined) {
      // TODO ???
      // this block may by unnecessary if `Event::utc` is required
    }
  } else if (data.action === 'create') {
    // TODO
  }
}

function event_handler(data: CUD<APIEvent>): void {
  if (data.action === 'delete') {
    cache.events[data.id].remove();
    delete cache.events[data.id];
  } else if (data.action === 'update') {
    const event = cache.events[data.id];

    if (data.message !== undefined) {
      event.message = data.message;
    }
    if (data.terminal_count !== undefined) {
      event.terminal_count = data.terminal_count;
    }
    if (data.utc !== undefined) {
      event.utc = data.utc;
    }
    if (data.posted !== undefined) {
      // TODO
    }
  } else if (data.action === 'create') {
    // TODO
  }
}
