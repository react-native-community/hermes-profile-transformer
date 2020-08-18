import { CpuProfilerModel } from '../profiler/cpuProfilerModel';
import { HermesCPUProfile } from '../types/HermesProfile';
import { EventsPhase } from '../types/Phases';
import { CPUProfileChunk } from 'types/CPUProfile';

const uniq = <T>(arr: T[]) => {
  return Array.from(new Set(arr));
};

// prettier-ignore
const sampleProfile: HermesCPUProfile = {
  traceEvents: [], 
  samples: [ 
    { cpu: '-1', name: '', ts: '1', pid: 6052, tid: '6105', weight: '1', sf: 1, }, 
    { cpu: '-1', name: '', ts: '2', pid: 6052, tid: '6105', weight: '1', sf: 3, }, 
    { cpu: '-1', name: '', ts: '3', pid: 6052, tid: '6105', weight: '1', sf: 4, }, 
    { cpu: '-1', name: '', ts: '4', pid: 6052, tid: '6105', weight: '1', sf: 5, }, 
    { cpu: '-1', name: '', ts: '5', pid: 6052, tid: '6105', weight: '1', sf: 2, }, 
    { cpu: '-1', name: '', ts: '6', pid: 6052, tid: '6105', weight: '1', sf: 1, }, 
    { cpu: '-1', name: '', ts: '7', pid: 6052, tid: '6105', weight: '1', sf: 3, }, 
  ], 
  stackFrames: { 
    '1': { line: '1', column: '1', funcLine: '1', funcColumn: '1', name: 'Func 1', category: 'JavaScript', }, 
    '2': { line: '2', column: '2', funcLine: '2', funcColumn: '2', name: 'Func 2', category: 'Typescript', parent: 1, }, 
    '3': { line: '3', column: '3', funcLine: '3', funcColumn: '3', name: 'Func 3', category: 'Python', parent: 2, }, 
    '4': { line: '4', column: '4', funcLine: '4', funcColumn: '4', name: 'Func 4', category: 'C++', parent: 3, }, 
    '5': { line: '5', column: '5', funcLine: '5', funcColumn: '5', name: 'Func 5', category: 'Swift', parent: 4, }, 
  }, 
};

describe(CpuProfilerModel, () => {
  describe(CpuProfilerModel.prototype.createStartEndEvents, () => {
    /**
     * Visual Representation
     * ---------1-----------
     *    -----2---------
     *       ----3----
     *          --4---
     *             -5-
     */

    it('should create start and end events in order', () => {
      const profileChunk: CPUProfileChunk = CpuProfilerModel.collectProfileEvents(
        sampleProfile
      );
      const profiler = new CpuProfilerModel(profileChunk);
      const chromeEvents = profiler.createStartEndEvents();
      expect(chromeEvents).toMatchObject([
        { ts: 1, ph: EventsPhase.DURATION_EVENTS_BEGIN },
        { ts: 2, ph: EventsPhase.DURATION_EVENTS_BEGIN },
        { ts: 2, ph: EventsPhase.DURATION_EVENTS_BEGIN },
        { ts: 3, ph: EventsPhase.DURATION_EVENTS_BEGIN },
        { ts: 4, ph: EventsPhase.DURATION_EVENTS_BEGIN },
        { ts: 5, ph: EventsPhase.DURATION_EVENTS_END },
        { ts: 5, ph: EventsPhase.DURATION_EVENTS_END },
        { ts: 5, ph: EventsPhase.DURATION_EVENTS_END },
        { ts: 6, ph: EventsPhase.DURATION_EVENTS_END },
        { ts: 7, ph: EventsPhase.DURATION_EVENTS_BEGIN },
        { ts: 7, ph: EventsPhase.DURATION_EVENTS_BEGIN },
        { ts: 7, ph: EventsPhase.DURATION_EVENTS_END },
        { ts: 7, ph: EventsPhase.DURATION_EVENTS_END },
        { ts: 7, ph: EventsPhase.DURATION_EVENTS_END },
      ]);
    });

    it('should have a single process and thread Id', () => {
      const profileChunk = CpuProfilerModel.collectProfileEvents(sampleProfile);
      const profiler = new CpuProfilerModel(profileChunk);
      const chromeEvents = profiler.createStartEndEvents();
      const uniqueProcessIds = uniq(chromeEvents.map(event => event.pid));
      const uniqueThreadIds = uniq(chromeEvents.map(event => event.tid));
      // Hermes stuff
      expect(uniqueProcessIds).toHaveLength(1);
      // Hermes stuff
      expect(uniqueThreadIds).toHaveLength(1);
    });

    // Currently the implementation supports Duration Events, and the repo has interfaces defined for other event types as well.
    // Ideally, we would want to test for all event types, but for our current use cases Duration Events shall suffice.
    it('should only have events of type Duration Event', () => {
      const profileChunk = CpuProfilerModel.collectProfileEvents(sampleProfile);
      const profiler = new CpuProfilerModel(profileChunk);
      const chromeEvents = profiler.createStartEndEvents();
      const uniquePhases = uniq(chromeEvents.map(event => event.ph));
      expect(uniquePhases).toEqual(
        expect.arrayContaining([
          EventsPhase.DURATION_EVENTS_BEGIN,
          EventsPhase.DURATION_EVENTS_END,
        ])
      );
      expect(uniquePhases).toHaveLength(2);
    });
  });

  describe(CpuProfilerModel.collectProfileEvents, () => {
    it('should create accurate Profile Chunks', () => {
      const profileChunk = CpuProfilerModel.collectProfileEvents(sampleProfile);
      expect(profileChunk).toMatchObject({
        id: '0x1',
        pid: 6052,
        tid: '6105',
        startTime: 1,
        // prettier-ignore
        nodes: [
          { id: 1, callFrame: { line: '1', column: '1', funcLine: '1', funcColumn: '1', name: 'Func 1', category: 'JavaScript', url: 'Func 1', }, },
          { id: 2, callFrame: { line: '2', column: '2', funcLine: '2', funcColumn: '2', name: 'Func 2', category: 'Typescript', url: 'Func 2', }, parent: 1, },
          { id: 3, callFrame: { line: '3', column: '3', funcLine: '3', funcColumn: '3', name: 'Func 3', category: 'Python', url: 'Func 3', }, parent: 2, },
          { id: 4, callFrame: { line: '4', column: '4', funcLine: '4', funcColumn: '4', name: 'Func 4', category: 'C++', url: 'Func 4', }, parent: 3, },
          { id: 5, callFrame: { line: '5', column: '5', funcLine: '5', funcColumn: '5', name: 'Func 5', category: 'Swift', url: 'Func 5', }, parent: 4, },
        ],
        samples: [1, 3, 4, 5, 2, 1, 3],
        timeDeltas: [0, 1, 1, 1, 1, 1, 1],
      });

      expect(profileChunk.samples.length).toEqual(
        profileChunk.timeDeltas.length
      );

      // Would want at least start and end events at two different timestamps
      expect(profileChunk.samples.length).toBeGreaterThanOrEqual(2);

      // Events displayed in flamechart have timestamps relative to the profile
      // event's startTime. Source: https://github.com/v8/v8/blob/44bd8fd7/src/inspector/js_protocol.json#L1486
      expect(profileChunk.timeDeltas[0]).toEqual(0);
    });
  });
});
