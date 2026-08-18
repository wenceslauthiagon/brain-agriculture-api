export class CpfDocument {
  private readonly value: string;

  constructor(document: string) {
    this.value = document.replace(/\D/g, '');
  }

  sanitized(): string {
    return this.value;
  }

  isValid(): boolean {
    if (this.value.length !== 11 || this.allDigitsEqual()) {
      return false;
    }

    const digits = this.value.split('').map(Number);

    const firstSum = digits
      .slice(0, 9)
      .reduce((sum, digit, index) => sum + digit * (10 - index), 0);
    const firstVerifier = firstSum % 11 < 2 ? 0 : 11 - (firstSum % 11);

    if (firstVerifier !== digits[9]) {
      return false;
    }

    const secondSum = digits
      .slice(0, 10)
      .reduce((sum, digit, index) => sum + digit * (11 - index), 0);
    const secondVerifier = secondSum % 11 < 2 ? 0 : 11 - (secondSum % 11);

    return secondVerifier === digits[10];
  }

  private allDigitsEqual(): boolean {
    return /^(\d)\1+$/.test(this.value);
  }
}
