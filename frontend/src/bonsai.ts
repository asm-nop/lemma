import axios from "axios";

export class BonsaiProver {
  constructor(
    private readonly apiUrl: string
  ) {}

  async prove(address: string, theorem: string, proof: string): Promise<void> {
    const response = await axios.post(
      `${this.apiUrl}/prove`,
      { address, theorem, proof },
    );
  }
}
