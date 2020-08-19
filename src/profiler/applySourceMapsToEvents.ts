import path from 'path';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { DurationEvent } from '../types/EventInterfaces';
import { SourceMap } from '../types/SourceMap';

/**
 * This function is a helper to the applySourceMapsToEvents. The node_module identification logic is implemented here based on the sourcemap url (if available). Incase a node_module could not be found, this defaults to the category of the event
 * @param defaultCategory The category the event is of by default without the use of Source maps
 * @param url The URL which can be parsed to interpret the new category of the event (depends on node_modules)
 */
const findNodeModuleNameIfExists = (
  defaultCategory: string,
  url: string | null
): string => {
  const obtainCategory = (url: string): string => {
    const dirs = url
      .substring(url.lastIndexOf(`${path.sep}node_modules${path.sep}`))
      .split(path.sep);
    return dirs.length > 2 && dirs[1] === 'node_modules'
      ? dirs[2]
      : defaultCategory;
  };
  return url ? obtainCategory(url) : defaultCategory;
};

/**
 * The unification of categories is important as we want identify the specific reasons why the application slows down, namely via unoptimised native/JS code, or react-native renders or third party modules. The common colours for node_modules can help idenitfy problems instantly
 * @param nodeModuleName The node module name associated with the event obtained via sourcemap, this nodeModule name is simply the output of @see findNodeModuleNameIfExists
 */
const improveCategories = (
  nodeModuleName: string,
  defaultCategory: string
): string => {
  // The nodeModuleName obtained from `findNodeModuleNameIfExists` by default is the original category name in the generated Hermes Profile. If we cannot isolate a nodeModule name, we simply return with the default category
  if (nodeModuleName === defaultCategory) {
    return defaultCategory;
  }
  // The events from these modules will fall under the umbrella of react-native events and hence be represented by the same colour
  const reactNativeModuleNames = ['react-native', 'react', 'metro'];
  if (reactNativeModuleNames.includes(nodeModuleName)) {
    return 'react-native-internals';
  } else {
    return 'other_node_modules';
  }
};

/**
 * Enhances the function line, column and params information and event categories
 * based on JavaScript source maps to make it easier to associate trace events with
 * the application code
 *
 * Throws error if args not set up in ChromeEvents
 * @param {SourceMap} sourceMap
 * @param {DurationEvent[]} chromeEvents
 * @param {string} indexBundleFileName
 * @throws If `args` for events are not populated
 * @returns {DurationEvent[]}
 */
const applySourceMapsToEvents = async (
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
        line: Number(event.args.line),
        column: Number(event.args.column),
      });
      /**
       * The categories can help us better visualise the profile if we modify the categories.
       * We change these categories only in the root level and not deeper inside the args, just so we have our
       * original categories as well as these modified categories (as the modified categories simply help with visualisation)
       */
      const nodeModuleNameIfAvailable = findNodeModuleNameIfExists(
        event.cat!,
        sm.source
      );
      event.cat = improveCategories(nodeModuleNameIfAvailable, event.cat!);
      event.args = {
        ...event.args,
        url: sm.source,
        line: sm.line,
        column: sm.column,
        params: sm.name,
        allocatedCategory: event.cat,
        allocatedName: event.name,
        node_module: nodeModuleNameIfAvailable,
      };
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

export default applySourceMapsToEvents;
