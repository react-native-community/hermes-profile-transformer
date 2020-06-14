export enum DurationEventsPhase {
	BEGIN = 'B',
	END = 'E',
}

export enum CompleteEventsPhase {
	PHASE = 'X',
}

export enum InstantEventsPhase {
	PHASE = 'I',
}

export enum CounterEventsPhase {
	PHASE = 'C',
}

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

export enum SampleEventsPhase {
	PHASE = 'P',
}

export enum ObjectEventsPhase {
	CREATED = 'N',
	SNAPSHOT = 'O',
	DESTROYED = 'D',
}

export enum MetadataEventsPhase {
	PHASE = 'M',
}

export enum MemoryDumpEventsPhase {
	GLOBAL = 'V',
	PROCESS = 'v',
}

export enum MarkEventsPhase {
	PHASE = 'R',
}

export enum ClockSyncEventsPhase {
	PHASE = 'c',
}

export enum ContextEventsPhase {
	ENTER = '(',
	EXIT = ')',
}
