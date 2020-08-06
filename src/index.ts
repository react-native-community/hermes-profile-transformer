import { promises } from 'fs';

import { CpuProfilerModel } from './profiler/cpuProfilerModel';
import { changeNamesToSourceMaps } from './profiler/sourceMapper';
import { DurationEvent, SourceMap } from 'types/EventInterfaces';

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
  const hermesProfile = JSON.parse(
    await promises.readFile(profilePath, 'utf-8')
  );
  const profileChunk = CpuProfilerModel.collectProfileEvents(hermesProfile);
  const profiler = new CpuProfilerModel(profileChunk);
  const chromeEvents = profiler.createStartEndEvents();
  if (sourceMapPath) {
    const sourceMap: SourceMap = JSON.parse(
      await promises.readFile(sourceMapPath, 'utf-8')
    );
    const events = changeNamesToSourceMaps(
      sourceMap,
      chromeEvents,
      bundleFileName
    );
    return events;
  }
  return chromeEvents;
};
