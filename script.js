const players = [];
let currentPlayerIndex = 0;
let spinning = false;
let currentRotation = 0;

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const questionPanel = document.getElementById('question-panel');
const playerNameDisplay = document.getElementById('player-name-display');
const questionDisplay = document.getElementById('question-display');
const playerList = document.getElementById('playerList');
const addPlayerBtn = document.getElementById('add-player-btn');

function setChoiceButtonsState(enabled) {
  const truthBtn = document.getElementById("truthBtn");
  const dareBtn = document.getElementById("dareBtn");

  if (truthBtn && dareBtn) {
    truthBtn.disabled = !enabled;
    dareBtn.disabled = !enabled;
    truthBtn.classList.toggle('disabled', !enabled);
    dareBtn.classList.toggle('disabled', !enabled);
  }
}

function drawWheel() {
  const ctx = wheel.getContext('2d');
  const segments = players.length;
  const angle = (2 * Math.PI) / segments;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, wheel.width, wheel.height);
  ctx.translate(150, 150);

  for (let i = 0; i < segments; i++) {
    ctx.beginPath();
    ctx.fillStyle = i % 2 === 0 ? '#1a1a1a' : '#2c2c2c';
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 150, angle * i, angle * (i + 1));
    ctx.lineTo(0, 0);
    ctx.fill();

    ctx.save();
    ctx.rotate(angle * i + angle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Poppins";
    ctx.fillText(players[i].name.toUpperCase(), 140, 5);
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 2;
  for (let i = 0; i < segments; i++) {
    const lineAngle = angle * i;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(150 * Math.cos(lineAngle), 150 * Math.sin(lineAngle));
    ctx.stroke();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function spinWheel() {
  if (spinning || players.length < 2) return;

  spinning = true;
  const spinSound = new Audio('spin.mp3');
  spinSound.play();

  const extraRotation = Math.floor(Math.random() * 360);
  const fullSpin = 360 * 10 + extraRotation;
  currentRotation += fullSpin;

  wheel.style.transition = 'transform 5s cubic-bezier(0.33, 1, 0.68, 1)';
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    const normalizedRotation = currentRotation % 360;
    const anglePerSegment = 360 / players.length;
    const index = Math.floor((360 - normalizedRotation + anglePerSegment / 2) % 360 / anglePerSegment);
    currentPlayerIndex = index;
    showChoice(); // Enable buttons in showChoice
    spinning = false;

  }, 5000);
}

function showChoice() {
  const player = players[currentPlayerIndex];
  playerNameDisplay.textContent = player.name;
  questionDisplay.textContent = '';
  setChoiceButtonsState(true); // ✅ Enable buttons AFTER spin
  questionPanel.scrollIntoView({ behavior: "smooth" });
}
function showQuestion(type) {
  let questions;
  if (typeof questionArrayType !== 'undefined' && questionArrayType === 'online') {
    questions = type === 'truth' ? onlineTruthQuestions : onlineDareQuestions;
  } else {
    questions = type === 'truth' ? truthQuestions : dareQuestions;
  }

  const question = questions[Math.floor(Math.random() * questions.length)];
  questionDisplay.textContent = question;
}

function addPlayer() {
  const nameInput = document.getElementById('player-name');
  const fileInput = document.getElementById('player-avatar');
  const name = nameInput.value.trim();
  const file = fileInput.files[0];

  if (!name) return alert('Enter a name!');
  const newPlayer = { name };

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      newPlayer.avatar = e.target.result;
      completeAddPlayer(newPlayer);
    };
    reader.readAsDataURL(file);
  } else {
    completeAddPlayer(newPlayer);
  }

  nameInput.value = '';
  fileInput.value = '';
}

function completeAddPlayer(player) {
  players.push(player);
  drawWheel();
  updatePlayerList();
}

function updatePlayerList() {
  playerList.innerHTML = '';
  players.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="player-info">
        ${p.avatar ? `<img src="${p.avatar}" class="avatar" />` : ''}
        <span class="player-name">${p.name}</span>
      </div>
      <div class="player-actions">
        <button class="icon-btn" onclick="editPlayer(${i})" title="Edit">✏️</button>
        <button class="icon-btn" onclick="removePlayer(${i})" title="Remove">❌</button>
      </div>
    `;
    playerList.appendChild(li);
  });
}

function removePlayer(index) {
  players.splice(index, 1);
  drawWheel();
  updatePlayerList();
}

function editPlayer(index) {
  const newName = prompt("Edit player name:", players[index].name);
  if (newName && newName.trim()) {
    players[index].name = newName.trim();
    drawWheel();
    updatePlayerList();
  }
}

spinBtn.addEventListener('click', spinWheel);
addPlayerBtn.addEventListener('click', addPlayer);
