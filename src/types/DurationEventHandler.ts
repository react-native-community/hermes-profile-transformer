import { EventInterface, EventHandler } from './Event';

export enum DurationEventsPhase {
  BEGIN = 'B',
  END = 'E',
}

export interface DurationEventInterface<T, K> extends EventInterface {
  args: Map<T, K>;
}

export class DurationEventHandler extends EventHandler {
  constructor(public event: DurationEventInterface<string, number>) {
    super(event);
    this.event.ph = this.event.ph as DurationEventsPhase;
  }
  process(): DurationEventInterface<string, number> {
    const args = new Map();
    args.set('a', 1);

    return {
      name: 'name',
      cat: 'cat',
      ts: 1,
      pid: 2,
      tid: 4,
      ph: DurationEventsPhase.BEGIN,
      sf: 4,
      args: args,
    };
  }
}
