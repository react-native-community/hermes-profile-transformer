import testData from './testData';
import { EventsPhase } from './types/Phases';
import {
  Event,
  DurationEvents,
  MetadataEvents,
  CompleteEvents,
} from './types/EventInterfaces';
export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};
const events: Event[] = testData.traceEvents;

const handleDurationEvent = (event: DurationEvents): DurationEvents => {
  console.log(event);
  return event;
};

const handleMetadataEvent = (event: MetadataEvents): MetadataEvents => {
  console.log(event);
  return event;
};

const handleCompleteEvent = (event: CompleteEvents): CompleteEvents => {
  console.log(event);
  return event;
};

events.forEach(event => {
  switch (event.ph) {
    case EventsPhase.METADATA_EVENTS:
      handleMetadataEvent(event as MetadataEvents);
      break;

    case EventsPhase.DURATION_EVENTS_BEGIN:
    case EventsPhase.DURATION_EVENTS_END:
      handleDurationEvent(event as DurationEvents);
      break;

    case EventsPhase.COMPLETE_EVENTS:
      handleCompleteEvent(event as CompleteEvents);
      break;
  }
});
