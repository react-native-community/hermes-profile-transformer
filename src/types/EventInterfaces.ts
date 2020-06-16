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

interface DurationEventBegin<Key extends string, ArgsType> extends Event {
  args: {
    [key in Key]: ArgsType;
  };
  ph: EventsPhase.DURATION_EVENTS_BEGIN;
}

interface DurationEventEnd<Key extends string, ArgsType> extends Event {
  args: {
    [key in Key]: ArgsType;
  };
  ph: EventsPhase.DURATION_EVENTS_END;
}

export type DurationEvents =
  | DurationEventBegin<string, number>
  | DurationEventEnd<string, number>;

interface CompleteEvent<Key extends string, ArgsType> extends Event {
  args: {
    [key in Key]: ArgsType;
  };
  ph: EventsPhase.COMPLETE_EVENTS;
  dur: number;
}

export type CompleteEvents = CompleteEvent<string, number>;

interface MetadataEvent<Key extends string, ArgsType> extends Event {
  args: {
    [key in Key]: ArgsType;
  };
  ph: EventsPhase.METADATA_EVENTS;
}

export type MetadataEvents = MetadataEvent<string, number>;
