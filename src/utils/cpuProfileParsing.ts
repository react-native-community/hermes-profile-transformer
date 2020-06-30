import _ from 'lodash';
import {
  HermesSample,
  HermesStackFrame,
} from '../types/hermesProfileInterfaces';
import { CallGraph, Node } from './callGraph';
import { SharedEventProperties } from 'types/chromeEventInterfaces';

/* Converts our data into an intermediate form used for processing
 * For Example: samples => [{
 *    "cpu": "-1",
 *    "name": "",
 *    "ts": "142867379",
 *    "pid": 6052,
 *    "tid": "6105",
 *    "weight": "1",
 *    "sf": 16
 *}]. This function converts it to '6052:6105': [{
 *    "cpu": "-1",
 *   "name": "",
 *    "ts": "142867379",
 *    "pid": 6052,
 *    "tid": "6105",
 *    "weight": "1",
 *    "sf": 16
 *}]
 */
const getPidTid = (data: HermesSample[]) => {
  const pidTid: { [key in string]: HermesSample[] } = {};
  data.forEach((sample: HermesSample) => {
    const property = `${sample.pid}:${sample.tid}`;
    if (!(property in pidTid)) {
      pidTid[property] = [];
    }
    pidTid[property].push(sample);
  });
  return pidTid;
};

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
  const processThreads = getPidTid(samples);
  processes.forEach(process => {
    const pid = process.toString();
    const processEvents: HermesSample[] = samples.filter(
      sample => sample.pid.toString() === pid
    );
    const pidGraph: CallGraph = processGraph(processEvents, stackFrames);
    const keys: string[] = Object.keys(processThreads).filter(
      key => key.substring(0, process.toString().length) === process.toString()
    );
    keys.forEach(key => {
      /* Obtain pid and tid from Key
       const pid = key.substring(0, key.indexOf(':'));
       const tid = key.substring(key.indexOf(':') + 1); */
      const events = processThreads[key];
      events.forEach(event => pidGraph.addEvent(event));
    });
    const pidEvents: SharedEventProperties[] = pidGraph.setAllNodePhases(
      pidGraph.root
    );
    chromeEvents.push(...pidEvents);
  });
  return chromeEvents;
};
