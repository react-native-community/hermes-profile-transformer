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
  args?: {
    [key in string]: any;
  };
}

interface DurationEventBegin extends SharedEventProperties {
  ph: EventsPhase.DURATION_EVENTS_BEGIN;
}

interface DurationEventEnd extends SharedEventProperties {
  ph: EventsPhase.DURATION_EVENTS_END;
}

export type DurationEvent = DurationEventBegin | DurationEventEnd;

export interface CompleteEvent extends SharedEventProperties {
  ph: EventsPhase.COMPLETE_EVENTS;
  dur: number;
}

export interface MetadataEvent extends SharedEventProperties {
  ph: EventsPhase.METADATA_EVENTS;
}

export type Event = DurationEvent | CompleteEvent | MetadataEvent;
