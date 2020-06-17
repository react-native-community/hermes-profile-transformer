import testData from './testData';
import { EventsPhase } from './types/Phases';
import {
  Event,
  DurationEvent,
  CompleteEvent,
  MetadataEvent,
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
  }
});
