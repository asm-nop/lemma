import axios from "axios";

export type Response = {
  receipt: {
    inner: {
      Groth16: {
        seal: number[];
      };
    };
    journal: {
      bytes: number[];
    };
  };
};

export class BonsaiProver {
  constructor(private readonly apiUrl: string) {}

  async prove(
    sender: string,
    theorem: string,
    solution: string
  ): Promise<Response> {
    const response = await axios.post(`${this.apiUrl}/prove`, {
      inputs: { sender, theorem, solution },
      elf: [1],
    });

    return response.data;
  }
}
