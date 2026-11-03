// ============================================================
// parity.js  -  BACKEND LOGIC (Hammad Haider, Fa-2024/BS CS/147)
// Project: Parity Bit Generator & Error Checker
// Topic: Error Detection (Computer Architecture)
// ============================================================
// Bits are handled as STRINGS of "0" and "1", e.g. "10110010".
// Ahmad (frontend) only needs to call the functions below.

// ---------- Helper: validate input ----------
function isValidBits(bits, length) {
  if (typeof bits !== "string") return false;
  if (bits.length !== length) return false;
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] !== "0" && bits[i] !== "1") return false;
  }
  return true;
}

// ---------- FEATURE 4: Count of 1s with steps ----------
// Returns { count, steps[] } so the page can show the working.
function countOnes(bits) {
  let count = 0;
  const steps = [];
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === "1") {
      count++;
      steps.push("Bit " + (i + 1) + " = 1  ->  count becomes " + count);
    } else {
      steps.push("Bit " + (i + 1) + " = 0  ->  count stays " + count);
    }
  }
  steps.push("Total number of 1s = " + count);
  steps.push(count + " % 2 = " + (count % 2) + (count % 2 === 0 ? "  (even number of 1s)" : "  (odd number of 1s)"));
  return { count: count, steps: steps };
}

// ---------- FEATURE 1: Parity bit generator ----------
// type = "even" or "odd"
// Even parity: total 1s (data + parity bit) must be EVEN.
// Odd parity : total 1s (data + parity bit) must be ODD.
function getParityBit(bits, type) {
  const count = countOnes(bits).count;
  if (type === "even") {
    return count % 2 === 0 ? "0" : "1";
  } else {
    return count % 2 === 0 ? "1" : "0";
  }
}

// Builds the 9-bit codeword = 8 data bits + parity bit (at the end)
// Returns an object, or { error } if input is wrong.
function generateCodeword(bits, type) {
  if (!isValidBits(bits, 8)) {
    return { error: "Please enter exactly 8 bits (only 0 and 1)." };
  }
  if (type !== "even" && type !== "odd") {
    return { error: "Parity type must be 'even' or 'odd'." };
  }
  const result = countOnes(bits);
  const parityBit = getParityBit(bits, type);
  const steps = result.steps.slice();
  steps.push("Rule: " + type + " parity -> total 1s must be " + type);
  steps.push("So parity bit = " + parityBit);
  return {
    data: bits,
    parityBit: parityBit,
    codeword: bits + parityBit,
    count: result.count,
    steps: steps
  };
}

// ---------- FEATURE 2 (logic part): Click a bit to make an error ----------
// Flips the bit at position index (0 to 8) of the codeword.
function flipBit(codeword, index) {
  if (index < 0 || index >= codeword.length) return codeword;
  const flipped = codeword[index] === "0" ? "1" : "0";
  return codeword.slice(0, index) + flipped + codeword.slice(index + 1);
}

// ---------- FEATURE 3: Checker ----------
// Takes the received 9-bit word and checks it.
function checkParity(received, type) {
  if (!isValidBits(received, 9)) {
    return { error: "Received data must be exactly 9 bits (only 0 and 1)." };
  }
  const result = countOnes(received);
  const ok = type === "even" ? result.count % 2 === 0 : result.count % 2 === 1;
  const steps = result.steps.slice();
  steps.push("Rule: " + type + " parity -> total 1s should be " + type);
  return {
    count: result.count,
    hasError: !ok,
    message: ok ? "No error" : "Error found",
    steps: steps
  };
}

// Make the functions usable from Node (for tests) and from the browser (for Ahmad's page)
if (typeof module !== "undefined") {
  module.exports = { isValidBits, countOnes, getParityBit, generateCodeword, flipBit, checkParity };
}

// ============================================================
// 10 TEST CASES  (run with:  node parity.js)
// ============================================================
if (typeof require !== "undefined" && require.main === module) {
  let passed = 0;
  const tests = [
    // [name, actual, expected]
    ["1. Even parity, data 10110010 (4 ones) -> parity bit 0",
      getParityBit("10110010", "even"), "0"],
    ["2. Even parity, data 10110011 (5 ones) -> parity bit 1",
      getParityBit("10110011", "even"), "1"],
    ["3. Odd parity, data 10110010 (4 ones) -> parity bit 1",
      getParityBit("10110010", "odd"), "1"],
    ["4. Odd parity, data 10110011 (5 ones) -> parity bit 0",
      getParityBit("10110011", "odd"), "0"],
    ["5. All zeros 00000000, even -> parity bit 0",
      getParityBit("00000000", "even"), "0"],
    ["6. All ones 11111111, even (8 ones) -> parity bit 0",
      getParityBit("11111111", "even"), "0"],
    ["7. Correct data 101100100 (even) -> No error",
      checkParity("101100100", "even").message, "No error"],
    ["8. One bit flipped (bit 3 of 101100100) -> Error found",
      checkParity(flipBit("101100100", 2), "even").message, "Error found"],
    ["9. Two bits flipped -> No error (parity cannot detect 2 errors!)",
      checkParity(flipBit(flipBit("101100100", 0), 1), "even").message, "No error"],
    ["10. Invalid input '1011' -> error message",
      generateCodeword("1011", "even").error, "Please enter exactly 8 bits (only 0 and 1)."]
  ];

  tests.forEach(function (t) {
    const ok = t[1] === t[2];
    if (ok) passed++;
    console.log((ok ? "PASS  " : "FAIL  ") + t[0] + (ok ? "" : "   (got: " + t[1] + ")"));
  });
  console.log("\n" + passed + " / " + tests.length + " tests passed");
}
