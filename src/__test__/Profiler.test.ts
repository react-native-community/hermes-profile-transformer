import { CpuProfilerModel } from '../profiler/cpuProfilerModel';

describe('CPUProfilerModel', () => {
  let profile;

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
          ts: '3',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 3,
        },
        {
          cpu: '-1',
          name: '',
          ts: '4',
          pid: 6052,
          tid: '6105',
          weight: '1',
          sf: 4,
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
      ],
      stackFrames: {
        '1': {
          name: 'Function 1',
          category: 'Test',
        },
        '2': {
          name: 'Function 2',
          category: 'Test',
        },
        '3': {
          name: 'Function 3',
          category: 'Test',
        },
        '4': {
          name: 'Function 4',
          category: 'Test',
        },
      },
    };
  });

  it('Should create events in order', async () => {
    const profileChunk = CpuProfilerModel.collectProfileEvents(profile);
    const profiler = new CpuProfilerModel(profileChunk);
    const chromeEvents = profiler.createStartEndEvents();
    expect(chromeEvents).toMatchObject([
      {
        ts: 2,
        pid: 6052,
        tid: 6105,
        ph: 'B',
        name: 'Function 1',
        cat: 'Test',
        args: { data: [Object] },
      },
      {
        ts: 4,
        pid: 6052,
        tid: 6105,
        ph: 'E',
        name: 'Function 1',
        cat: 'Test',
        args: { data: [Object] },
      },
      {
        ts: 4,
        pid: 6052,
        tid: 6105,
        ph: 'B',
        name: 'Function 3',
        cat: 'Test',
        args: { data: [Object] },
      },
      {
        ts: 5,
        pid: 6052,
        tid: 6105,
        ph: 'E',
        name: 'Function 3',
        cat: 'Test',
        args: { data: [Object] },
      },
      {
        ts: 5,
        pid: 6052,
        tid: 6105,
        ph: 'B',
        name: 'Function 4',
        cat: 'Test',
        args: { data: [Object] },
      },
      {
        ts: 6,
        pid: 6052,
        tid: 6105,
        ph: 'E',
        name: 'Function 4',
        cat: 'Test',
        args: { data: [Object] },
      },
      {
        ts: 6,
        pid: 6052,
        tid: 6105,
        ph: 'B',
        name: 'Function 2',
        cat: 'Test',
        args: { data: [Object] },
      },
      {
        ts: 6,
        pid: 6052,
        tid: 6105,
        ph: 'E',
        name: 'Function 2',
        cat: 'Test',
        args: { data: [Object] },
      },
    ]);
  });
});
