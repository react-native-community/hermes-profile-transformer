export enum AsyncEventsPhase {
  NESTABLE_START = 'b',
  NESTABLE_INSTANT = 'n',
  NESTABLE_END = 'e',
  // Deprecated
  START = 'S',
  STEP_INTO = 'T',
  STEP_PAST = 'p',
  END = 'F',
}

export enum FlowEventsPhase {
  START = 's',
  STEP = 't',
  END = 'f',
}

export enum ObjectEventsPhase {
  CREATED = 'N',
  SNAPSHOT = 'O',
  DESTROYED = 'D',
}

export enum MemoryDumpEventsPhase {
  GLOBAL = 'V',
  PROCESS = 'v',
}

export enum ContextEventsPhase {
  ENTER = '(',
  EXIT = ')',
}
