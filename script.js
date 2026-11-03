let bits = ["0","0","0","0","0","0","0","0","0"];
let generated = false;
let parityType = "";

const boxes = [];
for (let i = 0; i < 9; i++) boxes.push(document.getElementById("b" + i));
const message = document.getElementById("message");
const stepsList = document.getElementById("steps");
const hint = document.getElementById("hint");

function draw() {
  for (let i = 0; i < 9; i++) {
    boxes[i].textContent = bits[i];
    boxes[i].classList.toggle("one", bits[i] === "1");
  }
}

function showMessage(text, cls) {
  message.textContent = text;
  message.className = "message " + (cls || "");
}

function showSteps(steps) {
  stepsList.innerHTML = "";
  steps.forEach(function (s) {
    const li = document.createElement("li");
    li.textContent = s;
    stepsList.appendChild(li);
  });
}

// Click a bit
boxes.forEach(function (box, i) {
  box.addEventListener("click", function () {
    if (!generated && i === 8) return;
    const word = bits.join("");
    bits = flipBit(word, i).split("");
    if (generated) {
      box.classList.toggle("error");
      showMessage("Bit " + (i + 1) + " flipped. Press Check.", "");
    }
    draw();
  });
});

function generate(type) {
  const data = bits.slice(0, 8).join("");
  const result = generateCodeword(data, type);
  if (result.error) { showMessage(result.error, "bad"); return; }
  bits = result.codeword.split("");
  generated = true;
  parityType = type;
  boxes[8].classList.remove("hidden");
  boxes.forEach(function (b) { b.classList.remove("error"); });
  hint.textContent = "Now click any bit to make an error, then press Check.";
  showMessage("Parity bit = " + result.parityBit + "  |  Codeword = " + result.codeword, "");
  showSteps(result.steps);
  draw();
}

document.getElementById("evenBtn").addEventListener("click", function () { generate("even"); });
document.getElementById("oddBtn").addEventListener("click", function () { generate("odd"); });

document.getElementById("checkBtn").addEventListener("click", function () {
  if (!generated) { showMessage("First press Even or Odd Parity.", "bad"); return; }
  const result = checkParity(bits.join(""), parityType);
  if (result.error) { showMessage(result.error, "bad"); return; }
  showMessage(result.message, result.hasError ? "bad" : "ok");
  showSteps(result.steps);
});

document.getElementById("resetBtn").addEventListener("click", function () {
  bits = ["0","0","0","0","0","0","0","0","0"];
  generated = false;
  parityType = "";
  boxes[8].classList.add("hidden");
  boxes.forEach(function (b) { b.classList.remove("error"); });
  hint.textContent = "Click the boxes to set your 8 data bits, then press Even or Odd Parity.";
  showMessage("Message will show here", "");
  stepsList.innerHTML = "";
  draw();
});

draw();