import testData from './testData';
import { EventsPhase } from './types/Phases';
import {
  Event,
  DurationEvent,
  CompleteEvent,
  MetadataEvent,
  SampleEvent,
  ObjectEvent,
  ClockSyncEvent,
  AsyncEvent,
  ContextEvent,
} from './types/EventInterfaces';
export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};
const events: Event[] = testData.traceEvents;

const handleDurationEvent = (event: DurationEvent): DurationEvent => {
  console.log(event.ph);
  return event;
};

const handleMetadataEvent = (event: MetadataEvent): MetadataEvent => {
  console.log(event.ph);
  return event;
};

const handleCompleteEvent = (event: CompleteEvent): CompleteEvent => {
  console.log(event.ph);
  return event;
};

const handleSampleEvent = (event: SampleEvent): SampleEvent => {
  console.log(event.ph);
  return event;
};

const handleObjectEvent = (event: ObjectEvent): ObjectEvent => {
  console.log(event.ph);
  return event;
};

const handleClockSyncEvent = (event: ClockSyncEvent): ClockSyncEvent => {
  console.log(event.ph);
  return event;
};

const handleAsyncEvent = (event: AsyncEvent): AsyncEvent => {
  console.log(event.ph);
  return event;
};

const handleContextEvent = (event: ContextEvent): ContextEvent => {
  console.log(event.ph);
  return event;
};

events.forEach((event: Event): void => {
  switch (event.ph) {
    case EventsPhase.METADATA_EVENTS:
      handleMetadataEvent(event as MetadataEvent);
      break;

    case EventsPhase.DURATION_EVENTS_BEGIN:
    case EventsPhase.DURATION_EVENTS_END:
      handleDurationEvent(event as DurationEvent);
      break;

    case EventsPhase.COMPLETE_EVENTS:
      handleCompleteEvent(event as CompleteEvent);
      break;

    case EventsPhase.SAMPLE_EVENTS:
      handleSampleEvent(event as SampleEvent);
      break;

    case EventsPhase.OBJECT_EVENTS_CREATED:
    case EventsPhase.OBJECT_EVENTS_SNAPSHOT:
    case EventsPhase.OBJECT_EVENTS_DESTROYED:
      handleObjectEvent(event as ObjectEvent);
      break;

    case EventsPhase.CLOCK_SYNC_EVENTS:
      handleClockSyncEvent(event as ClockSyncEvent);
      break;

    case EventsPhase.ASYNC_EVENTS_NESTABLE_START:
    case EventsPhase.ASYNC_EVENTS_NESTABLE_INSTANT:
    case EventsPhase.ASYNC_EVENTS_NESTABLE_END:
      handleAsyncEvent(event as AsyncEvent);
      break;

    case EventsPhase.CONTEXT_EVENTS_ENTER:
    case EventsPhase.CONTEXT_EVENTS_LEAVE:
      handleContextEvent(event as ContextEvent);
      break;
  }
});
