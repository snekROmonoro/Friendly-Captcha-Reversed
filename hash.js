class HashContext {
    constructor(t) {
        this.b = new Uint8Array(128);
        this.h = new Uint32Array(16);
        this.t = 0;
        this.c = 0;
        this.v = new Uint32Array(32);
        this.m = new Uint32Array(32);
        this.outlen = t;
    }
}

function r(t, e) {
    return t[e] ^ t[e + 1] << 8 ^ t[e + 2] << 16 ^ t[e + 3] << 24;
}
function n(t, e, r, n, s, o, a, i) {
    const c = e[a];
    const f = e[a + 1];
    const l = e[i];
    const u = e[i + 1];
    let y;
    let p;
    let w;
    let h;
    let _ = t[r];
    let A = t[r + 1];
    let g = t[n];
    let U = t[n + 1];
    let b = t[s];
    let m = t[s + 1];
    let d = t[o];
    let v = t[o + 1];
    y = _ + g;
    p = (_ & g | (_ | g) & ~y) >>> 31;
    _ = y;
    A = A + U + p;
    y = _ + c;
    p = (_ & c | (_ | c) & ~y) >>> 31;
    _ = y;
    A = A + f + p;
    w = d ^ _;
    h = v ^ A;
    d = h;
    v = w;
    y = b + d;
    p = (b & d | (b | d) & ~y) >>> 31;
    b = y;
    m = m + v + p;
    w = g ^ b;
    h = U ^ m;
    g = w >>> 24 ^ h << 8;
    U = h >>> 24 ^ w << 8;
    y = _ + g;
    p = (_ & g | (_ | g) & ~y) >>> 31;
    _ = y;
    A = A + U + p;
    y = _ + l;
    p = (_ & l | (_ | l) & ~y) >>> 31;
    _ = y;
    A = A + u + p;
    w = d ^ _;
    h = v ^ A;
    d = w >>> 16 ^ h << 16;
    v = h >>> 16 ^ w << 16;
    y = b + d;
    p = (b & d | (b | d) & ~y) >>> 31;
    b = y;
    m = m + v + p;
    w = g ^ b;
    h = U ^ m;
    g = h >>> 31 ^ w << 1;
    U = w >>> 31 ^ h << 1;
    t[r] = _;
    t[r + 1] = A;
    t[n] = g;
    t[n + 1] = U;
    t[s] = b;
    t[s + 1] = m;
    t[o] = d;
    t[o + 1] = v;
}
const s = [4089235720, 1779033703, 2227873595, 3144134277, 4271175723, 1013904242, 1595750129, 2773480762, 2917565137, 1359893119, 725511199, 2600822924, 4215389547, 528734635, 327033209, 1541459225];
const o = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 28, 20, 8, 16, 18, 30, 26, 12, 2, 24, 0, 4, 22, 14, 10, 6, 22, 16, 24, 0, 10, 4, 30, 26, 20, 28, 6, 12, 14, 2, 18, 8, 14, 18, 6, 2, 26, 24, 22, 28, 4, 12, 10, 20, 8, 0, 30, 16, 18, 0, 10, 14, 4, 8, 20, 30, 28, 2, 22, 24, 12, 16, 6, 26, 4, 24, 12, 20, 0, 22, 16, 6, 8, 26, 14, 10, 30, 28, 2, 18, 24, 10, 2, 30, 28, 26, 8, 20, 0, 14, 12, 6, 18, 4, 16, 22, 26, 22, 14, 28, 24, 2, 6, 18, 10, 0, 30, 8, 16, 12, 4, 20, 12, 30, 28, 18, 22, 6, 0, 16, 24, 4, 26, 14, 2, 8, 20, 10, 20, 4, 16, 8, 14, 12, 2, 10, 30, 22, 18, 28, 6, 24, 26, 0, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 28, 20, 8, 16, 18, 30, 26, 12, 2, 24, 0, 4, 22, 14, 10, 6];
function ProcessHash(t, e) {
    const a = t.v;
    const i = t.m;
    for (let e = 0; e < 16; e++) {
        a[e] = t.h[e];
        a[e + 16] = s[e];
    }
    a[24] = a[24] ^ t.t;
    a[25] = a[25] ^ t.t / 4294967296;
    if (e) {
        a[28] = ~a[28];
        a[29] = ~a[29];
    }
    for (let e = 0; e < 32; e++) {
        i[e] = r(t.b, e * 4);
    }
    for (let t = 0; t < 12; t++) {
        n(a, i, 0, 8, 16, 24, o[t * 16 + 0], o[t * 16 + 1]);
        n(a, i, 2, 10, 18, 26, o[t * 16 + 2], o[t * 16 + 3]);
        n(a, i, 4, 12, 20, 28, o[t * 16 + 4], o[t * 16 + 5]);
        n(a, i, 6, 14, 22, 30, o[t * 16 + 6], o[t * 16 + 7]);
        n(a, i, 0, 10, 20, 30, o[t * 16 + 8], o[t * 16 + 9]);
        n(a, i, 2, 12, 22, 24, o[t * 16 + 10], o[t * 16 + 11]);
        n(a, i, 4, 14, 16, 26, o[t * 16 + 12], o[t * 16 + 13]);
        n(a, i, 6, 8, 18, 28, o[t * 16 + 14], o[t * 16 + 15]);
    }
    for (let e = 0; e < 16; e++) {
        t.h[e] = t.h[e] ^ a[e] ^ a[e + 16];
    }
}
function InitializeHash(t, e) {
    for (let e = 0; e < 16; e++) {
        t.h[e] = s[e];
    }
    t.b.set(e);
    t.h[0] ^= t.outlen ^ 16842752;
}

module.exports = {
    HashContext,
    ProcessHash,
    InitializeHash
}
