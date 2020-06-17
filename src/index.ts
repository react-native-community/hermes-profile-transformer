import testData from './testData';
import { EventsPhase } from './types/Phases';
import {
  Event,
  SharedEventProperties,
  DurationEvents,
  CompleteEvents,
  MetadataEvents,
} from './types/EventInterfaces';
export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};
const events: SharedEventProperties[] = testData.traceEvents;

const handleDurationEvent = (event: DurationEvents): DurationEvents => {
  console.log(event.ph);
  return event;
};

const handleMetadataEvent = (event: MetadataEvents): MetadataEvents => {
  console.log(event.ph);
  return event;
};

const handleCompleteEvent = (event: CompleteEvents): CompleteEvents => {
  console.log(event.ph);
  return event;
};

events.forEach((event: SharedEventProperties): void => {
  switch (event.ph) {
    case EventsPhase.METADATA_EVENTS:
      handleMetadataEvent(event);
      break;

    case EventsPhase.DURATION_EVENTS_BEGIN:
    case EventsPhase.DURATION_EVENTS_END:
      handleDurationEvent(event);
      break;

    case EventsPhase.COMPLETE_EVENTS:
      handleCompleteEvent(event);
      break;
  }
});
