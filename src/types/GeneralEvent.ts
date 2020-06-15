// This is an interface for a general trace event
export interface GeneralEvent<T, K>{
    name: string;
    cat: string;
    ph: string;
    ts: number;
    tts?: number;
    pid: number;
    tid: number;
    args: Map<T, K>;
    cname?: string;
}

