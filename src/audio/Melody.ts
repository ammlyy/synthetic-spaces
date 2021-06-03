import { AudioSource } from "./audioSource";
import * as Tone from "tone";
import { MelodyRules } from "../grammars/MelodyRules";
import { Genetic } from "../grammars/Genetic";

const RHYTHM_REPETITIONS = 4

export class Melody extends AudioSource {
  private synth: Tone.Synth
  private newRhythm:string // recombines the rhythm to give some variation
  private resetRhythm: number // trigger 

  constructor(
    position: number,
    root: string,
    attack: number,
    decay: number,
    sustain: number,
    release: number,
    duration: string,
    rhythmicStructure: string
  ) {
    super(position, rhythmicStructure)

    this.root = root;
    this.envelope = {
      attack: attack,
      decay: decay,
      sustain: sustain,
      release: release,
    };
    this.noteDuration = duration

    this.melody = new MelodyRules(0)

    this.synth = new Tone.Synth({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: this.envelope.attack,
        decay: this.envelope.decay,
        release: this.envelope.release,
        sustain: this.envelope.sustain,
      },
      volume:-12
    });
    this.filter = new Tone.Filter(800, "lowpass")
    this.delay = new Tone.PingPongDelay(0.1, 0.7)
    this.reverb = new Tone.Reverb({decay: 8.0, wet:0.8})
    this.gain = new Tone.Gain(0.8).toDestination()
    
    this.synth.chain(this.filter, this.delay, this.reverb, this.panner, this.shifter, this.gain)  //synth -> filter -> delay -> reverb -> gain

    this.initializeLoop()

    this.thirds = 0
    this.resetRhythm = 0
    this.newRhythm = this.rhythmicStructure
  }

  initializeLoop() {
    this.loop = new Tone.Loop(() => {
      if (this.newRhythm[this.count] == "1") {
        this.triggerNote()
      }
      this.count == this.newRhythm.length - 1 ? this.changeRhythm() : this.count++

    }, '8n')    //Loop duration
  }

  play() {
    this.loop.start()
    this.isPlaying = true
    
  }

  stop() {
    this.loop.stop()
    this.isPlaying = false
  }
  
  openFilter(amt: number){
    this.filter.frequency.value =  1200 + amt * 500.0;
  }

  changeMode(mode: string) {

    super.changeMode(mode)
    
    //this.count = 0
  }

  triggerNote(){
    let next = this.melody.nextNote(this.count)
    this.synth.triggerAttackRelease(Tone.Frequency(this.root).transpose(next + this.thirds*4).toFrequency(), this.noteDuration)
    
  }

  changeRhythm(){
    this.resetRhythm++

    if (this.resetRhythm == RHYTHM_REPETITIONS){
      this.newRhythm = Genetic.getSequence()
      this.resetRhythm = 0
    }

    this.count = 0
  }

}
