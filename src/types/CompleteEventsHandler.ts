import { EventInterface, EventHandler } from './Event';

export enum CompleteEventsPhase {
  PHASE = 'X',
}

export interface CompleteEventInterface<T, K> extends EventInterface {
  args: Map<T, K>;
  dur: number;
}

export class CompleteEventHandler extends EventHandler {
  constructor(public event: CompleteEventInterface<string, number>) {
    super(event);
    this.event.ph = this.event.ph as CompleteEventsPhase;
  }
  process(): CompleteEventInterface<string, number> {
    const args = new Map();
    args.set('a', 1);

    return {
      name: 'name',
      cat: 'cat',
      ts: 1,
      pid: 2,
      tid: 4,
      ph: CompleteEventsPhase.PHASE,
      sf: 4,
      args: args,
      dur: 10,
    };
  }
}
