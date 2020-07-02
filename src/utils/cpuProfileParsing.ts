import _ from 'lodash';
import { writeFileSync } from 'fs';
import {
  HermesSample,
  HermesStackFrame,
} from '../types/hermesProfileInterfaces';
import { CallGraph, Node } from './callGraph';
import { SharedEventProperties } from 'types/chromeEventInterfaces';

/* 
Obtain List of All processes in the Hermes Profile
 */
const getProcesses = (data: HermesSample[]) => {
  return data
    .map((sample: HermesSample) => sample.pid)
    .filter((value, index, self) => self.indexOf(value) === index);
};

export const processSample = (
  samples: HermesSample[],
  stackFrames: { [key in string]: HermesStackFrame }
) => {
  return samples.map((sample: HermesSample) => {
    const stackFrameId: string = sample.sf.toString();
    sample.stackFrameData = { ...stackFrames[stackFrameId] };
    sample.name = sample.stackFrameData.name;
    return sample;
  });
};

const findRootNode = (
  stackFrameId: number,
  stackFrames: { [key in string]: HermesStackFrame }
): number => {
  const sf: string = stackFrameId.toString();
  if (stackFrames[sf].parent) {
    return findRootNode(stackFrames[sf].parent!, stackFrames);
  } else {
    return stackFrameId;
  }
};

const processGraph = (
  samples: HermesSample[],
  stackFrames: { [key in string]: HermesStackFrame }
): CallGraph => {
  /* Get Root Event for process (to make a call graph) */
  const allowedSfIds: number[] = _.uniqBy(samples, 'sf').map(event => event.sf);
  const root: number = findRootNode(allowedSfIds[0], stackFrames);
  const processCallGraph: CallGraph = new CallGraph(new Node(root, []));
  for (let property in stackFrames) {
    const parent = stackFrames[property].parent;
    if (parent) {
      processCallGraph.addNode(property, parent.toString());
    }
  }
  return processCallGraph;
};

export const constructProcessGraph = (
  samples: HermesSample[],
  stackFrames: { [key in string]: HermesStackFrame }
): SharedEventProperties[] => {
  const chromeEvents: SharedEventProperties[] = [];
  const processes: number[] = getProcesses(samples);
  processes.forEach(process => {
    const pid = process.toString();
    const processEvents: HermesSample[] = samples.filter(
      sample => sample.pid.toString() === pid
    );
    const pidGraph: CallGraph = processGraph(processEvents, stackFrames);
    processEvents.forEach(event => pidGraph.addEvent(event));
    const pidEvents: SharedEventProperties[] = pidGraph.setAllNodePhases(
      pidGraph.root
    );
    console.log(
      `The depth of the process tree ${pid} is ${pidGraph.graphDepth(
        pidGraph.root
      )}`
    );
    writeFileSync('graph.json', JSON.stringify(pidGraph, null, 2));
    chromeEvents.push(...pidEvents);
  });
  return chromeEvents;
};
