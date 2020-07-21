import fs from 'fs';
import { CpuProfilerModel } from './profiler/cpuProfilerModel';

// Read Hermes Profile
// Replace with CLI transform function as it will just give the path of the CPU profile,
// adopting same model here

const PROFILE_PATH = 'nestedFuncProfile.cpuprofile';
const hermesProfile = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf-8'));
const profileChunk = CpuProfilerModel.collectProfileEvents(hermesProfile);
const profiler = new CpuProfilerModel(profileChunk);
const chromeEvents = profiler.createStartEndEvents();
fs.writeFileSync('chrome_events.json', JSON.stringify(chromeEvents));
