"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linearAlgebraBuiltins = void 0;
exports.linearAlgebraBuiltins = {
    // 1. Matrix Creation & Inspection
    matrix_create: (rows, cols, fillVal = 0) => {
        const r = Math.max(1, Math.floor(Number(rows)));
        const c = Math.max(1, Math.floor(Number(cols)));
        const v = Number(fillVal);
        return Array.from({ length: r }, () => new Array(c).fill(v));
    },
    matrix_zeros: (rows, cols) => {
        const r = Math.max(1, Math.floor(Number(rows)));
        const c = Math.max(1, Math.floor(Number(cols)));
        return Array.from({ length: r }, () => new Array(c).fill(0));
    },
    matrix_ones: (rows, cols) => {
        const r = Math.max(1, Math.floor(Number(rows)));
        const c = Math.max(1, Math.floor(Number(cols)));
        return Array.from({ length: r }, () => new Array(c).fill(1));
    },
    matrix_eye: (size) => {
        const n = Math.max(1, Math.floor(Number(size)));
        return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    },
    matrix_random: (rows, cols, min = 0, max = 1) => {
        const r = Math.max(1, Math.floor(Number(rows)));
        const c = Math.max(1, Math.floor(Number(cols)));
        return Array.from({ length: r }, () => Array.from({ length: c }, () => min + Math.random() * (max - min)));
    },
    matrix_shape: (matrix) => {
        if (!Array.isArray(matrix) || matrix.length === 0)
            return [0, 0];
        const r = matrix.length;
        const c = Array.isArray(matrix[0]) ? matrix[0].length : 1;
        return [r, c];
    },
    matrix_reshape: (matrix, newRows, newCols) => {
        const flat = Array.isArray(matrix)
            ? matrix.flat(Infinity).map(Number)
            : [Number(matrix)];
        const r = Math.max(1, Math.floor(Number(newRows)));
        const c = Math.max(1, Math.floor(Number(newCols)));
        const result = [];
        for (let i = 0; i < r; i++) {
            result.push(flat.slice(i * c, (i + 1) * c));
        }
        return result;
    },
    // 2. Matrix Arithmetic
    matrix_add: (a, b) => {
        const matA = Array.isArray(a) ? a : [];
        const matB = Array.isArray(b) ? b : [];
        return matA.map((row, i) => row.map((val, j) => Number(val) + Number(matB[i]?.[j] ?? 0)));
    },
    matrix_sub: (a, b) => {
        const matA = Array.isArray(a) ? a : [];
        const matB = Array.isArray(b) ? b : [];
        return matA.map((row, i) => row.map((val, j) => Number(val) - Number(matB[i]?.[j] ?? 0)));
    },
    matrix_scale: (matrix, scalar) => {
        const mat = Array.isArray(matrix) ? matrix : [];
        const s = Number(scalar);
        return mat.map((row) => row.map((val) => Number(val) * s));
    },
    matrix_mult: (a, b) => {
        const matA = Array.isArray(a) ? a : [];
        const matB = Array.isArray(b) ? b : [];
        const rA = matA.length;
        const cA = matA[0]?.length || 0;
        const rB = matB.length;
        const cB = matB[0]?.length || 0;
        if (cA !== rB) {
            throw new Error(`Matrix dimension mismatch for multiplication: (${rA}x${cA}) and (${rB}x${cB})`);
        }
        const result = Array.from({ length: rA }, () => new Array(cB).fill(0));
        for (let i = 0; i < rA; i++) {
            for (let j = 0; j < cB; j++) {
                let sum = 0;
                for (let k = 0; k < cA; k++) {
                    sum += Number(matA[i][k]) * Number(matB[k][j]);
                }
                result[i][j] = sum;
            }
        }
        return result;
    },
    matrix_elementwise_mult: (a, b) => {
        const matA = Array.isArray(a) ? a : [];
        const matB = Array.isArray(b) ? b : [];
        return matA.map((row, i) => row.map((val, j) => Number(val) * Number(matB[i]?.[j] ?? 1)));
    },
    matrix_transpose: (matrix) => {
        const mat = Array.isArray(matrix) ? matrix : [];
        if (mat.length === 0)
            return [];
        const r = mat.length;
        const c = mat[0].length;
        const res = Array.from({ length: c }, () => new Array(r).fill(0));
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                res[j][i] = mat[i][j];
            }
        }
        return res;
    },
    matrix_trace: (matrix) => {
        const mat = Array.isArray(matrix) ? matrix : [];
        let sum = 0;
        for (let i = 0; i < Math.min(mat.length, mat[0]?.length || 0); i++) {
            sum += Number(mat[i][i]);
        }
        return sum;
    },
    matrix_determinant: (matrix) => {
        const mat = Array.isArray(matrix) ? matrix.map((r) => r.map(Number)) : [];
        const n = mat.length;
        if (n === 1)
            return mat[0][0];
        if (n === 2)
            return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];
        // Recursive Laplace expansion for N <= 4
        let det = 0;
        for (let c = 0; c < n; c++) {
            const sub = mat.slice(1).map((r) => r.filter((_, idx) => idx !== c));
            const sign = c % 2 === 0 ? 1 : -1;
            det += sign * mat[0][c] * exports.linearAlgebraBuiltins.matrix_determinant(sub);
        }
        return det;
    },
    matrix_inverse_2x2: (matrix) => {
        const m = Array.isArray(matrix) ? matrix : [];
        const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
        if (Math.abs(det) < 1e-12) {
            throw new Error("Matrix is singular and cannot be inverted.");
        }
        const invDet = 1 / det;
        return [
            [m[1][1] * invDet, -m[0][1] * invDet],
            [-m[1][0] * invDet, m[0][0] * invDet]
        ];
    },
    matrix_vector_mult: (matrix, vector) => {
        const mat = Array.isArray(matrix) ? matrix : [];
        const vec = Array.isArray(vector) ? vector.map(Number) : [Number(vector)];
        return mat.map((row) => row.reduce((acc, val, idx) => acc + Number(val) * (vec[idx] ?? 0), 0));
    },
    // 3. Vector Operations
    vector_dot: (a, b) => {
        const vecA = Array.isArray(a) ? a.map(Number) : [Number(a)];
        const vecB = Array.isArray(b) ? b.map(Number) : [Number(b)];
        let sum = 0;
        for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
            sum += vecA[i] * vecB[i];
        }
        return sum;
    },
    vector_cross_3d: (a, b) => {
        const v1 = Array.isArray(a) ? a.map(Number) : [];
        const v2 = Array.isArray(b) ? b.map(Number) : [];
        return [
            (v1[1] ?? 0) * (v2[2] ?? 0) - (v1[2] ?? 0) * (v2[1] ?? 0),
            (v1[2] ?? 0) * (v2[0] ?? 0) - (v1[0] ?? 0) * (v2[2] ?? 0),
            (v1[0] ?? 0) * (v2[1] ?? 0) - (v1[1] ?? 0) * (v2[0] ?? 0)
        ];
    },
    vector_magnitude: (v) => {
        const vec = Array.isArray(v) ? v.map(Number) : [Number(v)];
        return Math.sqrt(vec.reduce((acc, x) => acc + x * x, 0));
    },
    vector_normalize: (v) => {
        const vec = Array.isArray(v) ? v.map(Number) : [Number(v)];
        const mag = Math.sqrt(vec.reduce((acc, x) => acc + x * x, 0));
        return mag === 0 ? vec : vec.map((x) => x / mag);
    },
    vector_distance: (a, b) => {
        const vecA = Array.isArray(a) ? a.map(Number) : [];
        const vecB = Array.isArray(b) ? b.map(Number) : [];
        let sum = 0;
        for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
            sum += Math.pow(vecA[i] - vecB[i], 2);
        }
        return Math.sqrt(sum);
    },
    vector_angle_rad: (a, b) => {
        const dot = exports.linearAlgebraBuiltins.vector_dot(a, b);
        const magA = exports.linearAlgebraBuiltins.vector_magnitude(a);
        const magB = exports.linearAlgebraBuiltins.vector_magnitude(b);
        if (magA === 0 || magB === 0)
            return 0;
        return Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB))));
    },
    vector_angle_deg: (a, b) => {
        return (exports.linearAlgebraBuiltins.vector_angle_rad(a, b) * 180) / Math.PI;
    },
    vector_lerp: (a, b, t) => {
        const vecA = Array.isArray(a) ? a.map(Number) : [];
        const vecB = Array.isArray(b) ? b.map(Number) : [];
        const factor = Number(t);
        return vecA.map((val, i) => val + factor * ((vecB[i] ?? val) - val));
    },
    // 4. Equation Solvers
    solve_system_2x2: (a, b, e, c, d, f) => {
        // ax + by = e
        // cx + dy = f
        const det = a * d - b * c;
        if (Math.abs(det) < 1e-12) {
            throw new Error("System of equations has no unique solution (determinant is 0).");
        }
        const x = (e * d - b * f) / det;
        const y = (a * f - e * c) / det;
        return { x, y };
    }
};
//# sourceMappingURL=linear_algebra.js.map