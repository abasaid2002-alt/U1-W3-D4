console.log("TOMBOLA JS CARICATO!"); // controllo: se lo vedo in console, il file JS è collegato

// numero massimo della tombola
const MAX_NUMBER = 76;

// =======================
// 1) PRENDO GLI ELEMENTI DALLA PAGINA (DOM)
// =======================
const boardEl = document.getElementById("board"); // contenitore tabellone 1..76
const cardsEl = document.getElementById("cards"); // contenitore cartelle giocatori

const cardsCountInput = document.getElementById("cardsCount"); // input: quante cartelle
const startBtn = document.getElementById("startBtn"); // bottone: genera cartelle

const drawBtn = document.getElementById("drawBtn"); // bottone: estrai numero
const resetBtn = document.getElementById("resetBtn"); // bottone: nuova partita
const lastNumberEl = document.getElementById("lastNumber"); // dove scrivo l'ultimo numero estratto

// =======================
// 2) STATO DEL GIOCO (variabili che “ricordano” cosa è successo)
// =======================

// Set = lista di valori unici (non accetta doppioni)
// lo uso per ricordarmi quali numeri sono già usciti (extra: non ripetere numeri)
const extracted = new Set();

// Map = tipo dizionario: chiave -> valore
// qui salvo: numero -> elemento DOM della cella del tabellone
// così quando esce un numero, lo trovo al volo e lo evidenzio
const boardCellsByNumber = new Map();

// qui dentro avrò un array di mappe, una mappa per ogni cartella
// ogni mappa: numero -> cella DOM dentro quella cartella
let playerCardsMaps = [];

// =======================
// 3) FUNZIONE: CREO IL TABELLONE 1..76 (una sola volta all’inizio)
// =======================
const createBoard = function () {
  for (let n = 1; n <= MAX_NUMBER; n++) {
    const cell = document.createElement("div"); // creo un div
    cell.classList.add("cell"); // gli do la classe per lo stile
    cell.textContent = n; // scrivo il numero dentro
    cell.dataset.number = n; // (non indispensabile, ma utile per debug)

    boardEl.appendChild(cell); // lo metto in pagina
    boardCellsByNumber.set(n, cell); // salvo riferimento in mappa (numero -> cella)
  }
};

// =======================
// 4) UTILITY: GENERO NUMERI RANDOM UNICI
// (usata per creare i numeri delle cartelle)
// =======================
const generateUniqueNumbers = function (howMany, max) {
  const s = new Set();

  // continuo finché non ho "howMany" numeri diversi
  while (s.size < howMany) {
    const n = Math.floor(Math.random() * max) + 1; // random 1..max
    s.add(n); // il Set tiene solo numeri unici
  }

  // trasformo Set in Array
  return Array.from(s);
};

// =======================
// 5) FUNZIONE: CREO LE CARTELLE (extra)
// - count = quante cartelle creare
// - ogni cartella ha 24 numeri casuali (1..76) non ripetuti nella stessa cartella
// =======================
const generateCards = function (count) {
  cardsEl.innerHTML = ""; // pulisco eventuali cartelle vecchie
  playerCardsMaps = []; // resetto la lista delle mappe

  // ciclo per creare "count" cartelle
  for (let i = 0; i < count; i++) {
    const nums = generateUniqueNumbers(24, MAX_NUMBER); // 24 numeri unici per questa cartella

    const card = document.createElement("div");
    card.classList.add("card");

    const title = document.createElement("h3");
    title.textContent = `Cartella ${i + 1}`;

    const grid = document.createElement("div");
    grid.classList.add("card-grid");

    // mappa per questa cartella: numero -> cella DOM
    const mapForThisCard = new Map();

    nums.forEach((num) => {
      const c = document.createElement("div");
      c.classList.add("card-cell");
      c.textContent = num;
      c.dataset.number = num;

      // se un numero fosse già estratto (caso raro), lo evidenzio subito
      if (extracted.has(num)) c.classList.add("estratto");

      grid.appendChild(c);
      mapForThisCard.set(num, c);
    });

    card.appendChild(title);
    card.appendChild(grid);
    cardsEl.appendChild(card);

    // salvo la mappa della cartella nella lista generale
    playerCardsMaps.push(mapForThisCard);
  }
};

// =======================
// 6) FUNZIONE: EVIDENZIA SULLE CARTELLE IL NUMERO ESTRATTO (se presente)
// =======================
const highlightOnCards = function (n) {
  // per ogni cartella (mappa), controllo se ha quel numero
  playerCardsMaps.forEach((mappa) => {
    const cell = mappa.get(n);
    if (cell) cell.classList.add("estratto");
  });
};

// =======================
// 7) FUNZIONE: ESTRAZIONE NUMERO (extra: no doppioni)
// =======================
const drawNumber = function () {
  // se ho già estratto tutti i numeri, non faccio nulla
  if (extracted.size === MAX_NUMBER) return;

  let n;

  // tiro finché non trovo un numero NON ancora estratto
  do {
    n = Math.floor(Math.random() * MAX_NUMBER) + 1;
  } while (extracted.has(n));

  // lo segno come estratto
  extracted.add(n);

  // lo scrivo a schermo
  lastNumberEl.textContent = n;

  // evidenzio sul tabellone
  const boardCell = boardCellsByNumber.get(n);
  boardCell.classList.add("estratto"); // mantiene anche i precedenti

  // evidenzio sulle cartelle
  highlightOnCards(n);

  // se finisco tutti i numeri, blocco il bottone
  if (extracted.size === MAX_NUMBER) {
    drawBtn.disabled = true;
    lastNumberEl.textContent = "Finito!";
  }
};

// =======================
// 8) START: genero le cartelle e abilito l’estrazione (ultimo extra)
// =======================
const startGame = function () {
  // leggo numero cartelle scelto (se vuoto -> 1)
  const count = parseInt(cardsCountInput.value, 10) || 1;

  // creo cartelle
  generateCards(count);

  // blocco scelta e abilito estrazione
  startBtn.disabled = true;
  cardsCountInput.disabled = true;
  drawBtn.disabled = false;
};

// =======================
// 9) RESET: nuova partita
// =======================
const resetGame = function () {
  extracted.clear(); // cancello lista estratti
  lastNumberEl.textContent = "-"; // reset testo

  // tolgo evidenziazione dal tabellone
  boardCellsByNumber.forEach((cell) => cell.classList.remove("estratto"));

  // tolgo cartelle
  cardsEl.innerHTML = "";
  playerCardsMaps = [];

  // reset controlli
  startBtn.disabled = false;
  cardsCountInput.disabled = false;
};

// =======================
// 10) EVENTI (click)
// =======================
startBtn.addEventListener("click", startGame);
drawBtn.addEventListener("click", drawNumber);
resetBtn.addEventListener("click", resetGame);

// =======================
// 11) INIT (parte una volta appena carico la pagina)
// =======================
createBoard(); // creo il tabellone
resetGame(); // porto tutto allo stato iniziale
