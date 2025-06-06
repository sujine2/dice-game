/* Tag constant value */
const button = document.querySelector(".roll-button");
const dice = document.querySelector(".dice");
const result = document.querySelector(".roll-result");
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

/**
 * Get a random number on initial page load
 */
window.onload = function () {
  getRandomNumber();
};

/**
 * Generate a random number and display it in the element with ID 'number
 */
function getRandomNumber() {
  const random = Math.floor(Math.random() * 6) + 1; // 1~6
  targetNum = random;
  document.getElementById("number").textContent = random;
}

/**
 * Add the selected class to the selected `choice` and
 * remove the selected class from all other guess buttons
 *
 * @param {*} choice Guess button selected by the user - lower/equal/higher
 */
function selectResult(choice) {
  userGuess = choice;
  document.querySelectorAll(".guess-button").forEach((btn) => {
    btn.classList.remove("selected");
  });
  document.querySelector(`.${choice}`).classList.add("selected");

  button.style.display = "block";
}

/**
 * 	Main handle dice roll
 */
let initialized = false;
let rollResult = null;
async function handleRoll() {
  // The guess (lose/equal/higher) cannot be changed while the dice is rolling
  document.querySelectorAll(".guess-button").forEach((btn) => {
    if (!btn.classList.contains(userGuess)) {
      btn.disabled = true;
    }
  });

  // If it's the first roll, reset the rotating dice to its initial position
  if (!initialized) {
    initialized = await initDice();
  } else {
    result.textContent = "";
  }

  // Determine win or loss based on the user's guess
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

    setTimeout(() => {
      finalResult = isWin ? "Win" : "Lose";
      result.textContent = finalResult;

      // Show confetti effect if the user win
      if (isWin) {
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.6 },
        });
      } else {
        // Play shake animation if the user loses (add shake class to element)
        const elements = [result, question, document.querySelector(".roll")];

        elements.forEach((el) => triggerShake(el));
        setTimeout(() => {
          elements.forEach((el) => el.classList.remove("shake"));
        }, 1500);
      }

      // Show history table and add data
      table.style.display = "block";
      addHistoryRow(userGuess, targetNum, rollResult, finalResult);

      document.querySelectorAll(".guess-button").forEach((btn) => {
        btn.disabled = false;
      });

      // Change taget number
      setTimeout(() => {
        getRandomNumber();
      }, 1200);
    }, 1500);
  }, 200);
}

/**
 * Get rotate degree
 * @returns Result of the roll dice
 */
async function rollDice() {
  // Get random face 1 ~ 6
  const face = Math.floor(Math.random() * 6) + 1;
  // Rotation for face
  const [xDeg, yDeg] = FACE_ROTATIONS[face];

  // Add an extra rotation by a multiple of 360 degrees for a smooth spin
  const spinX = 360 * (Math.floor(Math.random() * 2) + 1);
  const spinY = 360 * (Math.floor(Math.random() * 2) + 1);
  dice.style.transition = "transform 1.2s";
  dice.style.transform = `rotateX(${xDeg + spinX}deg) rotateY(${
    yDeg + spinY
  }deg)`;

  return face;
}

/**
 * Reset the rotating dice to 0 rotation
 * @returns Initialization status
 */
async function initDice() {
  dice.style.animation = "none";
  dice.style.transition = "transform 1.2s ease-in-out";
  dice.style.transform = `rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
  return true;
}

/**
 * Add shake class and remove shake class
 * @param {string} element Tag to shake when lose
 */
function triggerShake(element) {
  element.classList.remove("shake");
  void element.offsetWidth;
  element.classList.add("shake");
}

/**
 * Add history table row
 * @param {string} selection low/equal/higher value selected by user
 * @param {number} target Random target number
 * @param {number} rollResult Result of the roll
 * @param {string} result Win / Lose
 */
function addHistoryRow(selection, target, rollResult, result) {
  const tbody = document.querySelector(".history-table tbody");

  if (tbody.rows.length >= 5) {
    tbody.deleteRow(0);
    historyCount--;
  }

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><span class="guess-button ${selection}">${selection}</span></td>
    <td>${target}</td>
    <td>${rollResult}</td>
    <td>${result}</td>
  `;

  tbody.appendChild(row);
  historyCount++;
}
