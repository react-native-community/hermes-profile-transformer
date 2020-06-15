import {
  DurationEventHandler,
  DurationEventsPhase,
  DurationEventInterface,
} from './DurationEventHandler';

import {
  CompleteEventHandler,
  CompleteEventsPhase,
  CompleteEventInterface,
} from './CompleteEventsHandler';

export interface EventInterface {
  name: string;
  cat: string;
  ts: number;
  pid: number;
  tid: number;
  ph: string;
  sf?: number;
  cname?: string;
}

export abstract class EventHandler {
  constructor(public row: EventInterface) {}
  abstract process(): EventInterface;
}

export class Event {
  handler!: EventHandler;
  constructor(row: EventInterface) {
    if (
      row.ph === DurationEventsPhase.BEGIN ||
      row.ph === DurationEventsPhase.END
    ) {
      this.handler = new DurationEventHandler(
        row as DurationEventInterface<string, number>
      );
    } else if (row.ph === CompleteEventsPhase.PHASE) {
      this.handler = new CompleteEventHandler(
        row as CompleteEventInterface<string, number>
      );
    }
  }
  handle(): EventInterface {
    return this.handler.process();
  }
}
