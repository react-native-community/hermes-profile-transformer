import fs from 'fs';
import { parseHermesToLightHouse } from './lighthouse/hermesSampleToCPUProfileTransformer';

fs.writeFileSync(
  'lighthouse_compatible.json',
  JSON.stringify(
    parseHermesToLightHouse(
      JSON.parse(fs.readFileSync('hermes_sample.cpuprofile', 'utf-8'))
    )
  )
);
