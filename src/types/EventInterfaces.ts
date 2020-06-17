import { EventsPhase } from './Phases';

export interface SharedEventProperties {
  name?: string;
  cat?: string;
  ts: string;
  pid: number;
  tid: string;
  ph: EventsPhase;
  sf?: number;
  tts?: number;
  cname?: string;
}

interface DurationEventBegin<ArgsType> extends SharedEventProperties {
  args?: {
    [key in string]: ArgsType;
  };
  ph: EventsPhase.DURATION_EVENTS_BEGIN;
}

interface DurationEventEnd<ArgsType> extends SharedEventProperties {
  args?: {
    [key in string]: ArgsType;
  };
  ph: EventsPhase.DURATION_EVENTS_END;
}

export type DurationEvents =
  | DurationEventBegin<number>
  | DurationEventEnd<number>;

interface CompleteEvent<ArgsType> extends SharedEventProperties {
  args?: {
    [key in string]: ArgsType;
  };
  ph: EventsPhase.COMPLETE_EVENTS;
  dur: number;
}

export type CompleteEvents = CompleteEvent<number>;

interface MetadataEvent<ArgsType> extends SharedEventProperties {
  args?: {
    [key in string]: ArgsType;
  };
  ph: EventsPhase.METADATA_EVENTS;
}

export type MetadataEvents = MetadataEvent<number>;

export type Event = DurationEvents | CompleteEvents | MetadataEvents;
