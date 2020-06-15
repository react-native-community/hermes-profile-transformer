import {GeneralEvent} from './GeneralEvent';
//Instant Event type
export class InstantEvent implements GeneralEvent<string, string>{
    name: string;
    cat: string;
    readonly ph: string = "i";
    ts: number;
    tts?: number;
    pid: number;
    tid: number;
    args: Map<string, string> = new Map();
    cname?: string;
    s: string; //extra parameter (default value: "t")

    constructor(name: string, cat: string, ts: number, pid: number, tid: number, s: string){
        this.name = name;
        this.cat = cat;
        this.ts = ts;
        this.pid = pid;
        this.tid = tid;
        this.s = s;
    }
}
