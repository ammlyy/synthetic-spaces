const N_CHROMOSOMES = 12;
const N_PARENTS = 4;
const TARGET_RHYTHM = [1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0]; // '110111101110'
const MUTATION_RATE = 0.2

//const TARGET_MELODY =

interface Chromosome {
  sequence: Array<number>; // rhythmic sequence
  fitness: number; //normalized between 0 and 1
}

export class Genetic {
  static population: Chromosome[] = [];

  static init() {
    for (let j = 0; j < N_CHROMOSOMES; j++) { // create a randomly initialized population
      let n = [];
      for (let i = 0; i < 12; i++) {
        let v = Math.round(Math.random());
        n.push(v);
      }
      Genetic.population.push({
        sequence: n,
        fitness: 0,
      });
    }
  }

  // Compute one iteration of the algorithm and returns the fittest parent (still computes the next generation)
  static getSequence(): string {
    let parents: Chromosome[] = []
    let best_fit = 0

    this.evaluateFitness()
    parents = this.matingPool()
    best_fit = Math.max(...parents.map((a) => a.fitness))
    Genetic.population = this.reproduction(parents)
    let ret = parents.filter((a) => a.fitness == best_fit)[0].sequence.toString().replace(/,/g, "")
    return ret
  }

  private static evaluateFitness() {
    for (let seq of Genetic.population) {
      for (let i = 0; i < seq.sequence.length; i++) {
        if (seq.sequence[i] == TARGET_RHYTHM[i]) seq.fitness++;
      }
      seq.fitness /= seq.sequence.length  //normalization
    }
  }

  private static matingPool(): Chromosome[] {
    let parents = []

    for (let i = 0; i < N_PARENTS; i++) {
      let dist = Genetic.population.map(g => g.fitness)
      let cumulative = 0 // cumulative prob
      let rndval = 0
      while (rndval == 0) {
        rndval = Math.random() * dist.reduce((value, sum) => sum += value)
      }
      let idx = dist.map((val) => {
        cumulative += val
        return cumulative
      }).findIndex((val) => val >= rndval)
      parents.push(Genetic.population[idx])
      Genetic.population.splice(idx, 1)
    }

    return parents
  }

  private static reproduction(parents: Chromosome[]): Chromosome[] {
    let children: Chromosome[] = []

    // Crossover between parents
    for (let i = 0; i < parents.length; i++) {
      for (let j = 0; j < parents.length; j++) {
        if (i != j) {
          children.push({ sequence: Genetic.crossover(parents[i].sequence, parents[j].sequence), fitness: 0 })
        }
      }
    }

    //apply mutation
    children.forEach((c) => this.mutate(c.sequence))
    return children
  }

  // Recieves 2 input sequences and do crossover following random splitting point approach
  private static crossover(s1: Array<number>, s2: Array<number>): Array<number> {
    let index = Math.floor(Math.random() * s1.length)
    return [].concat(s1.slice(0, index), s2.slice(index, s2.length))
  }

  private static mutate(s: Array<number>) {
    let rnd = 0
    for (let i in s) {
      rnd = Math.random()
      if (rnd < MUTATION_RATE) {
        s[i] == 0 ? s[i] = 1 : s[i] = 0
      }
    }
  }
}
