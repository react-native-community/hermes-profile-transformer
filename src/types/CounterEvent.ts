import {GeneralEvent} from './GeneralEvent';
//Counter Event type
export class CounterEvent implements GeneralEvent<string, number>{
    readonly ph: string = "C";
    args: Map<string, number> = new Map();

    constructor(public name: string, public cat: string, public ts: number, public pid: number,
        public tid: number){
            
    }
}