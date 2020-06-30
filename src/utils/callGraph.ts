import _ from 'lodash';
import { HermesSample } from '../types/hermesProfileInterfaces';
import { SharedEventProperties } from '../types/chromeEventInterfaces';
import { EventsPhase } from '../types/Phases';
export class Node {
  children: Node[];
  constructor(public id: number, public events: HermesSample[]) {
    this.children = [];
  }
}

export class CallGraph {
  constructor(public root: Node) {}
  /* Given an Id find the node corresponding to it */
  findNode(id: string, node: Node): Node | undefined {
    if (node.id === parseInt(id)) {
      return node;
    }
    for (let i = 0; i < node.children.length; i++) {
      const child: Node = node.children[i];
      const res = this.findNode(id, child);
      if (res) {
        return res;
      }
    }
    return undefined;
  }
  /*
    We can only add a node to the call graph if its parent exists.
    Nodes correspond to stackFrames
  */
  addNode(nodeId: string, parentId: string): boolean {
    // Step 1: Find Parent - using DFS/BFS
    const parent = this.findNode(parentId, this.root);
    /* Step 2: Check if a child node to parent with same name exists; 
    if yes, then append to the events property of that node
    else, create new Node, add to the events property and append to children of parent
    */
    if (parent) {
      parent.children.push(new Node(parseInt(nodeId), []));
      return true;
    }
    return false;
  }

  /* Add the sample events to the nodeId corresponding to their stackFrame */
  addEvent(event: HermesSample): boolean {
    const stackFrameNode = this.findNode(event.sf.toString(), this.root);
    if (stackFrameNode) {
      stackFrameNode.events.push(event);
      return true;
    }
    return false;
  }

  /* Can give the state of the graph below a particular node at any time */
  printAllNodeIds(node: Node): void {
    console.log(this.findNode(node.id.toString(), this.root));
    for (let i = 0; i < node.children.length; i++) {
      this.printAllNodeIds(node.children[i]);
    }
  }

  /* Get list of events by traversing the graph */
  listOfEvents(node: Node): HermesSample[] {
    const events: HermesSample[] = [];
    events.push(...node.events);
    for (let i = 0; i < node.children.length; i++) {
      events.push(...this.listOfEvents(node.children[i]));
    }
    return events;
  }

  /* Sort Node Events by Timestamp */
  sortNodeEvents(node: Node): Node {
    node.events = node.events.sort((a, b) =>
      a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0
    );
    return node;
  }

  constructChromeSample = (
    sample: HermesSample,
    ph: EventsPhase
  ): SharedEventProperties => {
    return {
      pid: sample.pid,
      tid: Number(sample.tid),
      ts: Number(sample.ts),
      name: sample.name,
      cat: sample.stackFrameData?.category || 'JavaScript',
      args: { name: sample.name },
      ph: ph,
    };
  };

  /*Remove Events with incorrect number; 
  i.e. if the same event name has an odd number of events associated to it,
   we don't consider the event. */
  fixChromeEvents(
    chromeEvents: SharedEventProperties[],
    eventDetails: { [key in string]: { ph: EventsPhase; count: number } }
  ): SharedEventProperties[] {
    const incorrectEvents: string[] = [];
    for (let eventName in eventDetails) {
      if (eventDetails[eventName].count % 2) {
        incorrectEvents.push(eventName);
      }
    }
    const correctEvents: SharedEventProperties[] = [];
    if (incorrectEvents.length) {
      for (let i = chromeEvents.length - 1; i >= 0; i--) {
        if (incorrectEvents.includes(chromeEvents[i].name!)) {
          _.remove(incorrectEvents, event => event === chromeEvents[i].name);
          continue;
        }
        correctEvents.push(chromeEvents[i]);
      }
    }
    return correctEvents;
  }

  /* Sets phase for all events in one node */
  setNodePhase(node: Node): SharedEventProperties[] {
    const chromeEvents: SharedEventProperties[] = [];
    const eventDetails: {
      [key in string]: { ph: EventsPhase; count: number };
    } = {};
    if (node.events.length) {
      for (let i = 0; i < node.events.length; i++) {
        const event: HermesSample = node.events[i];
        if (!(event.name in eventDetails)) {
          eventDetails[event.name] = {
            ph: EventsPhase.DURATION_EVENTS_BEGIN,
            count: 1,
          };
        }
        chromeEvents.push(
          this.constructChromeSample(event, eventDetails[event.name].ph)
        );
        eventDetails[event.name].count += 1;
        if (eventDetails[event.name].ph === EventsPhase.DURATION_EVENTS_BEGIN)
          eventDetails[event.name].ph = EventsPhase.DURATION_EVENTS_END;
        else eventDetails[event.name].ph = EventsPhase.DURATION_EVENTS_END;
      }
    }
    const lastFix: SharedEventProperties[] = this.fixChromeEvents(
      chromeEvents,
      eventDetails
    );
    return lastFix;
  }

  /*Traverse through the Call graph and sort their events property by timestamp, 
  assign "B" and "E" accordingly*/
  setAllNodePhases(node: Node): SharedEventProperties[] {
    const events: SharedEventProperties[] = [];
    events.push(...this.setNodePhase(node));
    for (let i = 0; i < node.children.length; i++) {
      events.push(...this.setAllNodePhases(node.children[i]));
    }
    return events;
  }
}
