import * as Tone from "tone";
import { MelodyRules } from "../grammars/MelodyRules";
interface ADSR {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export abstract class AudioSource {
  protected _position: number;
  protected loop: Tone.Loop;    // Not used by Pad
  protected gain: Tone.Gain;

  ///FX
  protected panner: Tone.Panner;
  protected delay: Tone.PingPongDelay;
  protected reverb: Tone.Reverb;
  protected filter: Tone.Filter;
  protected shifter:Tone.FrequencyShifter;

  protected rhythmicStructure: string; 
  protected count: number;
  protected noteDuration: string;     //Not used by pad 
  protected root: string;
  protected envelope: ADSR;
  protected melody: MelodyRules
  protected thirds:number

  protected isPlaying: boolean

  get position(): number {
    return this._position;
  }

  set position(v: number) {
    this._position = v;
    this.panner.pan.value = v/1.5 
  }

  constructor(
    position: number,
    rhythmicStructure: string
  ) {
    this._position = position
    this.rhythmicStructure = rhythmicStructure
    this.count = 0
    this.isPlaying = false
    this.thirds = 0
    this.load()
    
  }

  load() {
    this.panner = new Tone.Panner(this.position)

    this.shifter = new Tone.FrequencyShifter(0)
  }

  shift(amt:number){
    let value = Math.max(-200, -amt/10.)
    this.shifter.frequency.value = value
  }

  resetShifter(){
    this.shifter.frequency.exponentialRampTo(0, 1)
  }

  changeMode(mode: string) {
    this.thirds = (this.thirds+1) % 3  

    this.melody.changeMode(mode)
  }

  getMode(): string {
    return this.melody.modeName.toUpperCase()
  }

  abstract play(): void
  abstract stop(): void
  abstract initializeLoop(): void
  abstract openFilter(amt: number): void
}
