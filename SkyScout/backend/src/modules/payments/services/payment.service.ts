export interface ChargeInput {
  amount: string;
  currency: string;
  reference: string;
  contactEmail: string;
}

export interface ChargeResult {
  success: boolean;
  transactionId?: string;
}

export function charge(input: ChargeInput): ChargeResult {
  if (input.contactEmail.includes("+fail")) {
    return { success: false };
  }
  return { success: true, transactionId: `mock_${input.reference}` };
}
