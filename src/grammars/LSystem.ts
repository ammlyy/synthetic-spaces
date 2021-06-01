interface Rules {
  r0: string;
  r1: Array<string>;
}

export class LSystem {
  private static rules: Rules = {
    r0: "0",
    r1: ["01", "10", "11", "12"],
  };

  //Expands the seed (ex. "1010") for #iterations times according to this.rules
  static expand(seed: string, iterations: number): string {
    let supp = []
    let out: string = seed

    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < out.length; j++) {
        switch (out[j]) {
          case '0':
            supp.push('0')
            break
          case '1':
            supp.push(this.rules.r1[Math.floor(Math.random() * this.rules.r1.length)])
            break
          case '2':
            supp.push('2')
          default:
            break
        }
      }
      out = supp.toString().replace(/,/g, "")
      supp = []
    }
    while ((out.length % 4) != 0) {
      out += '0'
    }
    return out
  }

}
