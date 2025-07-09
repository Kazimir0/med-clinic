import { getInitials } from './index';

describe('getInitials', () => {
  it('should return initials for two words', () => {
    expect(getInitials('Ana Popescu')).toBe('AP');
    expect(getInitials('john doe')).toBe('JD');
  });

  it('should return initial for a single word', () => {
    expect(getInitials('Alexandru')).toBe('A');
  });

  it('should handle extra spaces', () => {
    expect(getInitials('  Maria   Ionescu  ')).toBe('MI');
  });

  it('should return empty string for empty input', () => {
    expect(getInitials('')).toBe('');
  });
});