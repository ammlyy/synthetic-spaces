import { AudioSource } from "./audioSource";
import * as Tone from "tone";
import { Melody } from "../grammars/Melody";

const CHORDS = [
  [0, 4, 12, 19],                            // 0: ionian -> clear (maj) 1-3-5-8
  [0, 7, 12, 19],                           // 1: dorian -> clouds (?) 1-5
  [0, 3, 10, 17],                           // 2: phryigian -> mist (m11) 1-m3-7-11
  [0, 7, 12, 18],                           // 3: lydian -> aug4
  [0, 4, 10,  21],                          // 4: myxolydian -> snow (Maj13)
  [0, 10,  15, 22],                         // 5: aeolian -> rain
  [0, 3, 9, 20]                             // 6: locrian is diminished so -> extreme
]; 

const FILTER_CUTOFF = 150
export class Pad extends AudioSource {
  private synth: Tone.PolySynth;
  private voicing: Array<Tone.FrequencyClass>;            // Default chord
  private currentVoicing : Array<Tone.FrequencyClass>     // Actual chord playing (with voicings)

  constructor(
    position: number,
    root: string,
    attack: number,
    decay: number,
    sustain: number,
    release: number,
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

    this.melody = new Melody(0)
	
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "pwm",
      },
      envelope: {
        attack: this.envelope.attack,
        decay: this.envelope.decay,
        release: this.envelope.release,
        sustain: this.envelope.sustain,
      },
      volume:-10
    });
    this.gain = new Tone.Gain(0.7).toDestination()
    this.filter = new Tone.Filter(200, "lowpass")
    this.delay = new Tone.PingPongDelay(0.1, 0.2)
    this.reverb = new Tone.Reverb({decay: 4.0, wet:0.5})

    this.synth.chain(this.filter, this.delay, this.reverb, this.shifter, this.gain)//synth -> filter -> reverb -> gain

	  this.voicing = this.createVoices(0)
    this.currentVoicing = [...this.voicing]

    this.initializeLoop()
  }

  createVoices(mode:number): Array<Tone.FrequencyClass> {
    return [ 
      Tone.Frequency(this.root).transpose(CHORDS[mode][0] + (this.thirds*4)),
      Tone.Frequency(this.root).transpose(CHORDS[mode][1] + (this.thirds*4)),
      Tone.Frequency(this.root).transpose(CHORDS[mode][2] + (this.thirds*4)),
      Tone.Frequency(this.root).transpose(CHORDS[mode][3] + (this.thirds*4))
    ]
  }

  initializeLoop() {
    this.loop = new Tone.Loop(() => {
      if (this.rhythmicStructure[this.count] == "1") {
        this.triggerNote()
      }
      this.count == this.rhythmicStructure.length - 1 ? (this.count = 0) : this.count++;
    }, "2n")    //Loop duration
  }

  play() {
    this.synth.triggerAttack(this.currentVoicing[0].toFrequency(),0, 0.5*(1 + Math.random())) // constant note droning on the background
   
    this.loop.start()
    this.isPlaying = true;
  }

  stop() {
    this.currentVoicing.forEach(note => {
      this.synth.triggerRelease(note.toFrequency());
    })
    this.loop.stop()
    this.isPlaying = false;
  }

  openFilter(amt: number) { // input is between 0 and 1
    this.filter.frequency.rampTo(FILTER_CUTOFF + amt * 100.0, 0.1);
    
  }

  triggerNote(){
    let idx = Math.floor(Math.random() * this.currentVoicing.length)    // random index from the chord that is playing
    let transpose = Math.round((Math.random() - 0.5) * 2) * 12   // move octaves (- or + 1) + thirds
    let note = Tone.Frequency(this.voicing[idx]).transpose(transpose)   // new note to trigger
    this.synth.triggerRelease(this.currentVoicing[idx].toFrequency())   // release the previous one at the same index in the chord
    this.currentVoicing[idx] = note                                     //update the chord
    this.synth.triggerAttack(this.currentVoicing[idx].toFrequency())    // trigger the attack
  }

  // Override
  changeMode(mode: string) {
    let status = this.isPlaying
    this.stop()
    super.changeMode(mode)
    this.voicing = this.createVoices(this.melody.modeIndex)
    this.currentVoicing = [...this.voicing]

    if(status) this.play()
  }

}
