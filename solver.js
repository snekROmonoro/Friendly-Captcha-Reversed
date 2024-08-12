const hashModule = require("./hash")

// pig
ASC_TARGET = 0;

function encodeBase64BytesArray(A) {
    const o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    const t = A.length;
    let e = "";
    for (let r = 0; r < t; r += 3) {
        const t = A[r + 0]
            , n = A[r + 1]
            , s = A[r + 2];
        e += o.charAt(t >>> 2),
            e += o.charAt((3 & t) << 4 | n >>> 4),
            e += o.charAt((15 & n) << 2 | s >>> 6),
            e += o.charAt(63 & s)
    }
    return t % 3 == 2 ? e = e.substring(0, e.length - 1) + "=" : t % 3 == 1 && (e = e.substring(0, e.length - 2) + "=="),
        e
}

async function fetchWrapper(A, t, e) {
    let retryInterval = 500;
    return fetch(A, t).catch((async o => {
        if (1 === e)
            throw o;
        return await new Promise((A => setTimeout(A, retryInterval))),
            retryInterval *= 4,
            fetchWrapper(A, t, e - 1)
    }
    ))
}

async function getPuzzle(endpoint, sitekey) {
    const data = await fetchWrapper(endpoint + "?sitekey=" + sitekey, {
        headers: [["x-frc-client", "js-0.6.0"]],
        mode: "cors"
    }, 2);
    if (data.ok)
        return (await data.json()).data.puzzle;
    throw Error(`Failure in getting puzzle: ${data.status} ${data.statusText}`)
}

const lettersNumbersSymbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    , whatever = "=".charCodeAt(0)
    , idfk = new Uint8Array(256);
for (let A = 0; A < lettersNumbersSymbols.length; A++) {
    idfk[lettersNumbersSymbols.charCodeAt(A)] = A;
}

function parsePuzzleSecond(data) {
    const t = data.length;
    let e = t * 3 >>> 2;
    if (data.charCodeAt(t - 1) === whatever) {
        e--;
    }
    if (data.charCodeAt(t - 2) === whatever) {
        e--;
    }
    const r = new Uint8Array(e);
    for (let e = 0, o = 0; e < t; e += 4) {
        const t = idfk[data.charCodeAt(e + 0)];
        const n = idfk[data.charCodeAt(e + 1)];
        const i = idfk[data.charCodeAt(e + 2)];
        const a = idfk[data.charCodeAt(e + 3)];
        r[o++] = t << 2 | n >> 4;
        r[o++] = (n & 15) << 4 | i >> 2;
        r[o++] = (i & 3) << 6 | a & 63;
    }
    return r;
}

function parsePuzzle(A) {
    const t = A.split(".")
        , e = t[1]
        , r = parsePuzzleSecond(e);

    return {
        signature: t[0],
        base64: e,
        buffer: r,
        n: r[14],
        threshold: (o = r[15],
            o > 255 ? o = 255 : o < 0 && (o = 0),
            Math.pow(2, (255.999 - o) / 8) >>> 0),
        expiry: 3e5 * r[13]
    };
}

const genSolution = (inputData, threshold, maxIterations = 4294967295) => [inputData, function (inputData, threshold, maxIterations) {
    // Ensure input data has the correct length
    if (inputData.length != 128) {
        throw new Error("Invalid input");
    }

    const buffer = inputData.buffer;
    const view = new DataView(buffer);
    const hashContext = new hashModule.HashContext(32);
    hashContext.t = 128;

    // Start processing from the point indicated by the 124th byte of the input data
    const initialCounter = view.getUint32(124, true);
    const finalCounter = initialCounter + maxIterations;

    // Loop through the range of counter values
    for (let counter = initialCounter; counter < finalCounter; counter++) {
        view.setUint32(124, counter, true);  // Update the counter in the data

        hashModule.InitializeHash(hashContext, inputData);  // Initialize the hash state
        hashModule.ProcessHash(hashContext, true);  // Process the hash with additional settings
        // Check if the first 32 bits of the hash meet the required threshold
        if (hashContext.h[0] < threshold) {
            if (ASC_TARGET === 0) {
                return new Uint8Array(hashContext.h.buffer);  // Return the solution
            } else {
                return Uint8Array.wrap(hashContext.h.buffer);
            }
        }
    }
    return new Uint8Array(0);  // Return an empty array if no solution is found
}(inputData, threshold, maxIterations)];

function getDiagnostics(t, e) {
    const r = new Uint8Array(3);
    const n = new DataView(r.buffer);
    n.setUint8(0, t);
    n.setUint16(1, e);
    return r;
}

async function solve(puzzle) {
    let e = Date.now();

    let r = 0;
    const s = function (t, e) {
        const r = [];
        for (let n = 0; n < e; n++) {
            const e = new Uint8Array(128);
            e.set(t);
            e[120] = n;
            r.push(e);
        }
        return r;
    }(puzzle.buffer, puzzle.n);

    const a = new Uint8Array(puzzle.n * 8);
    for (var o = 0; o < s.length; o++) {
        let i;
        for (var p = 0; p < 256; p++) {
            s[o][123] = p;
            const shit = genSolution(s[o], puzzle.threshold);
            const [e, r] = shit;
            if (r.length !== 0) {
                i = e;
                break;
            }
            console.warn("FC: Internal error or no solution found");
        }
        const c = new DataView(i.slice(-4).buffer).getUint32(0, true);
        r += c;
        a.set(i.slice(-8), o * 8);
    }

    const i = (Date.now() - e) / 1000;
    return { solution: a, diagnostics: getDiagnostics(1, i), solver: 1 };
}

module.exports = async function (puzzleEndpoint, sitekey) {
    const puzzle = await getPuzzle(puzzleEndpoint, sitekey)
    const parsedPuzzle = parsePuzzle(puzzle)

    const solutionData = await solve(parsedPuzzle)

    return `${parsedPuzzle.signature}.${parsedPuzzle.base64}.${encodeBase64BytesArray(solutionData.solution)}.${encodeBase64BytesArray(solutionData.diagnostics)}`
};
