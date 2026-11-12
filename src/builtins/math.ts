import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";

export const mathBuiltins: Record<string, (...args: any[]) => any> = {
  to_number: (val: PlainValue): number => {
    if (typeof val === "number") return val;
    if (typeof val === "boolean") return val ? 1 : 0;
    const str = plainToString(val).trim();
    const num = Number(str);
    if (isNaN(num) || str === "") {
      throw new PlainError(
        `I cannot convert "${str}" into a number.`,
        { line: 1, column: 1 },
        {
          kind: "TypeError",
          suggestion: "Make sure the text contains only digits (for example, '42' or '3.14')."
        }
      );
    }
    return num;
  },

  to_text: (val: PlainValue): string => {
    return plainToString(val);
  },

  round: (num: PlainValue): number => {
    return Math.round(mathBuiltins.to_number(num));
  },

  floor: (num: PlainValue): number => {
    return Math.floor(mathBuiltins.to_number(num));
  },

  ceiling: (num: PlainValue): number => {
    return Math.ceil(mathBuiltins.to_number(num));
  },

  absolute: (num: PlainValue): number => {
    return Math.abs(mathBuiltins.to_number(num));
  },

  minimum: (...args: PlainValue[]): number => {
    if (args.length === 0) {
      throw new PlainError("minimum(...) requires at least one number.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const numbers = args.map((a) => mathBuiltins.to_number(a));
    return Math.min(...numbers);
  },

  maximum: (...args: PlainValue[]): number => {
    if (args.length === 0) {
      throw new PlainError("maximum(...) requires at least one number.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const numbers = args.map((a) => mathBuiltins.to_number(a));
    return Math.max(...numbers);
  },

  random_between: (minVal: PlainValue, maxVal: PlainValue): number => {
    const min = Math.ceil(mathBuiltins.to_number(minVal));
    const max = Math.floor(mathBuiltins.to_number(maxVal));
    if (min > max) {
      return Math.floor(Math.random() * (min - max + 1)) + max;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Powers and Roots
  square: (n: PlainValue): number => {
    const num = mathBuiltins.to_number(n);
    return num * num;
  },

  cube: (n: PlainValue): number => {
    const num = mathBuiltins.to_number(n);
    return num * num * num;
  },

  square_root: (n: PlainValue): number => {
    const num = mathBuiltins.to_number(n);
    if (num < 0) {
      throw new PlainError("Cannot take the square root of a negative number.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return Math.sqrt(num);
  },

  cube_root: (n: PlainValue): number => {
    return Math.cbrt(mathBuiltins.to_number(n));
  },

  power: (baseVal: PlainValue, expVal: PlainValue): number => {
    return Math.pow(mathBuiltins.to_number(baseVal), mathBuiltins.to_number(expVal));
  },

  // Arithmetic Utilities
  factorial: (n: PlainValue): number => {
    const num = Math.round(mathBuiltins.to_number(n));
    if (num < 0) throw new PlainError("Factorial is not defined for negative numbers.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    if (num > 170) throw new PlainError("Number is too large for factorial calculation.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    let res = 1;
    for (let i = 2; i <= num; i++) res *= i;
    return res;
  },

  gcd: (aVal: PlainValue, bVal: PlainValue): number => {
    let a = Math.abs(Math.round(mathBuiltins.to_number(aVal)));
    let b = Math.abs(Math.round(mathBuiltins.to_number(bVal)));
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  },

  lcm: (aVal: PlainValue, bVal: PlainValue): number => {
    const a = Math.abs(Math.round(mathBuiltins.to_number(aVal)));
    const b = Math.abs(Math.round(mathBuiltins.to_number(bVal)));
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / mathBuiltins.gcd(a, b);
  },

  is_prime: (nVal: PlainValue): boolean => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  },

  next_prime: (nVal: PlainValue): number => {
    let n = Math.round(mathBuiltins.to_number(nVal)) + 1;
    while (!mathBuiltins.is_prime(n)) {
      n++;
    }
    return n;
  },

  primes_up_to: (limitVal: PlainValue): number[] => {
    const limit = Math.round(mathBuiltins.to_number(limitVal));
    const primes: number[] = [];
    for (let i = 2; i <= limit; i++) {
      if (mathBuiltins.is_prime(i)) primes.push(i);
    }
    return primes;
  },

  factors: (nVal: PlainValue): number[] => {
    const n = Math.abs(Math.round(mathBuiltins.to_number(nVal)));
    const res: number[] = [];
    for (let i = 1; i <= n; i++) {
      if (n % i === 0) res.push(i);
    }
    return res;
  },

  is_even: (nVal: PlainValue): boolean => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    return n % 2 === 0;
  },

  is_odd: (nVal: PlainValue): boolean => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    return n % 2 !== 0;
  },

  sign: (nVal: PlainValue): number => {
    const n = mathBuiltins.to_number(nVal);
    return Math.sign(n);
  },

  clamp: (val: PlainValue, minVal: PlainValue, maxVal: PlainValue): number => {
    const v = mathBuiltins.to_number(val);
    const min = mathBuiltins.to_number(minVal);
    const max = mathBuiltins.to_number(maxVal);
    return Math.min(Math.max(v, min), max);
  },

  percentage: (partVal: PlainValue, totalVal: PlainValue): number => {
    const total = mathBuiltins.to_number(totalVal);
    if (total === 0) throw new PlainError("Cannot calculate percentage of a total of zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return (mathBuiltins.to_number(partVal) / total) * 100;
  },

  percent_change: (oldVal: PlainValue, newVal: PlainValue): number => {
    const oldV = mathBuiltins.to_number(oldVal);
    if (oldV === 0) throw new PlainError("Initial value cannot be zero for percent change.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return ((mathBuiltins.to_number(newVal) - oldV) / oldV) * 100;
  },

  // Trigonometry (takes degrees for student simplicity, or standard rad)
  sine: (degVal: PlainValue): number => {
    const rad = (mathBuiltins.to_number(degVal) * Math.PI) / 180;
    return Math.sin(rad);
  },

  cosine: (degVal: PlainValue): number => {
    const rad = (mathBuiltins.to_number(degVal) * Math.PI) / 180;
    return Math.cos(rad);
  },

  tangent: (degVal: PlainValue): number => {
    const rad = (mathBuiltins.to_number(degVal) * Math.PI) / 180;
    return Math.tan(rad);
  },

  arcsine: (val: PlainValue): number => {
    const n = mathBuiltins.to_number(val);
    return (Math.asin(n) * 180) / Math.PI;
  },

  arccosine: (val: PlainValue): number => {
    const n = mathBuiltins.to_number(val);
    return (Math.acos(n) * 180) / Math.PI;
  },

  arctangent: (val: PlainValue): number => {
    const n = mathBuiltins.to_number(val);
    return (Math.atan(n) * 180) / Math.PI;
  },

  to_degrees: (radVal: PlainValue): number => {
    return (mathBuiltins.to_number(radVal) * 180) / Math.PI;
  },

  to_radians: (degVal: PlainValue): number => {
    return (mathBuiltins.to_number(degVal) * Math.PI) / 180;
  },

  // Logarithms & Exponentials
  log: (nVal: PlainValue): number => {
    const n = mathBuiltins.to_number(nVal);
    if (n <= 0) throw new PlainError("Logarithm is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return Math.log(n);
  },

  log10: (nVal: PlainValue): number => {
    const n = mathBuiltins.to_number(nVal);
    if (n <= 0) throw new PlainError("Logarithm base 10 is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return Math.log10(n);
  },

  log2: (nVal: PlainValue): number => {
    const n = mathBuiltins.to_number(nVal);
    if (n <= 0) throw new PlainError("Logarithm base 2 is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return Math.log2(n);
  },

  exp: (nVal: PlainValue): number => {
    return Math.exp(mathBuiltins.to_number(nVal));
  },

  pi: (): number => Math.PI,
  euler_e: (): number => Math.E,

  // Financial / Student Math
  simple_interest: (principalVal: PlainValue, ratePercentVal: PlainValue, timeYearsVal: PlainValue): number => {
    const p = mathBuiltins.to_number(principalVal);
    const r = mathBuiltins.to_number(ratePercentVal) / 100;
    const t = mathBuiltins.to_number(timeYearsVal);
    return p * r * t;
  },

  compound_interest: (pVal: PlainValue, rVal: PlainValue, tVal: PlainValue, nVal?: PlainValue): number => {
    const p = mathBuiltins.to_number(pVal);
    const r = mathBuiltins.to_number(rVal) / 100;
    const t = mathBuiltins.to_number(tVal);
    const n = nVal ? mathBuiltins.to_number(nVal) : 1; // n is compounding frequency (default annual)
    return p * Math.pow(1 + r / n, n * t) - p;
  },

  permutations: (nVal: PlainValue, rVal: PlainValue): number => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    const r = Math.round(mathBuiltins.to_number(rVal));
    if (r < 0 || r > n) return 0;
    return mathBuiltins.factorial(n) / mathBuiltins.factorial(n - r);
  },

  combinations: (nVal: PlainValue, rVal: PlainValue): number => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    const r = Math.round(mathBuiltins.to_number(rVal));
    if (r < 0 || r > n) return 0;
    return mathBuiltins.factorial(n) / (mathBuiltins.factorial(r) * mathBuiltins.factorial(n - r));
  },

  quadratic_roots: (aVal: PlainValue, bVal: PlainValue, cVal: PlainValue): PlainValue[] => {
    const a = mathBuiltins.to_number(aVal);
    const b = mathBuiltins.to_number(bVal);
    const c = mathBuiltins.to_number(cVal);
    if (a === 0) throw new PlainError("In ax^2 + bx + c = 0, 'a' cannot be 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const disc = b * b - 4 * a * c;
    if (disc < 0) return []; // no real roots
    if (disc === 0) return [-b / (2 * a)];
    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
    return [r1, r2];
  }
};
