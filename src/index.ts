import { readFileSync, writeFileSync } from 'fs';
import ip from 'ip';
import minimist from 'minimist';

import { CpuProfilerModel } from './profiler/cpuProfilerModel';
import { DurationEvent } from 'types/EventInterfaces';

const argv = minimist(process.argv.slice(2));
if (!('port' in argv)) {
  console.log('No DEBUG_PORT provided, using 8081 by default');
} else {
  console.log(
    `Make sure the React Native Debugging server is running on port ${argv['port']} on your local machine`
  );
}

/* Read Hermes Profile
 **Replace with CLI transform function as it will just give the path of the CPU profile,
 **adopting same model here
 */

const PROFILE_PATH = 'nestedFuncProfile.cpuprofile';
const DEBUG_SERVER_PORT: string =
  argv['port'] || process.env.RCT_METRO_PORT || '8081';
const IP_ADDRESS = ip.address();
const PLATFORM = 'android';
const RN_SOURCE_MAP: string = `http://${IP_ADDRESS}:${DEBUG_SERVER_PORT}/index.map?platform=${PLATFORM}&dev=true`;
const hermesProfile = JSON.parse(readFileSync(PROFILE_PATH, 'utf-8'));

const profileChunk = CpuProfilerModel.collectProfileEvents(hermesProfile);
const profiler = new CpuProfilerModel(profileChunk);
const chromeEvents = profiler.createStartEndEvents();

/**
 * This function currently takes the input as the RN_SOURCE_MAP URL, however we need to convert this to
 * take in sourceMap
 * @see {CpuProfilerModel.changeNamesToSourceMaps}
 */
CpuProfilerModel.changeNamesToSourceMaps(RN_SOURCE_MAP, chromeEvents).then(
  (events: DurationEvent[]) => {
    writeFileSync('chrome_events.json', JSON.stringify(events));
  }
);
