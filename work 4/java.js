(function () {
  let secretNumber = null;
  let attempts = 0;
  let isGameOver = false;
  let guessHistory = [];

  const guessInput = document.getElementById("guessInput");
  const checkBtn = document.getElementById("checkBtn");
  const newGameBtn = document.getElementById("newGameBtn");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const attemptSpan = document.getElementById("attemptCount");
  const progressValue = document.getElementById("progressValue");
  const messageBox = document.getElementById("messageBox");
  const historyArea = document.getElementById("historyArea");
  const gameCard = document.querySelector(".game-card");

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function updateProgress() {
    if (!secretNumber) return;
    const lastGuess = guessHistory[guessHistory.length - 1];
    if (lastGuess !== undefined && !isGameOver) {
      const diff = Math.abs(lastGuess - secretNumber);
      let percent = Math.max(
        0,
        Math.min(100, Math.floor(100 - (diff / 100) * 100)),
      );
      if (percent < 5) percent = 5;
      if (lastGuess === secretNumber) percent = 100;
      progressValue.innerText = `${percent}%`;
    } else if (isGameOver && guessHistory.includes(secretNumber)) {
      progressValue.innerText = `100%`;
    } else {
      progressValue.innerText = `0%`;
    }
  }

  function updateHistoryDisplay() {
    if (!historyArea) return;
    if (guessHistory.length === 0) {
      historyArea.innerHTML =
        '<div class="history-empty">— пока ничего —</div>';
      return;
    }
    let historyHtml = "";
    guessHistory.forEach((value) => {
      const isCorrect = value === secretNumber;
      const extraStyle = isCorrect
        ? 'style="background:#FFB347; color:#1A1F3A; border-color:#FFE0A3;"'
        : "";
      historyHtml += `<span ${extraStyle}>${value}</span>`;
    });
    historyArea.innerHTML = historyHtml;
    historyArea.scrollTop = historyArea.scrollHeight;
  }

  function setMessage(text, isError = false, isWin = false) {
    if (!messageBox) return;
    const iconSpan = messageBox.querySelector(".message-icon");
    const textSpan = messageBox.querySelector(".message-text");
    if (iconSpan) {
      if (isWin) iconSpan.innerHTML = "🏆";
      else if (isError) iconSpan.innerHTML = "⚠️";
      else iconSpan.innerHTML = "🌟";
    }
    if (textSpan) textSpan.innerText = text;

    messageBox.style.borderLeftColor = isWin
      ? "#FFD966"
      : isError
        ? "#FF6B6B"
        : "#FFB347";
    if (isWin) {
      messageBox.style.background = "rgba(255, 180, 70, 0.2)";
      gameCard.classList.add("win-glow");
      setTimeout(() => gameCard.classList.remove("win-glow"), 600);
    } else if (!isError) {
      messageBox.style.background = "rgba(0, 0, 0, 0.45)";
    } else {
      messageBox.style.background = "rgba(180, 50, 40, 0.35)";
      setTimeout(() => {
        if (messageBox.querySelector(".message-text")?.innerText === text)
          messageBox.style.background = "rgba(0, 0, 0, 0.45)";
      }, 1000);
    }
  }

  function winGame() {
    isGameOver = true;
    setMessage(
      `Ура! Число ${secretNumber} угадано за ${attempts} попыток!`,
      false,
      true,
    );
    checkBtn.disabled = true;
    guessInput.disabled = true;
    guessInput.style.opacity = "0.7";
    updateProgress();
    updateHistoryDisplay();
  }

  function handleGuess() {
    if (isGameOver) {
      setMessage("Игра завершена. Начни новую!", true);
      return;
    }

    const rawValue = guessInput.value.trim();
    if (rawValue === "") {
      setMessage("Введи число от 1 до 100", true);
      guessInput.value = "";
      guessInput.focus();
      return;
    }

    const guess = Number(rawValue);
    if (isNaN(guess) || !Number.isInteger(guess) || guess < 1 || guess > 100) {
      setMessage("Только целые числа от 1 до 100!", true);
      guessInput.value = "";
      guessInput.focus();
      return;
    }

    attempts++;
    attemptSpan.innerText = attempts;
    guessHistory.push(guess);
    updateHistoryDisplay();

    if (guess === secretNumber) {
      winGame();
      return;
    }

    const diff = Math.abs(guess - secretNumber);
    let hint = "";
    if (diff <= 5) hint = "🔥 ОГОНЬ! Очень горячо!";
    else if (diff <= 15) hint = "🌡️ Тепло! Почти рядом";
    else if (diff <= 30) hint = "❄️ Холодновато...";
    else hint = "🧊 Ледяной душ! Далеко!";

    const direction = guess < secretNumber ? "⬆️ Бери выше!" : "⬇️ Бери ниже!";
    setMessage(`${hint} ${direction}`, false);

    updateProgress();
    guessInput.value = "";
    guessInput.focus();
  }

  function resetAndNewGame() {
    secretNumber = getRandomInt(1, 100);
    attempts = 0;
    isGameOver = false;
    guessHistory = [];

    attemptSpan.innerText = "0";
    progressValue.innerText = "0%";
    guessInput.value = "";
    guessInput.disabled = false;
    checkBtn.disabled = false;
    guessInput.style.opacity = "1";
    setMessage(`Я загадал число от 1 до 100. Попробуй угадать!`, false);
    updateHistoryDisplay();
    guessInput.focus();

    const iconSpan = messageBox.querySelector(".message-icon");
    if (iconSpan) iconSpan.innerHTML = "🎲";
    console.log(`[новое число] ${secretNumber}`);
  }

  function clearHistoryOnly() {
    if (isGameOver && !guessHistory.includes(secretNumber)) {
      guessHistory = [];
      attempts = 0;
      attemptSpan.innerText = "0";
      updateHistoryDisplay();
      updateProgress();
      setMessage("История очищена", false);
    } else if (!isGameOver) {
      guessHistory = [];
      attempts = 0;
      attemptSpan.innerText = "0";
      updateHistoryDisplay();
      updateProgress();
      setMessage("История сброшена, игра продолжается", false);
    } else {
      setMessage("Новую игру можно начать кнопкой ниже", true);
    }
  }

  function onEnterHandler(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isGameOver) handleGuess();
      else setMessage("Нажми «Новая игра»", true);
    }
  }

  function init() {
    resetAndNewGame();
    checkBtn.addEventListener("click", handleGuess);
    newGameBtn.addEventListener("click", resetAndNewGame);
    if (clearHistoryBtn)
      clearHistoryBtn.addEventListener("click", clearHistoryOnly);
    guessInput.addEventListener("keypress", onEnterHandler);
  }

  init();
})();
