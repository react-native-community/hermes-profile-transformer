import _ from 'lodash';
import { HermesSample } from '../types/hermesProfileInterfaces';
import { Event } from '../types/chromeEventInterfaces';
import { EventsPhase } from '../types/Phases';

interface EventDetails {
  dur: number;
  initTs: number;
  details: HermesSample;
}

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

  graphDepth(node: Node): number {
    if (node.children.length === 0) {
      return 0;
    }
    let maxDepth = 1;
    for (let i = 0; i < node.children.length; i++) {
      maxDepth = Math.max(maxDepth, 1 + this.graphDepth(node.children[i]));
    }
    return maxDepth;
  }

  constructChromeSample = (sample: EventDetails): Event => {
    return {
      pid: sample.details.pid,
      tid: Number(sample.details.tid),
      ts: Number(sample.initTs),
      name: sample.details.name,
      cat: sample.details.stackFrameData?.category || 'JavaScript',
      args: { name: sample.details.name },
      ph: EventsPhase.COMPLETE_EVENTS,
      dur: sample.dur,
    };
  };

  /* Sets phase for all events in one node */
  setNodePhase(node: Node): Event[] {
    node = this.sortNodeEvents(node);
    const chromeEvents: Event[] = [];
    const eventDetails: { [key in string]: EventDetails } = {};
    if (node.events.length) {
      for (let i = 0; i < node.events.length; i++) {
        const event: HermesSample = node.events[i];
        if (!(event.name in eventDetails)) {
          eventDetails[event.name] = {
            dur: 0,
            initTs: Number(event.ts),
            details: event,
          };
        } else {
          eventDetails[event.name].dur =
            Number(event.ts) - eventDetails[event.name].initTs;
        }
      }
      for (let event in eventDetails) {
        chromeEvents.push(this.constructChromeSample(eventDetails[event]));
      }
    }
    return chromeEvents;
  }

  /*Traverse through the Call graph and sort their events property by timestamp, and assign dur accordingly*/
  setAllNodePhases(node: Node): Event[] {
    const events: Event[] = [];
    events.push(...this.setNodePhase(node));
    for (let i = 0; i < node.children.length; i++) {
      events.push(...this.setAllNodePhases(node.children[i]));
    }
    return events;
  }
}
