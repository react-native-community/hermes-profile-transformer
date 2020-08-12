import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { DurationEvent } from '../types/EventInterfaces';
import { SourceMap } from '../types/SourceMaps';

/**
 * Refer to the source maps for the bundleFileName. Throws error if args not set up in ChromeEvents
 * @param {SourceMap} sourceMap
 * @param {DurationEvent[]} chromeEvents
 * @param {string} indexBundleFileName
 * @throws If `args` for events are not populated
 * @returns {DurationEvent[]}
 */
export const changeNamesToSourceMaps = async (
  sourceMap: SourceMap,
  chromeEvents: DurationEvent[],
  indexBundleFileName: string | undefined
): Promise<DurationEvent[]> => {
  // SEE: Should file here be an optional parameter, so take indexBundleFileName as a parameter and use
  // a default name of `index.bundle`
  const rawSourceMap: RawSourceMap = {
    version: Number(sourceMap.version),
    file: indexBundleFileName || 'index.bundle',
    sources: sourceMap.sources,
    mappings: sourceMap.mappings,
    names: sourceMap.names,
  };

  const consumer = await new SourceMapConsumer(rawSourceMap);
  const events = chromeEvents.map((event: DurationEvent) => {
    if (event.args) {
      const sm = consumer.originalPositionFor({
        line: Number(event.args.data.callFrame.line),
        column: Number(event.args.data.callFrame.column),
      });
      event.args = {
        data: {
          callFrame: {
            ...event.args?.data.callFrame,
            url: sm.source,
            line: sm.line,
            column: sm.column,
          },
        },
      };
      /**
       * The name in source maps (for reasons I don't understand) is sometimes null, so OR-ing this
       * to ensure a name is assigned.
       * In case a name wasn't found, the URL is used
       * Eg: /Users/saphal/Desktop/app/node_modules/react-native/Libraries/BatchedBridge/MessageQueue.js => MessageQueue.js
       */
      event.name =
        sm.name ||
        (event.args.data.callFrame.url
          ? `anonymous @ ${event.args.data.callFrame.url.split('/').pop()}`
          : event.args.data.callFrame.name);
    } else {
      throw new Error(
        `Source maps could not be derived for an event at ${event.ts} and with stackFrame ID ${event.sf}`
      );
    }
    return event;
  });
  consumer.destroy();
  return events;
};
