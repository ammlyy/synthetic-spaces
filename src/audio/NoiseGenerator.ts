import { Vector3 } from "three";
import { AudioSource } from "./audioSource";
import * as Tone from "tone";
import { Sampler } from "tone";
import grainG1 from '../../assets/samples/grainG.mp3'
import grainG2 from '../../assets/samples/grainG2.mp3'
import fischio from '../../assets/samples/fischio1.mp3'
import noise from '../../assets/samples/noise.mp3'


export class NoiseGenerator extends AudioSource {
  private samplerG: Tone.Sampler
  private samplerN: Tone.Sampler
  private grainplayer: Tone.GrainPlayer

  private sampleList: string[] = ['G1', 'B0', 'D#1']

  constructor(position: number,  duration: string, rhythmicStructure: string) {
    super(position, rhythmicStructure)
    this.samplerG = new Sampler({
      urls: {
        G1: grainG1,
        G2: grainG2,
      }   
    })

    this.samplerN = new Sampler({
      urls:{
        C4: noise
      }
    })

    this.grainplayer = new Tone.GrainPlayer(fischio)
    this.grainplayer.volume.value = 0

    this.gain = new Tone.Gain(0.4).toDestination()
    this.delay = new Tone.PingPongDelay(0.2, 0.9)
    this.reverb = new Tone.Reverb({decay: 6.0, wet:0.6})

    this.grainplayer.chain(this.delay, this.panner, this.reverb, this.gain)
    this.samplerG.chain(this.delay, this.panner, this.reverb, this.gain)
    this.samplerN.chain(this.panner, this.reverb, this.gain)

    this.noteDuration = duration

    this.initializeLoop()
  }

  initializeLoop() {
    this.loop = new Tone.Loop((time) => {
     if (this.rhythmicStructure[this.count] == '1'){
       let trig = Math.random()
      trig > 0.5 ? this.grainplayer.start() : this.samplerN.triggerAttackRelease('C4', '4n')

     }
      
     else if (this.rhythmicStructure[this.count] == "2") { //trigger granular synth
          this.samplerG.triggerAttackRelease(this.sampleList[this.thirds], '4n')
      }
      this.count == this.rhythmicStructure.length - 1 ? (this.count = 0) : this.count++;
    }, "1m");   //Loop duration
  }
  
  play(){
    if(!this.isPlaying){
      this.loop.start()
      this.isPlaying = true
    }
  }

  stop(){
    if(this.isPlaying){
      this.loop.stop()
      this.grainplayer.stop()
      this.isPlaying = false
    }
  }

  openFilter(amt: number){/*do nothing*/}
  changeMode(mode: string) {
    this.thirds = (this.thirds+1) % 3
  }
  getMode(): string {return ""}
}