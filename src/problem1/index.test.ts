import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './index';

describe('sum_to_n functions', () => {
	const functions = [
		{ name: 'sum_to_n_a', fn: sum_to_n_a },
		{ name: 'sum_to_n_b', fn: sum_to_n_b },
		{ name: 'sum_to_n_c', fn: sum_to_n_c },
	];

	functions.forEach(({ name, fn }) => {
		describe(name, () => {
			it('should return 0 for n = 0', () => {
				expect(fn(0)).toBe(0);
			});

			it('should return 1 for n = 1', () => {
				expect(fn(1)).toBe(1);
			});

			it('should return 15 for n = 5', () => {
				expect(fn(5)).toBe(15);
			});

			it('should return 55 for n = 10', () => {
				expect(fn(10)).toBe(55);
			});

			it('should return 5050 for n = 100', () => {
				expect(fn(100)).toBe(5050);
			});

			it('should throw error for negative numbers', () => {
				expect(() => fn(-1)).toThrow("Must be positive integer!");
			});

			it('should throw error for negative numbers', () => {
				expect(() => fn(-10)).toThrow("Must be positive integer!");
			});
		});
	});
});
