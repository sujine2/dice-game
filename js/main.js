const button = document.querySelector(".roll");
const dice = document.querySelector(".dice");
const result = document.querySelector(".result");
const question = document.querySelector(".question");
const tbody = document.querySelector(".history-table tbody");
const table = document.querySelector(".history-table");

const FACE_ROTATIONS = {
  1: [0, 0], // 앞면
  2: [0, 90], // 왼쪽
  3: [90, 0], // 위
  4: [-90, 0], // 아래
  5: [0, -90], // 오른쪽
  6: [180, 0], // 뒷면
};

let userGuess = null;
let targetNum = null;
let historyCount = 0;

window.onload = function () {
  getRandomNumber();
};

function getRandomNumber() {
  const random = Math.floor(Math.random() * 6) + 1; // 1~6
  targetNum = random;
  document.getElementById("number").textContent = random;
}

function selectResult(choice) {
  userGuess = choice;

  document.querySelectorAll(".guess").forEach((btn) => {
    btn.classList.remove("selected");
  });
  document.querySelector(`.${choice}`).classList.add("selected");

  button.style.display = "block";
}

let initialized = false;
let rollResult = null;
async function handleRoll() {
  document.querySelectorAll(".guess").forEach((btn) => {
    if (!btn.classList.contains(userGuess)) {
      btn.disabled = true;
    }
  });

  if (!initialized) {
    initialized = await initDice();
  } else {
    result.textContent = "";
  }

  setTimeout(async () => {
    rollResult = await rollDice();

    let isWin = false;
    switch (userGuess) {
      case "equal":
        isWin = rollResult == targetNum;
        break;
      case "lower":
        isWin = rollResult < targetNum;
        break;
      case "higher":
        isWin = rollResult > targetNum;
        break;
      default:
        result.textContent = "";
    }
    console.log(
      `result: ${rollResult}, select ${userGuess}, target: ${targetNum}`
    );

    setTimeout(() => {
      finalResult = isWin ? "Win" : "Lose";
      result.textContent = finalResult;

      if (isWin) {
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
        });
      } else {
        const elements = [
          result,
          question,
          document.querySelector(".dice-button"),
        ];

        elements.forEach((el) => triggerShake(el));

        setTimeout(() => {
          elements.forEach((el) => el.classList.remove("shake"));
        }, 1500);
      }
      table.style.display = "block";
      addHistoryRow(userGuess, targetNum, rollResult, finalResult);

      document.querySelectorAll(".guess").forEach((btn) => {
        btn.disabled = false;
      });
      getRandomNumber();
    }, 1500);
  }, 200);
}

async function rollDice() {
  // 1~6 중 하나를 랜덤으로 뽑음
  const face = Math.floor(Math.random() * 6) + 1;
  // 해당 눈의 각도
  const [xDeg, yDeg] = FACE_ROTATIONS[face];

  // 자연스러운 회전을 위해 360의 배수만큼 추가 회전
  const spinX = 360 * (Math.floor(Math.random() * 2) + 1);
  const spinY = 360 * (Math.floor(Math.random() * 2) + 1);

  // transform 적용
  dice.style.transition = "transform 1.2s";
  dice.style.transform = `rotateX(${xDeg + spinX}deg) rotateY(${
    yDeg + spinY
  }deg)`;

  return face;
}

async function initDice() {
  dice.style.animation = "none";
  dice.style.transition = "transform 1.2s ease-in-out";
  dice.style.transform = `rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
  return true;
}

function triggerShake(element) {
  element.classList.remove("shake");
  void element.offsetWidth;
  element.classList.add("shake");
}

function addHistoryRow(selection, target, rollResult, result) {
  const tbody = document.querySelector(".history-table tbody");

  if (tbody.rows.length >= 5) {
    tbody.deleteRow(0);
    historyCount--;
  }

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><span class="guess ${selection}">${selection}</span></td>
    <td>${target}</td>
    <td>${rollResult}</td>
    <td>${result}</td>
  `;

  tbody.appendChild(row);
  historyCount++;
}
