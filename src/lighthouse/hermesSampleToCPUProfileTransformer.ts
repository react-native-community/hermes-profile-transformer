import {
  HermesCPUProfile,
  HermesSample,
  HermesStackFrame,
} from '../types/HermesEventInterfaces';

export interface CPUProfileChunk {
  id: string;
  pid: number;
  tid: string;
  startTime: number;
  nodes: CPUProfileChunkNode[];
  samples: number[];
  timeDeltas: number[];
}

export interface CPUProfileChunkNode {
  id: number;
  callFrame: {
    line: string;
    column: string;
    funcLine: string;
    funcColumn: string;
    name: string;
    url?: string;
    category: string;
  };
  parent?: number;
}

export const parseHermesToLightHouse = (
  profile: HermesCPUProfile
): CPUProfileChunk => {
  const pid: number = profile.samples[0].pid;
  const tid: string = profile.samples[0].tid;
  const id: string = '0x1';
  const startTime: number = Number(profile.samples[0].ts);
  const { nodes, samples, timeDeltas } = constructNodes(
    profile.samples,
    profile.stackFrames
  );
  return {
    id,
    pid,
    tid,
    startTime,
    nodes,
    samples,
    timeDeltas,
  };
};

const constructNodes = (
  samples: HermesSample[],
  stackFrames: { [key in string]: HermesStackFrame }
): {
  nodes: CPUProfileChunkNode[];
  samples: number[];
  timeDeltas: number[];
} => {
  samples = samples.map(sample => {
    sample.stackFrameData = stackFrames[sample.sf];
    return sample;
  });
  const profileNodes = Object.keys(stackFrames).map((stackFrameId: string) => {
    return {
      id: Number(stackFrameId),
      callFrame: {
        line: stackFrames[stackFrameId].line,
        column: stackFrames[stackFrameId].column,
        funcLine: stackFrames[stackFrameId].funcLine,
        funcColumn: stackFrames[stackFrameId].funcColumn,
        name: stackFrames[stackFrameId].name,
        category: stackFrames[stackFrameId].category,
        url: 'TODO',
      },
      parent: stackFrames[stackFrameId].parent,
    };
  });
  const returnedSamples: number[] = [];
  const timeDeltas: number[] = [];
  samples.forEach((sample: HermesSample, idx: number) => {
    returnedSamples.push(sample.sf);
    if (idx === 0) {
      timeDeltas.push(Number(sample.ts) / 1000);
    } else {
      const timeDiff = Number(sample.ts) - timeDeltas[idx - 1];
      timeDeltas.push(timeDiff / 1000);
    }
  });

  return {
    nodes: profileNodes,
    samples: returnedSamples,
    timeDeltas,
  };
};
