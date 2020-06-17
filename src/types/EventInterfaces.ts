import { EventsPhase } from './Phases';

export interface Event {
  name?: string;
  cat?: string;
  ts: string;
  pid: number;
  tid: string;
  ph: string;
  sf?: number;
  cname?: string;
}

interface DurationEventBegin<ArgsType> extends Event {
  args: {
    [key in string]: ArgsType;
  };
  ph: EventsPhase.DURATION_EVENTS_BEGIN;
}

interface DurationEventEnd<ArgsType> extends Event {
  args: {
    [key in string]: ArgsType;
  };
  ph: EventsPhase.DURATION_EVENTS_END;
}

export type DurationEvents =
  | DurationEventBegin<number>
  | DurationEventEnd<number>;

interface CompleteEvent<ArgsType> extends Event {
  args: {
    [key in string]: ArgsType;
  };
  ph: EventsPhase.COMPLETE_EVENTS;
  dur: number;
}

export type CompleteEvents = CompleteEvent<number>;

interface MetadataEvent<ArgsType> extends Event {
  args: {
    [key in string]: ArgsType;
  };
  ph: EventsPhase.METADATA_EVENTS;
}

export type MetadataEvents = MetadataEvent<number>;
