import { EventsPhase } from './Phases';

export interface SharedEventProperties {
  name?: string;
  cat?: string;
  ts: string;
  pid?: number;
  tid?: string;
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

export interface SampleEvent extends SharedEventProperties {
  ph: EventsPhase.SAMPLE_EVENTS;
}

interface ObjectEventCreated extends SharedEventProperties {
  ph: EventsPhase.OBJECT_EVENTS_CREATED;
  scope?: string;
}

interface ObjectEventSnapshot extends SharedEventProperties {
  ph: EventsPhase.OBJECT_EVENTS_SNAPSHOT;
  scope?: string;
}

interface ObjectEventDestroyed extends SharedEventProperties {
  ph: EventsPhase.OBJECT_EVENTS_DESTROYED;
  scope?: string;
}

export type ObjectEvent =
  | ObjectEventCreated
  | ObjectEventSnapshot
  | ObjectEventDestroyed;

export interface ClockSyncEvent extends SharedEventProperties {
  ph: EventsPhase.CLOCK_SYNC_EVENTS;
  args: {
    sync_id: string;
    issue_ts?: number;
  };
}

interface ContextEventEnter extends SharedEventProperties {
  ph: EventsPhase.CONTEXT_EVENTS_ENTER;
}

interface ContextEventLeave extends SharedEventProperties {
  ph: EventsPhase.CONTEXT_EVENTS_LEAVE;
}

export type ContextEvent = ContextEventEnter | ContextEventLeave;

interface AsyncEventStart extends SharedEventProperties {
  ph: EventsPhase.ASYNC_EVENTS_NESTABLE_START;
  id: number;
  scope?: string;
}

interface AsyncEventInstant extends SharedEventProperties {
  ph: EventsPhase.ASYNC_EVENTS_NESTABLE_INSTANT;
  id: number;
  scope?: string;
}

interface AsyncEventEnd extends SharedEventProperties {
  ph: EventsPhase.ASYNC_EVENTS_NESTABLE_END;
  id: number;
  scope?: string;
}

export type AsyncEvent = AsyncEventStart | AsyncEventInstant | AsyncEventEnd;

export type Event =
  | DurationEvent
  | CompleteEvent
  | MetadataEvent
  | SampleEvent
  | ObjectEvent
  | ClockSyncEvent
  | ContextEvent
  | AsyncEvent;
