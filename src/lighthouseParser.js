/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';
const fs = require('fs');
/**
 * @fileoverview
 *
 * This model converts the `Profile` and `ProfileChunk` mega trace events from the `disabled-by-default-v8.cpu_profiler`
 * category into B/E-style trace events that main-thread-tasks.js already knows how to parse into a task tree.
 *
 * The CPU profiler measures where time is being spent by sampling the stack (See https://www.jetbrains.com/help/profiler/Profiling_Guidelines__Choosing_the_Right_Profiling_Mode.html
 * for a generic description of the differences between tracing and sampling).
 *
 * A `Profile` event is a record of the stack that was being executed at different sample points in time.
 * It has a structure like this:
 *
 *    nodes: [function A, function B, function C]
 *    samples: [node with id 2, node with id 1, ...]
 *    timeDeltas: [4125μs since last sample, 121μs since last sample, ...]
 *
 * Helpful prior art:
 * @see https://cs.chromium.org/chromium/src/third_party/devtools-frontend/src/front_end/sdk/CPUProfileDataModel.js?sq=package:chromium&g=0&l=42
 * @see https://github.com/v8/v8/blob/99ca333b0efba3236954b823101315aefeac51ab/tools/profile.js
 * @see https://github.com/jlfwong/speedscope/blob/9ed1eb192cb7e9dac43a5f25bd101af169dc654a/src/import/chrome.ts#L200
 */

/**
 * @typedef CpuProfile
 * @property {string} id
 * @property {number} pid
 * @property {number} tid
 * @property {number} startTime
 * @property {Required<LH.TraceCpuProfile>['nodes']} nodes
 * @property {Array<number>} samples
 * @property {Array<number>} timeDeltas
 */

class CpuProfilerModel {
  /**
   * @param {CpuProfile} profile
   */
  constructor(profile) {
    this._profile = profile;
    this._nodesById = this._createNodeMap();
    this._activeNodeArraysById = this._createActiveNodeArrays();
  }

  /**
   * Initialization function to enable O(1) access to nodes by node ID.
   * @return {Map<number, CpuProfile['nodes'][0]>}
   */
  _createNodeMap() {
    /** @type {Map<number, CpuProfile['nodes'][0]>} */
    const map = new Map();
    for (const node of this._profile.nodes) {
      map.set(node.id, node);
    }

    return map;
  }

  /**
   * Initialization function to enable O(1) access to the set of active nodes in the stack by node ID.
   * @return {Map<number, Array<number>>}
   */
  _createActiveNodeArrays() {
    /** @type {Map<number, Array<number>>} */
    const map = new Map();
    /** @param {number} id @return {Array<number>} */
    const getActiveNodes = id => {
      if (map.has(id)) return map.get(id) || [];

      const node = this._nodesById.get(id);
      if (!node) throw new Error(`No such node ${id}`);
      if (typeof node.parent === 'number') {
        const array = getActiveNodes(node.parent).concat([id]);
        map.set(id, array);
        return array;
      } else {
        return [id];
      }
    };

    for (const node of this._profile.nodes) {
      map.set(node.id, getActiveNodes(node.id));
    }

    return map;
  }

  /**
   * Returns all the node IDs in a stack when a specific nodeId is at the top of the stack
   * (i.e. a stack's node ID and the node ID of all of its parents).
   *
   * @param {number} nodeId
   * @return {Array<number>}
   */
  _getActiveNodeIds(nodeId) {
    const activeNodeIds = this._activeNodeArraysById.get(nodeId);
    if (!activeNodeIds) throw new Error(`No such node ID ${nodeId}`);
    return activeNodeIds;
  }

