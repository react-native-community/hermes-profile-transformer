import { GeneralEvent } from './GeneralEvent';
//Instant Event type
export class InstantEvent implements GeneralEvent<string, string> {
  readonly ph: string = 'i';
  args: Map<string, string> = new Map();
  s: string; //extra parameter (default value: "t")

  constructor(
    public name: string,
    public cat: string,
    public ts: number,
    public pid: number,
    public tid: number,
    s: string
  ) {
    this.s = s;
  }
}
