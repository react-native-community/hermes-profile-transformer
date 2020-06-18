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
  InstantEvent,
  CounterEvent,
  FlowEvent,
  MemoryDumpEvent,
  MarkEvent,
  LinkedIDEvent,
} from './types/EventInterfaces';
const events: Event[] = testData.traceEvents as Event[];

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

const handleInstantEvent = (event: InstantEvent): InstantEvent => {
  console.log(event.ph);
  return event;
};

const handleCounterEvent = (event: CounterEvent): CounterEvent => {
  console.log(event.ph);
  return event;
};

const handleFlowEvent = (event: FlowEvent): FlowEvent => {
  console.log(event.ph);
  return event;
};

const handleMemoryDumpEvent = (event: MemoryDumpEvent): MemoryDumpEvent => {
  console.log(event.ph);
  return event;
};

const handleMarkEvent = (event: MarkEvent): MarkEvent => {
  console.log(event.ph);
  return event;
};

const handleLinkedIDEvent = (event: LinkedIDEvent): LinkedIDEvent => {
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
    case EventsPhase.INSTANT_EVENTS:
      handleInstantEvent(event as InstantEvent);
      break;

    case EventsPhase.COUNTER_EVENTS:
      handleCounterEvent(event as CounterEvent);
      break;

    case EventsPhase.FLOW_EVENTS_START:
    case EventsPhase.FLOW_EVENTS_STEP:
    case EventsPhase.FLOW_EVENTS_END:
      handleFlowEvent(event as FlowEvent);
      break;

    case EventsPhase.MEMORY_DUMP_EVENTS_GLOBAL:
    case EventsPhase.MEMORY_DUMP_EVENTS_PROCESS:
      handleMemoryDumpEvent(event as MemoryDumpEvent);
      break;

    case EventsPhase.MARK_EVENTS:
      handleMarkEvent(event as MarkEvent);
      break;

    case EventsPhase.LINKED_ID_EVENTS:
      handleLinkedIDEvent(event as LinkedIDEvent);
      break;
  }
});
