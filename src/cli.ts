import { writeFileSync } from 'fs';
import ip from 'ip';
import path from 'path';
import minimist from 'minimist';

import { transformer } from './index';

const argv = minimist(process.argv.slice(2));

// Debug Server Port needs to be provided
if (!('port' in argv)) {
  console.log('No DEBUG_PORT provided, using 8081 by default');
} else {
  console.log(
    `Make sure the React Native Debugging server is running on port ${argv['port']} on your local machine`
  );
}

if (!('fileName' in argv)) {
  throw new Error('No bundleFileName provided');
}

/* Read Hermes Profile
 **Replace with CLI transform function as it will just give the path of the CPU profile,
 **adopting same model here
 */

const PROFILE_PATH = argv['fileName'];
const DEBUG_SERVER_PORT: string =
  argv['port'] || process.env.RCT_METRO_PORT || '8081';
const IP_ADDRESS = ip.address();
const PLATFORM = 'android';
const RN_SOURCE_MAP: string = `http://${IP_ADDRESS}:${DEBUG_SERVER_PORT}/index.map?platform=${PLATFORM}&dev=true`;
