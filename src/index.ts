import { promises } from 'fs';

import { CpuProfilerModel } from './profiler/cpuProfilerModel';
import { changeNamesToSourceMaps } from './profiler/sourceMapper';
import { DurationEvent, SourceMap } from 'types/EventInterfaces';

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
