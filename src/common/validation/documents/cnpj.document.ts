export class CnpjDocument {
  private readonly value: string;

  constructor(document: string) {
    this.value = document.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  sanitized(): string {
    return this.value;
  }

  isValid(): boolean {
    if (this.value.length !== 14 || this.allCharsEqual()) {
      return false;
    }

    if (!/^[A-Z0-9]{14}$/.test(this.value)) {
      return false;
    }

    if (!/^\d{2}$/.test(this.value.slice(12))) {
      return false;
    }

    const firstDigit = this.calculateDigit(
      this.value.slice(0, 12),
      [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );
    const secondDigit = this.calculateDigit(
      this.value.slice(0, 13),
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );

    return (
      firstDigit === Number(this.value[12]) &&
      secondDigit === Number(this.value[13])
    );
  }

  private calculateDigit(base: string, factors: number[]): number {
    const sum = base.split('').reduce((acc, char, index) => {
      const asciiValue = (char.codePointAt(0) ?? 48) - 48;
      return acc + asciiValue * factors[index];
    }, 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  private allCharsEqual(): boolean {
    return /^(.)\1+$/.test(this.value);
  }
}
