import { SourceMap } from '../types/SourceMap';
import { SourceMapConsumer } from 'source-map';
import { DurationEvent } from '../types/EventInterfaces';
import { EventsPhase } from '../types/Phases';
import applySourceMapsToEvents from '../profiler/applySourceMapsToEvents';

const mockOriginalPositionFor = jest.fn();

jest.mock('source-map', () => ({
  SourceMapConsumer: jest.fn().mockImplementation(() => ({
    originalPositionFor: mockOriginalPositionFor.mockReturnValue({
      source: 'source.js',
      line: 1,
      column: 10,
      name: 'console.log',
    }),
    destroy: jest.fn(),
  })),
}));

describe('applySourceMapsToEvents', () => {
  let defaultEvents: DurationEvent[] = [];

  const mockSourceMap: SourceMap = {
    version: '3',
    sources: ['source.js'],
    sourceContent: ['console.log("Hello, World!");'],
    x_facebook_sources: null,
    names: ['console', 'log', 'Hello, World!'],
    mappings: 'AAAAA,QAAAC,IAAA',
  };

  beforeEach(() => {
    ((SourceMapConsumer as unknown) as jest.Mock).mockImplementation(() => ({
      originalPositionFor: mockOriginalPositionFor.mockReturnValue({
        source: 'source.js',
        line: 5,
        column: 10,
        name: 'console.log',
      }),
      destroy: jest.fn(),
    }));
    mockOriginalPositionFor.mockClear();

    // applySourceMapsToEvents modifies the events array, so we need to reset it before each test
    defaultEvents = [
      {
        ph: EventsPhase.DURATION_EVENTS_BEGIN,
        args: {
          line: 1,
          column: 1,
        },
        cat: 'default-category',
        name: 'event1',
        ts: 1000,
        pid: 1,
        tid: 1,
      },
      {
        ph: EventsPhase.DURATION_EVENTS_END,
        args: {
          line: 1,
          column: 1,
        },
        cat: 'default-category',
        name: 'event1',
        ts: 1010,
        pid: 1,
        tid: 1,
      },
    ];
  });

  describe('dev profiles', () => {
    it('should enhance events with source map information', async () => {
      const indexBundleFileName = 'index.bundle';
      const enhancedEvents = await applySourceMapsToEvents(
        mockSourceMap,
        defaultEvents,
        indexBundleFileName
      );

      expect(enhancedEvents).toEqual([
        expect.objectContaining({
          args: {
            url: 'source.js',
            line: 5,
            column: 10,
            params: 'console.log',
            allocatedCategory: 'default-category',
            allocatedName: 'event1',
            node_module: 'default-category',
          },
        }),
        expect.objectContaining({
          args: {
            url: 'source.js',
            line: 5,
            column: 10,
            params: 'console.log',
            allocatedCategory: 'default-category',
            allocatedName: 'event1',
            node_module: 'default-category',
          },
        }),
      ]);
    });

    it('should throw an error if args are not populated', async () => {
      const eventsWithMissingArgs: DurationEvent[] = [
        {
          ...defaultEvents[0],
          args: undefined as any,
        },
      ];

      await expect(
        applySourceMapsToEvents(mockSourceMap, eventsWithMissingArgs, undefined)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('production profiles', () => {
    it('should enhance events with source map information', async () => {
      const productionEvents: DurationEvent[] = [
        {
          ph: EventsPhase.DURATION_EVENTS_BEGIN,
          args: {
            funcVirtAddr: '5',
            offset: '7',
          },
          cat: 'default-category',
          name: 'event1',
          ts: 1000,
          pid: 1,
          tid: 1,
        },
        {
          ph: EventsPhase.DURATION_EVENTS_END,
          args: {
            funcVirtAddr: '5',
            offset: '7',
          },
          cat: 'default-category',
          name: 'event1',
          ts: 1010,
          pid: 1,
          tid: 1,
        },
      ];

      const indexBundleFileName = 'index.bundle';
      const enhancedEvents = await applySourceMapsToEvents(
        mockSourceMap,
        productionEvents,
        indexBundleFileName
      );

      expect(mockOriginalPositionFor).toHaveBeenCalledTimes(2);
      expect(mockOriginalPositionFor).toHaveBeenCalledWith({
        line: 1,
        column: 13,
      });

      expect(enhancedEvents).toEqual([
        expect.objectContaining({
          args: {
            url: 'source.js',
            line: 5,
            column: 10,
            funcVirtAddr: '5',
            offset: '7',
            params: 'console.log',
            allocatedCategory: 'default-category',
            allocatedName: 'event1',
            node_module: 'default-category',
          },
        }),
        expect.objectContaining({
          args: {
            url: 'source.js',
            line: 5,
            column: 10,
            funcVirtAddr: '5',
            offset: '7',
            params: 'console.log',
            allocatedCategory: 'default-category',
            allocatedName: 'event1',
            node_module: 'default-category',
          },
        }),
      ]);
    });
  });

  describe('setting event category', () => {
    it.each([
      {
        nodeModuleName: 'react-native',
        expectedCategory: 'react-native-internals',
      },
      { nodeModuleName: 'react', expectedCategory: 'react-native-internals' },
      { nodeModuleName: 'metro', expectedCategory: 'react-native-internals' },
      {
        nodeModuleName: 'other-module',
        expectedCategory: 'other_node_modules',
      },
    ])(
      'should correctly improve categories for node modules',
      async ({ nodeModuleName, expectedCategory }) => {
        ((SourceMapConsumer as unknown) as jest.Mock).mockImplementation(
          () => ({
            originalPositionFor: jest.fn().mockReturnValue({
              source: `/workdir/node_modules/${nodeModuleName}/index.js`,
              line: 1,
              column: 10,
              name: 'console.log',
            }),
            destroy: jest.fn(),
          })
        );

        const enhancedEvents = await applySourceMapsToEvents(
          mockSourceMap,
          defaultEvents,
          undefined
        );

        expect(enhancedEvents).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              cat: expectedCategory,
            }),
          ])
        );
      }
    );

    it('should default to the source as the category', async () => {
      ((SourceMapConsumer as unknown) as jest.Mock).mockImplementation(() => ({
        originalPositionFor: jest.fn().mockReturnValue({
          source: `asdfasd.js`,
          line: 1,
          column: 10,
          name: 'console.log',
        }),
        destroy: jest.fn(),
      }));

      const enhancedEvents = await applySourceMapsToEvents(
        mockSourceMap,
        defaultEvents,
        undefined
      );

      expect(enhancedEvents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            cat: 'default-category',
          }),
        ])
      );
    });
  });
});
