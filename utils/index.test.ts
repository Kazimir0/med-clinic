import { calculateBMI } from './index';

describe('calculateBMI', () => {
  it('should calculate BMI and return correct status for normal weight', () => {
    const result = calculateBMI(70, 175);
    expect(result.bmi).toBeCloseTo(22.86, 2);
    expect(result.status).toBe('Normal');
    expect(result.colorCode).toBe('#1E90FF');
  });

  it('should return Underweight for low BMI', () => {
    const result = calculateBMI(45, 170);
    expect(result.status).toBe('Underweight');
    expect(result.colorCode).toBe('#1E90FF');
  });

  it('should throw error for invalid input', () => {
    expect(() => calculateBMI(0, 0)).toThrow();
  });
});