import { customAlphabet } from "nanoid";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generate = customAlphabet(ALPHABET, 6);

export function generatePnr(): string {
  return generate();
}
