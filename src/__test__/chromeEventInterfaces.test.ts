import {
  Event,
  FlowEvent,
  DurationEvent,
} from '../types/ChromeEventInterfaces';
import { EventsPhase } from '../types/phases';

/**
 * These tests are 50% about testing that the types are implemented correctly,
 * and 50% documenting how to handle mapping between Event types and subtypes
 * with and without EventsPhas literal.
 *
 * The tests rely on the @ts-expect-error pragma, which will pass the type check
 * if the following line has a type error, and will error if the following line is fine.
 */
describe('Event', () => {
  it('should allow constructing event objects using EventsPhase enum values', () => {
    // create a new flow event
    const event: FlowEvent = {
      ts: 'ts',
      ph: EventsPhase.FLOW_EVENTS_START,
    };

    // check that value is correct in runtime
    expect(event).toEqual({ ts: 'ts', ph: 's' });
  });
  it('should not allow constructing event objects using wrong enum values', () => {
    // try to create a new flow event, should fail with TypeScript error
    // @ts-expect-error
    const event: FlowEvent = { ts: 'ts', ph: EventsPhase.INSTANT_EVENTS };

    // at runtime object is still created, but we should never be here
    expect(event).toEqual({ ts: 'ts', ph: 'I' });
  });

  it('should not allow constructing event objects with phase literal at type level', () => {
    // try to create a new flow event, should fail with TypeScript error
    // @ts-expect-error
    const event: FlowEvent = { ts: 'ts', ph: 's' };

    // check that value is correct in runtime
    expect(event).toEqual({ ts: 'ts', ph: 's' });
  });

  it('should allow coercing event objects with correct phase literal', () => {
    const event: FlowEvent = { ts: 'ts', ph: 's' } as FlowEvent;

    // check that value is correct in runtime
    expect(event).toEqual({ ts: 'ts', ph: 's' });
  });

  it('should not allow coercing event objects with incorrect phase literal', () => {
    // try to create a new flow event, should fail with TypeScript error
    // @ts-expect-error
    const event: FlowEvent = { ts: 'ts', ph: 'NOT_s' } as FlowEvent;

    // check that value is correct in runtime
    expect(event).toEqual({ ts: 'ts', ph: 'NOT_s' });
  });

  it('should allow polymorphic lists of different event types', () => {
    const flow: FlowEvent = { ts: 'ts', ph: EventsPhase.FLOW_EVENTS_STEP };
    const duration: DurationEvent = {
      ts: 'ts',
      ph: EventsPhase.DURATION_EVENTS_BEGIN,
    };

    // should not type error
    const events: Event[] = [flow, duration];

    expect(events).toEqual([
      { ts: 'ts', ph: 't' },
      { ts: 'ts', ph: 'B' },
    ]);
  });

  it('should not allow polymorphic lists where any value is not a valid event type', () => {
    const flow: FlowEvent = { ts: 'ts', ph: EventsPhase.FLOW_EVENTS_STEP };
    const duration: DurationEvent = {
      ts: 'ts',
      ph: EventsPhase.DURATION_EVENTS_BEGIN,
    };
    const invalid = {
      ts: 'ts',
      ph: 'invalid',
    };

    // @ts-expect-error
    const events: Event[] = [flow, duration, invalid];

    expect(events).toEqual([
      { ts: 'ts', ph: 't' },
      { ts: 'ts', ph: 'B' },
      { ts: 'ts', ph: 'invalid' },
    ]);
  });

  it('should support type guards', () => {
    // If we want to ensure that a type is *actually* of the type
    // we want it to be instead of relying on type coercion/casting,
    // we can use a type guard
    //
    // See: https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
    function isFlowEvent(event: any): event is FlowEvent {
      return (
        event.ph === EventsPhase.FLOW_EVENTS_START ||
        event.ph === EventsPhase.FLOW_EVENTS_END ||
        event.ph === EventsPhase.FLOW_EVENTS_STEP
      );
    }

    // This function expects a flow event
    function expectsFlowEvent(event: FlowEvent): any {
      return event.ph;
    }

    // This
    const flowEventLike = { ts: 'ts', ph: 's' };

    // This fails, because string `s` is not coerced to EventsPhase
    // @ts-expect-error
    expectsFlowEvent(flowEventLike);

    // But if we use our type guard first...
    if (isFlowEvent(flowEventLike)) {
      // This will pass, because isFlowEvent type guard refines the type
      // by checking that the value matches the expected type
      expectsFlowEvent(flowEventLike);
    } else {
      // This will fail, because the value didn't match
      // @ts-expect-error
      expectsFlowEvent(flowEventLike);
    }
  });
});
