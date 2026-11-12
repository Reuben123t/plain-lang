"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mathBuiltins = void 0;
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
exports.mathBuiltins = {
    to_number: (val) => {
        if (typeof val === "number")
            return val;
        if (typeof val === "boolean")
            return val ? 1 : 0;
        const str = (0, values_1.plainToString)(val).trim();
        const num = Number(str);
        if (isNaN(num) || str === "") {
            throw new plain_error_1.PlainError(`I cannot convert "${str}" into a number.`, { line: 1, column: 1 }, {
                kind: "TypeError",
                suggestion: "Make sure the text contains only digits (for example, '42' or '3.14')."
            });
        }
        return num;
    },
    to_text: (val) => {
        return (0, values_1.plainToString)(val);
    },
    round: (num) => {
        return Math.round(exports.mathBuiltins.to_number(num));
    },
    floor: (num) => {
        return Math.floor(exports.mathBuiltins.to_number(num));
    },
    ceiling: (num) => {
        return Math.ceil(exports.mathBuiltins.to_number(num));
    },
    absolute: (num) => {
        return Math.abs(exports.mathBuiltins.to_number(num));
    },
    minimum: (...args) => {
        if (args.length === 0) {
            throw new plain_error_1.PlainError("minimum(...) requires at least one number.", { line: 1, column: 1 }, { kind: "TypeError" });
        }
        const numbers = args.map((a) => exports.mathBuiltins.to_number(a));
        return Math.min(...numbers);
    },
    maximum: (...args) => {
        if (args.length === 0) {
            throw new plain_error_1.PlainError("maximum(...) requires at least one number.", { line: 1, column: 1 }, { kind: "TypeError" });
        }
        const numbers = args.map((a) => exports.mathBuiltins.to_number(a));
        return Math.max(...numbers);
    },
    random_between: (minVal, maxVal) => {
        const min = Math.ceil(exports.mathBuiltins.to_number(minVal));
        const max = Math.floor(exports.mathBuiltins.to_number(maxVal));
        if (min > max) {
            return Math.floor(Math.random() * (min - max + 1)) + max;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    // Powers and Roots
    square: (n) => {
        const num = exports.mathBuiltins.to_number(n);
        return num * num;
    },
    cube: (n) => {
        const num = exports.mathBuiltins.to_number(n);
        return num * num * num;
    },
    square_root: (n) => {
        const num = exports.mathBuiltins.to_number(n);
        if (num < 0) {
            throw new plain_error_1.PlainError("Cannot take the square root of a negative number.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        return Math.sqrt(num);
    },
    cube_root: (n) => {
        return Math.cbrt(exports.mathBuiltins.to_number(n));
    },
    power: (baseVal, expVal) => {
        return Math.pow(exports.mathBuiltins.to_number(baseVal), exports.mathBuiltins.to_number(expVal));
    },
    // Arithmetic Utilities
    factorial: (n) => {
        const num = Math.round(exports.mathBuiltins.to_number(n));
        if (num < 0)
            throw new plain_error_1.PlainError("Factorial is not defined for negative numbers.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        if (num > 170)
            throw new plain_error_1.PlainError("Number is too large for factorial calculation.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        let res = 1;
        for (let i = 2; i <= num; i++)
            res *= i;
        return res;
    },
    gcd: (aVal, bVal) => {
        let a = Math.abs(Math.round(exports.mathBuiltins.to_number(aVal)));
        let b = Math.abs(Math.round(exports.mathBuiltins.to_number(bVal)));
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    },
    lcm: (aVal, bVal) => {
        const a = Math.abs(Math.round(exports.mathBuiltins.to_number(aVal)));
        const b = Math.abs(Math.round(exports.mathBuiltins.to_number(bVal)));
        if (a === 0 || b === 0)
            return 0;
        return Math.abs(a * b) / exports.mathBuiltins.gcd(a, b);
    },
    is_prime: (nVal) => {
        const n = Math.round(exports.mathBuiltins.to_number(nVal));
        if (n <= 1)
            return false;
        if (n <= 3)
            return true;
        if (n % 2 === 0 || n % 3 === 0)
            return false;
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0)
                return false;
        }
        return true;
    },
    next_prime: (nVal) => {
        let n = Math.round(exports.mathBuiltins.to_number(nVal)) + 1;
        while (!exports.mathBuiltins.is_prime(n)) {
            n++;
        }
        return n;
    },
    primes_up_to: (limitVal) => {
        const limit = Math.round(exports.mathBuiltins.to_number(limitVal));
        const primes = [];
        for (let i = 2; i <= limit; i++) {
            if (exports.mathBuiltins.is_prime(i))
                primes.push(i);
        }
        return primes;
    },
    factors: (nVal) => {
        const n = Math.abs(Math.round(exports.mathBuiltins.to_number(nVal)));
        const res = [];
        for (let i = 1; i <= n; i++) {
            if (n % i === 0)
                res.push(i);
        }
        return res;
    },
    is_even: (nVal) => {
        const n = Math.round(exports.mathBuiltins.to_number(nVal));
        return n % 2 === 0;
    },
    is_odd: (nVal) => {
        const n = Math.round(exports.mathBuiltins.to_number(nVal));
        return n % 2 !== 0;
    },
    sign: (nVal) => {
        const n = exports.mathBuiltins.to_number(nVal);
        return Math.sign(n);
    },
    clamp: (val, minVal, maxVal) => {
        const v = exports.mathBuiltins.to_number(val);
        const min = exports.mathBuiltins.to_number(minVal);
        const max = exports.mathBuiltins.to_number(maxVal);
        return Math.min(Math.max(v, min), max);
    },
    percentage: (partVal, totalVal) => {
        const total = exports.mathBuiltins.to_number(totalVal);
        if (total === 0)
            throw new plain_error_1.PlainError("Cannot calculate percentage of a total of zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return (exports.mathBuiltins.to_number(partVal) / total) * 100;
    },
    percent_change: (oldVal, newVal) => {
        const oldV = exports.mathBuiltins.to_number(oldVal);
        if (oldV === 0)
            throw new plain_error_1.PlainError("Initial value cannot be zero for percent change.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return ((exports.mathBuiltins.to_number(newVal) - oldV) / oldV) * 100;
    },
    // Trigonometry (takes degrees for student simplicity, or standard rad)
    sine: (degVal) => {
        const rad = (exports.mathBuiltins.to_number(degVal) * Math.PI) / 180;
        return Math.sin(rad);
    },
    cosine: (degVal) => {
        const rad = (exports.mathBuiltins.to_number(degVal) * Math.PI) / 180;
        return Math.cos(rad);
    },
    tangent: (degVal) => {
        const rad = (exports.mathBuiltins.to_number(degVal) * Math.PI) / 180;
        return Math.tan(rad);
    },
    arcsine: (val) => {
        const n = exports.mathBuiltins.to_number(val);
        return (Math.asin(n) * 180) / Math.PI;
    },
    arccosine: (val) => {
        const n = exports.mathBuiltins.to_number(val);
        return (Math.acos(n) * 180) / Math.PI;
    },
    arctangent: (val) => {
        const n = exports.mathBuiltins.to_number(val);
        return (Math.atan(n) * 180) / Math.PI;
    },
    to_degrees: (radVal) => {
        return (exports.mathBuiltins.to_number(radVal) * 180) / Math.PI;
    },
    to_radians: (degVal) => {
        return (exports.mathBuiltins.to_number(degVal) * Math.PI) / 180;
    },
    // Logarithms & Exponentials
    log: (nVal) => {
        const n = exports.mathBuiltins.to_number(nVal);
        if (n <= 0)
            throw new plain_error_1.PlainError("Logarithm is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return Math.log(n);
    },
    log10: (nVal) => {
        const n = exports.mathBuiltins.to_number(nVal);
        if (n <= 0)
            throw new plain_error_1.PlainError("Logarithm base 10 is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return Math.log10(n);
    },
    log2: (nVal) => {
        const n = exports.mathBuiltins.to_number(nVal);
        if (n <= 0)
            throw new plain_error_1.PlainError("Logarithm base 2 is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return Math.log2(n);
    },
    exp: (nVal) => {
        return Math.exp(exports.mathBuiltins.to_number(nVal));
    },
    pi: () => Math.PI,
    euler_e: () => Math.E,
    // Financial / Student Math
    simple_interest: (principalVal, ratePercentVal, timeYearsVal) => {
        const p = exports.mathBuiltins.to_number(principalVal);
        const r = exports.mathBuiltins.to_number(ratePercentVal) / 100;
        const t = exports.mathBuiltins.to_number(timeYearsVal);
        return p * r * t;
    },
    compound_interest: (pVal, rVal, tVal, nVal) => {
        const p = exports.mathBuiltins.to_number(pVal);
        const r = exports.mathBuiltins.to_number(rVal) / 100;
        const t = exports.mathBuiltins.to_number(tVal);
        const n = nVal ? exports.mathBuiltins.to_number(nVal) : 1; // n is compounding frequency (default annual)
        return p * Math.pow(1 + r / n, n * t) - p;
    },
    permutations: (nVal, rVal) => {
        const n = Math.round(exports.mathBuiltins.to_number(nVal));
        const r = Math.round(exports.mathBuiltins.to_number(rVal));
        if (r < 0 || r > n)
            return 0;
        return exports.mathBuiltins.factorial(n) / exports.mathBuiltins.factorial(n - r);
    },
    combinations: (nVal, rVal) => {
        const n = Math.round(exports.mathBuiltins.to_number(nVal));
        const r = Math.round(exports.mathBuiltins.to_number(rVal));
        if (r < 0 || r > n)
            return 0;
        return exports.mathBuiltins.factorial(n) / (exports.mathBuiltins.factorial(r) * exports.mathBuiltins.factorial(n - r));
    },
    quadratic_roots: (aVal, bVal, cVal) => {
        const a = exports.mathBuiltins.to_number(aVal);
        const b = exports.mathBuiltins.to_number(bVal);
        const c = exports.mathBuiltins.to_number(cVal);
        if (a === 0)
            throw new plain_error_1.PlainError("In ax^2 + bx + c = 0, 'a' cannot be 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        const disc = b * b - 4 * a * c;
        if (disc < 0)
            return []; // no real roots
        if (disc === 0)
            return [-b / (2 * a)];
        const r1 = (-b + Math.sqrt(disc)) / (2 * a);
        const r2 = (-b - Math.sqrt(disc)) / (2 * a);
        return [r1, r2];
    }
};
//# sourceMappingURL=math.js.map