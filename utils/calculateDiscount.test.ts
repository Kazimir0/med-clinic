import { calculateDiscount } from './index';

describe('calculateDiscount', () => {
  it('should calculate final amount and percentage when discount amount is provided', () => {
    const result = calculateDiscount({ amount: 100, discount: 20 });
    expect(result.finalAmount).toBe(80);
    expect(result.discountPercentage).toBeCloseTo(20, 2);
    expect(result.discountAmount).toBe(20);
  });

  it('should calculate final amount and discount when discount percentage is provided', () => {
    const result = calculateDiscount({ amount: 200, discountPercentage: 10 });
    expect(result.finalAmount).toBe(180);
    expect(result.discountPercentage).toBe(10);
    expect(result.discountAmount).toBe(20);
  });

  it('should throw error if both discount and discountPercentage are provided', () => {
    expect(() =>
      calculateDiscount({ amount: 100, discount: 10, discountPercentage: 5 })
    ).toThrow("Provide either discount amount or discount percentage, not both.");
  });

  it('should throw error if neither discount nor discountPercentage is provided', () => {
    expect(() =>
      calculateDiscount({ amount: 100 })
    ).toThrow("Please provide either a discount amount or a discount percentage.");
  });
});