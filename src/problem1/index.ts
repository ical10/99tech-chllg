// Here are some of considerably efficient algorithms
// for summation to integer n (sum_to_n)
// Note: I'm using Typescript for better type-safety


// Using sum of arithmetic sequence formula
// S = n(a_1 + a_n) / 2
var sum_to_n_a = function(n: number) {
	if (n < 0) throw new Error("Must be positive integer!");
	return n * (1 + n) / 2;
};

// Using a for loop (often highly optimized in some JS engines)
var sum_to_n_b = function(n: number) {
	if (n < 0) throw new Error("Must be positive integer!");
	let sum = 0;
	for (let i = 1; i <= n; i++) {
		sum += i;
	}
	return sum;
};

// Using a while loop
var sum_to_n_c = function(n: number) {
	if (n < 0) throw new Error("Must be positive integer!");
	let sum = 0;
	let i = 1;
	while (i <= n) {
		sum += i;
		i++;
	}
	return sum;
};

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
