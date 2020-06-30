import { writeFileSync } from 'fs';
import { readData } from './utils/fileSystem';
import {
  HermesCPUProfile,
  HermesSample,
} from './types/hermesProfileInterfaces';
import {
  processSample,
  constructProcessGraph,
} from './utils/cpuProfileParsing';
import { SharedEventProperties } from './types/chromeEventInterfaces';

const HERMES_PROFILE_PATH: string = 'hermes_sample.cpuprofile';

const { samples, stackFrames }: HermesCPUProfile = readData(
  HERMES_PROFILE_PATH
);
const processed_samples: HermesSample[] = processSample(samples, stackFrames);
const events: SharedEventProperties[] = constructProcessGraph(
  processed_samples,
  stackFrames
);
// events.push(...traceEvents);
const sorted_events = events.sort((a, b) =>
  a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0
);
writeFileSync('data.json', JSON.stringify(sorted_events, null, 2));
