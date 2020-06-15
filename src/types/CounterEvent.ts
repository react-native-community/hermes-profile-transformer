import {GeneralEvent} from './GeneralEvent';
//Counter Event type
export class CounterEvent implements GeneralEvent<string, number>{
    name: string;
    cat: string;
    readonly ph: string = "C";
    ts: number;
    tts?: number;
    pid: number;
    tid: number;
    args: Map<string, number> = new Map();
    cname?: string;

    constructor(name: string, cat: string, ts: number, pid: number, tid: number, s: string){
        this.name = name;
        this.cat = cat;
        this.ts = ts;
        this.pid = pid;
        this.tid = tid;
    }
}
