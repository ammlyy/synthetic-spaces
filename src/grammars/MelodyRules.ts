const MODES = [                     // expressed in distance from the root
  [11, 4, 7, 2, -5, 0, 5, 2],         // 0: ionian
  [10, 3, 7, 2, -5, 0, 5, 2],         // 1: dorian
  [10, 3, 7, 1, -5, 0, 5, 1],         // 2: phryigian
  [11, 4, 7, 2, -5, 0, 6, 2],         // 3: lydian
  [10, 4, 7, 2, -5, 0, 5, 2],     // 4: myxolydian
  [10, 3, 7, 2, -5, 0, 5, 2],         // 5: aeolian 
  [10, 3, 6, 1, -6, 0, 5, 1]      // 6: locrian :Q_
  
]; 


export class MelodyRules {
    private _mode: number[]          //Mode selected by the weather information
		private _modeIndex:number
    private _modeName: string       // For text infos
    private currentNote:number         // previous interval index
    private index = 0;
		

    get mode(): number[] {
        return this._mode
    }

		get modeIndex(): number{
			return this._modeIndex
		}

    get modeName(): string {
      return this._modeName
    }

    constructor(mode: number) {
				this._modeIndex = mode
        this._mode = MODES[this._modeIndex]
        this._modeName = ""
        this.currentNote = 0
    }

    nextNote(count:number): number {
      let out: number = 0

      switch(count){
        case 0:
          out = this.mode[0]
          break;

        case 1:
        case 2:
          out = this.mode[1]
          break;
        
        case 3:
        case 4:
          out = this.mode[2]
          break;
        
        case 5:
          out = this.mode[3]
          break;
        
        case 6:
        case 7:
          out = this.mode[4]
          break;
        
        case 8:
          out = this.mode[5]
          break
        
        case 9:
          out = this.mode[6]
          break
        
        case 10:
        case 11:
          out = this.mode[7]
          break

        default:
          out=0
      }
       return out
    }

    changeMode(mode:string){
			let mapping  // index of the mode 

			switch(mode){
				case 'Clear':
					mapping = 0
          this._modeName = "Ionian"
					break
				
				case 'Clouds':
					mapping = 1
          this._modeName = "Dorian"
					break
	
				case 'Mist':
					mapping = 2
          this._modeName = "Phrygian"
					break
	
				case 'Snow':
					mapping = 4
          this._modeName = "Myxolydian"
					break
			
				case 'Rain':
					mapping = 5
          this._modeName = "Aeolian"
          break
	
				case 'Extreme':
					mapping = 6
          this._modeName = "Locrian"
          break
				
				default: 
          mapping = 3
          this._modeName = "Lydian"
			}
      
        this._mode = MODES[mapping]
				this._modeIndex = mapping
    }
}