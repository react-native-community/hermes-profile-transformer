import { CpuProfilerModel } from './profiler/cpuProfilerModel';
import { DurationEvent } from './types/EventInterfaces';
import { readFile } from './utils/fileSystem';
import { HermesCPUProfile } from './types/HermesProfile';
import { changeNamesToSourceMaps } from './profiler/sourceMapper';
import { SourceMap } from './types/SourceMaps';

/**
 * This transformer can take in the path of the profile, the source map (optional) and the bundle file name (optional)
 * and return a promise which resolves to Chrome Dev Tools compatible events
 * @param profilePath string
 * @param sourceMapPath string
 * @param bundleFileName string
 * @return Promise<DurationEvent[]>
 */
export const transformer = async (
  profilePath: string,
  sourceMapPath: string | undefined,
  bundleFileName: string | undefined
): Promise<DurationEvent[]> => {
  const hermesProfile: HermesCPUProfile = await readFile(profilePath);
  const profileChunk = CpuProfilerModel.collectProfileEvents(hermesProfile);
  const profiler = new CpuProfilerModel(profileChunk);
  const chromeEvents = profiler.createStartEndEvents();
  if (sourceMapPath) {
    const sourceMap: SourceMap = await readFile(sourceMapPath);
    const events = changeNamesToSourceMaps(
      sourceMap,
      chromeEvents,
      bundleFileName
    );
    return events;
  }
  return chromeEvents;
};

transformer(
  '/Users/zomato/Desktop/hermes-test-profile/xyz.cpuprofile',
  undefined,
  undefined
).catch(err => console.log(err));
