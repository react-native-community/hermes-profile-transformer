import { CpuProfilerModel } from '../profiler/cpuProfilerModel';
import { HermesCPUProfile } from '../types/HermesProfile';
import { EventsPhase } from '../types/Phases';
import { CPUProfileChunk } from 'types/CPUProfile';

describe('CPU Profiler Model', () => {
  let profile: HermesCPUProfile;
  let profileChunk: CPUProfileChunk;

  /**
   * Visual Representation
   * ---------1-----------
   *    -----2---------
   *       ----3----
   *          --4---
   *             -5-
   */

  beforeEach(() => {
    profile = {
      traceEvents: [],
      samples: [
        {
          cpu: '-1',
          name: '',
          ts: '1',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 1,
        },
        {
          cpu: '-1',
          name: '',
          ts: '2',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 3,
        },
        {
          cpu: '-1',
          name: '',
          ts: '3',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 4,
        },
        {
          cpu: '-1',
          name: '',
          ts: '4',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 5,
        },
        {
          cpu: '-1',
          name: '',
          ts: '5',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 2,
        },
        {
          cpu: '-1',
          name: '',
          ts: '6',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 1,
        },
        {
          cpu: '-1',
          name: '',
          ts: '7',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 3,
        },
      ],
      stackFrames: {
        '1': {
          line: '1',
          column: '1',
          funcLine: '1',
          funcColumn: '1',
          name: 'Func 1',
          category: 'JavaScript',
        },
        '2': {
          line: '2',
          column: '2',
          funcLine: '2',
          funcColumn: '2',
          name: 'Func 2',
          category: 'Typescript',
          parent: 1,
        },
        '3': {
          line: '3',
          column: '3',
          funcLine: '3',
          funcColumn: '3',
          name: 'Func 3',
          category: 'Python',
          parent: 2,
        },
        '4': {
          line: '4',
          column: '4',
          funcLine: '4',
          funcColumn: '4',
          name: 'Func 4',
          category: 'C++',
          parent: 3,
        },
        '5': {
          line: '5',
          column: '5',
          funcLine: '5',
          funcColumn: '5',
          name: 'Func 5',
          category: 'Swift',
          parent: 4,
        },
      },
    };
    profileChunk = CpuProfilerModel.collectProfileEvents(profile);
  });

  describe('Create Start and End Events', () => {
    it('Should create start and end events in order', () => {
      const profiler = new CpuProfilerModel(profileChunk);
      const chromeEvents = profiler.createStartEndEvents();
      expect(chromeEvents).toMatchObject([
        {
          ts: 1,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_BEGIN,
          name: 'Func 1',
          cat: 'JavaScript',
          args: {
            line: '1',
            column: '1',
            funcLine: '1',
            funcColumn: '1',
            name: 'Func 1',
            category: 'JavaScript',
            url: 'Func 1',
          },
        },
        {
          ts: 2,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_BEGIN,
          name: 'Func 2',
          cat: 'Typescript',
          args: {
            line: '2',
            column: '2',
            funcLine: '2',
            funcColumn: '2',
            name: 'Func 2',
            category: 'Typescript',
            url: 'Func 2',
          },
        },
        {
          ts: 2,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_BEGIN,
          name: 'Func 3',
          cat: 'Python',
          args: {
            line: '3',
            column: '3',
            funcLine: '3',
            funcColumn: '3',
            name: 'Func 3',
            category: 'Python',
            url: 'Func 3',
          },
        },
        {
          ts: 3,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_BEGIN,
          name: 'Func 4',
          cat: 'C++',
          args: {
            line: '4',
            column: '4',
            funcLine: '4',
            funcColumn: '4',
            name: 'Func 4',
            category: 'C++',
            url: 'Func 4',
          },
        },
        {
          ts: 4,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_BEGIN,
          name: 'Func 5',
          cat: 'Swift',
          args: {
            line: '5',
            column: '5',
            funcLine: '5',
            funcColumn: '5',
            name: 'Func 5',
            category: 'Swift',
            url: 'Func 5',
          },
        },
        {
          ts: 5,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_END,
          name: 'Func 5',
          cat: 'Swift',
          args: {
            line: '5',
            column: '5',
            funcLine: '5',
            funcColumn: '5',
            name: 'Func 5',
            category: 'Swift',
            url: 'Func 5',
          },
        },
        {
          ts: 5,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_END,
          name: 'Func 4',
          cat: 'C++',
          args: {
            line: '4',
            column: '4',
            funcLine: '4',
            funcColumn: '4',
            name: 'Func 4',
            category: 'C++',
            url: 'Func 4',
          },
        },
        {
          ts: 5,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_END,
          name: 'Func 3',
          cat: 'Python',
          args: {
            line: '3',
            column: '3',
            funcLine: '3',
            funcColumn: '3',
            name: 'Func 3',
            category: 'Python',
            url: 'Func 3',
          },
        },
        {
          ts: 6,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_END,
          name: 'Func 2',
          cat: 'Typescript',
          args: {
            line: '2',
            column: '2',
            funcLine: '2',
            funcColumn: '2',
            name: 'Func 2',
            category: 'Typescript',
            url: 'Func 2',
          },
        },
        {
          ts: 7,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_BEGIN,
          name: 'Func 2',
          cat: 'Typescript',
          args: {
            line: '2',
            column: '2',
            funcLine: '2',
            funcColumn: '2',
            name: 'Func 2',
            category: 'Typescript',
            url: 'Func 2',
          },
        },
        {
          ts: 7,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_BEGIN,
          name: 'Func 3',
          cat: 'Python',
          args: {
            line: '3',
            column: '3',
            funcLine: '3',
            funcColumn: '3',
            name: 'Func 3',
            category: 'Python',
            url: 'Func 3',
          },
        },
        {
          ts: 7,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_END,
          name: 'Func 3',
          cat: 'Python',
          args: {
            line: '3',
            column: '3',
            funcLine: '3',
            funcColumn: '3',
            name: 'Func 3',
            category: 'Python',
            url: 'Func 3',
          },
        },
        {
          ts: 7,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_END,
          name: 'Func 2',
          cat: 'Typescript',
          args: {
            line: '2',
            column: '2',
            funcLine: '2',
            funcColumn: '2',
            name: 'Func 2',
            category: 'Typescript',
            url: 'Func 2',
          },
        },
        {
          ts: 7,
          pid: 6052,
          tid: 6105,
          ph: EventsPhase.DURATION_EVENTS_END,
          name: 'Func 1',
          cat: 'JavaScript',
          args: {
            line: '1',
            column: '1',
            funcLine: '1',
            funcColumn: '1',
            name: 'Func 1',
            category: 'JavaScript',
            url: 'Func 1',
          },
        },
      ]);
    });

    it('Should have a single process and thread Id', () => {
      const profileChunk = CpuProfilerModel.collectProfileEvents(profile);
      const profiler = new CpuProfilerModel(profileChunk);
      const chromeEvents = profiler.createStartEndEvents();
      const uniqueProcessIds = chromeEvents
        .map(event => event.pid)
        .filter((value, index, self) => self.indexOf(value) === index);

      const uniqueThreadIds = chromeEvents
        .map(event => event.tid)
        .filter((value, index, self) => self.indexOf(value) === index);
      // One process id
      expect(uniqueProcessIds.length).toEqual(1);
      // One thread id
      expect(uniqueThreadIds.length).toEqual(1);
    });

    it('Should only have events of type Duration Event', () => {
      const profileChunk = CpuProfilerModel.collectProfileEvents(profile);
      const profiler = new CpuProfilerModel(profileChunk);
      const chromeEvents = profiler.createStartEndEvents();
      const uniquePhases = chromeEvents
        .map(event => event.ph)
        .filter((value, index, self) => self.indexOf(value) === index);
      // Only duration events supported as of now
      expect(uniquePhases).toMatchObject([
        EventsPhase.DURATION_EVENTS_BEGIN,
        EventsPhase.DURATION_EVENTS_END,
      ]);
    });

    it('Should create accurate Profile Chunks', () => {
      expect(profileChunk).toMatchObject({
        id: '0x1',
        pid: 6052,
        tid: '6105',
        startTime: 1,
        nodes: [
          {
            id: 1,
            callFrame: {
              line: '1',
              column: '1',
              funcLine: '1',
              funcColumn: '1',
              name: 'Func 1',
              category: 'JavaScript',
              url: 'Func 1',
            },
          },
          {
            id: 2,
            callFrame: {
              line: '2',
              column: '2',
              funcLine: '2',
              funcColumn: '2',
              name: 'Func 2',
              category: 'Typescript',
              url: 'Func 2',
            },
            parent: 1,
          },
          {
            id: 3,
            callFrame: {
              line: '3',
              column: '3',
              funcLine: '3',
              funcColumn: '3',
              name: 'Func 3',
              category: 'Python',
              url: 'Func 3',
            },
            parent: 2,
          },
          {
            id: 4,
            callFrame: {
              line: '4',
              column: '4',
              funcLine: '4',
              funcColumn: '4',
              name: 'Func 4',
              category: 'C++',
              url: 'Func 4',
            },
            parent: 3,
          },
          {
            id: 5,
            callFrame: {
              line: '5',
              column: '5',
              funcLine: '5',
              funcColumn: '5',
              name: 'Func 5',
              category: 'Swift',
              url: 'Func 5',
            },
            parent: 4,
          },
        ],
        samples: [1, 3, 4, 5, 2, 1, 3],
        timeDeltas: [0, 1, 1, 1, 1, 1, 1],
      });

      // The length of samples array should be equal to length of timeDeltas array
      expect(profileChunk.samples.length).toEqual(
        profileChunk.timeDeltas.length
      );

      // Atleast 2 samples must be present
      expect(profileChunk.samples.length).toBeGreaterThanOrEqual(2);

      // The first element of timeDeltas should be 0
      expect(profileChunk.timeDeltas[0]).toEqual(0);
    });
  });
});