  /**
   * Generates the necessary B/E-style trace events for a single transition from stack A to stack B
   * at the given timestamp.
   *
   * Example:
   *
   *    timestamp 1234
   *    previousNodeIds 1,2,3
   *    currentNodeIds 1,2,4
   *
   *    yields [end 3 at ts 1234, begin 4 at ts 1234]
   *
   * @param {number} timestamp
   * @param {Array<number>} previousNodeIds
   * @param {Array<number>} currentNodeIds
   * @return {Array<LH.TraceEvent>}
   */
  _createStartEndEventsForTransition(
    timestamp,
    previousNodeIds,
    currentNodeIds
  ) {
    const startNodes = currentNodeIds
      .filter(id => !previousNodeIds.includes(id))
      .map(id => this._nodesById.get(id))
      .filter(/** @return {node is CpuProfile['nodes'][0]} */ node => !!node);
    const endNodes = previousNodeIds
      .filter(id => !currentNodeIds.includes(id))
      .map(id => this._nodesById.get(id))
      .filter(/** @return {node is CpuProfile['nodes'][0]} */ node => !!node);

    /** @param {CpuProfile['nodes'][0]} node @return {LH.TraceEvent} */
    const createEvent = node => ({
      ts: timestamp,
      pid: this._profile.pid,
      tid: this._profile.tid,
      dur: 0,
      ph: 'B',
      name: node.callFrame.name,
      cat: 'lighthouse',
      args: { data: { callFrame: node.callFrame } },
    });

    /** @type {Array<LH.TraceEvent>} */
    const startEvents = startNodes
      .map(createEvent)
      .map(evt => ({ ...evt, ph: 'B' }));
    /** @type {Array<LH.TraceEvent>} */
    const endEvents = endNodes
      .map(createEvent)
      .map(evt => ({ ...evt, ph: 'E' }));
    return [...endEvents.reverse(), ...startEvents];
  }

  /**
   * Creates B/E-style trace events from a CpuProfile object created by `collectProfileEvents()`
   *
   * @return {Array<LH.TraceEvent>}
   */
  createStartEndEvents() {
    const profile = this._profile;
    const length = profile.samples.length;
    if (profile.timeDeltas.length !== length)
      throw new Error(`Invalid CPU profile length`);

    /** @type {Array<LH.TraceEvent>} */
    const events = [];

    let timestamp = profile.startTime;
    /** @type {Array<number>} */
    let lastActiveNodeIds = [];
    for (let i = 0; i < profile.samples.length; i++) {
      const nodeId = profile.samples[i];
      const timeDelta = Math.max(profile.timeDeltas[i], 1);
      const node = this._nodesById.get(nodeId);
      if (!node) throw new Error(`Missing node ${nodeId}`);

      timestamp += timeDelta;
      const activeNodeIds = this._getActiveNodeIds(nodeId);
      events.push(
        ...this._createStartEndEventsForTransition(
          timestamp,
          lastActiveNodeIds,
          activeNodeIds
        )
      );
      lastActiveNodeIds = activeNodeIds;
    }

    events.push(
      ...this._createStartEndEventsForTransition(
        timestamp,
        lastActiveNodeIds,
        []
      )
    );

    return events;
  }

  /**
   * Creates B/E-style trace events from a CpuProfile object created by `collectProfileEvents()`
   *
   * @param {CpuProfile} profile
   * @return {Array<LH.TraceEvent>}
   */
  static createStartEndEvents(profile) {
    const model = new CpuProfilerModel(profile);
    return model.createStartEndEvents();
  }

  /**
   * Merges the data of all the `ProfileChunk` trace events into a single CpuProfile object for consumption
   * by `createStartEndEvents()`.
   *
   * @param {Array<LH.TraceEvent>} traceEvents
   * @return {Array<CpuProfile>}
   */
  static collectProfileEvents(traceEvents) {
    /** @type {Map<string, CpuProfile>} */
    const profiles = new Map();
    for (const event of traceEvents) {
      if (event.name !== 'Profile' && event.name !== 'ProfileChunk') continue;
      if (typeof event.id !== 'string') continue;

      const cpuProfileArg =
        (event.args.data && event.args.data.cpuProfile) || {};
      const timeDeltas =
        (event.args.data && event.args.data.timeDeltas) ||
        cpuProfileArg.timeDeltas;
      let profile = profiles.get(event.id);

      if (event.name === 'Profile') {
        profile = {
          id: event.id,
          pid: event.pid,
          tid: event.tid,
          startTime: (event.args.data && event.args.data.startTime) || event.ts,
          nodes: cpuProfileArg.nodes || [],
          samples: cpuProfileArg.samples || [],
          timeDeltas: timeDeltas || [],
        };
      } else {
        if (!profile) continue;
        profile.nodes.push(...(cpuProfileArg.nodes || []));
        profile.samples.push(...(cpuProfileArg.samples || []));
        profile.timeDeltas.push(...(timeDeltas || []));
      }

      profiles.set(profile.id, profile);
    }

    return Array.from(profiles.values());
  }
}

const events = CpuProfilerModel.createStartEndEvents(
  JSON.parse(fs.readFileSync('./lighthouse_compatible.json', 'utf-8'))
);

fs.writeFileSync('chrome_events.json', JSON.stringify(events));
