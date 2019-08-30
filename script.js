// Application State
let model = {};

// TEST JSON: https://api.myjson.com/bins/sfuir
// to store quotes in
let QUOTES;
let currentQuote = 0;
function getQuotes() {
  var req = new XMLHttpRequest();
  // You can replace the data with your own quotes just make sure it's
  // a json array
  req.open('GET', `https://api.myjson.com/bins/sfuir`);
  req.addEventListener('load', function() {
    QUOTES = JSON.parse(this.responseText);
  });
  req.send();
}
getQuotes();

// DOM Manipulation
const INPUT = document.getElementById('js-input');
const LEFT = document.getElementById('js-left');
const MIDDLE = document.getElementById('js-middle');
const RIGHT = document.getElementById('js-right');

// Initialize state
function init() {
  let initModel = {
    // quote: QUOTES[currentQuote].split(' '),
    quote: 'yes we are'.split(' '),
    index: 0,
    charIndex: 0,
    isOn: false,
    left: [],
    middle: '',
    right: [],
    current: '',
    timer: undefined,
    charactersTyped: 0,
    secondsTyped: 0,
    wordsPerMinute: 0
  };
  initModel.quote = initModel.quote.map((item, index) => {
    if (index < initModel.quote.length - 1) return item + ' ';
    else return item;
  });

  initModel.middle = initModel.quote[initModel.index];
  model = initModel;
  view('quote');
  view('left');
  view('middle');
  view('right');

  INPUT.value = '';
  INPUT.focus();
}

function appLoop(e) {
  //check end of line
  if (model.index >= model.quote.length) {
    model.left = model.quote;
    model.middle = '';
    model.right = [''];
    view('left');
    view('middle', false);
    view('right');
    view('done');
    model.isOn = false;
    clearInterval(model.timer);
    return;
  }

  if (e.inputType === 'deleteContentBackward') {
    return;
  }

  //start timer
  if (!model.isOn) {
    model.isOn = true;
    model.timer = setInterval(() => (model.secondsTyped += 0.01), 10);
  }

  let i = model.index;
  let j = model.charIndex;

  model.middle = model.quote[i];
  model.current = INPUT.value;
  model.right = model.quote;

  view('wpm');
  if (model.middle[j] === model.current[j] || model.current === '') {
    model.charIndex++;
    model.charactersTyped++;
    if (model.current === '') model.charIndex = 0;
    view('middle');

    if (model.middle === model.current) {
      model.left = [...model.left, model.current].map(item => {
        if (item[item.length - 1] !== ' ') return item + ' ';
        else return item;
      });
      INPUT.value = '';
      model.current = '';
      model.charIndex = 0;
      model.index++;

      //check end of text
      if (model.index >= model.quote.length) {
        model.left = model.quote;
        model.middle = '';
        model.right = [''];
        view('left');
        view('middle', false);
        view('right');
        view('done');
        model.isOn = false;
        clearInterval(model.timer);
        return;
      }
      view('left');
      view('middle');
      view('right');
    }
  } else {
    model.charIndex++;
    view('middle');
  }
}

function handleKeys(event) {
  let k = event.keyCode;
  if (k === 8 && event.target == document.getElementById('js-input')) {
    if (model.charIndex > 0) model.charIndex--;
    model.current = INPUT.value.slice(0, -1);
    view('middle');
  }

  // enter
  if (k === 13 && !model.isOn) {
    view('quote');
    init();
  } else if (k === 13 && model.isOn) {
    INPUT.focus();
  }

  if (k === 27) {
    reset();
  }
}

// DOM Manipulation
function view(mode, state = true, arr = []) {
  if (mode === 'left') {
    if (arr.length >= 1) {
    } else {
      LEFT.innerHTML = model.left.join('');
    }
  }

  if (mode === 'middle') {
    if (!state) {
      MIDDLE.innerHTML = '';
    } else if (state) {
      model.middle = model.quote[model.index];
      let html = '';
      for (let i = 0; i < model.middle.length; i++) {
        const e = model.middle[i];
        const current = model.current[i];
        html +=
          current === e
            ? `<span class='correct-letter'>${e}</span>`
            : current === undefined || current === ''
            ? e === ' '
              ? `<span class='space-letter'>`
              : `<span>${e}</span>`
            : `<span class='wrong-letter'>${e}</span>`;
      }
      MIDDLE.innerHTML = html;
    }
  }

  if (mode === 'right') {
    let toErase = [...model.left, model.quote[model.index]];
    model.right = model.quote.filter((item, index) => {
      if (toErase[index] === item) return false;
      else return true;
    });
    RIGHT.innerHTML = model.right.join('');
  }

  if (mode === 'wpm') {
    //Calculate WPM
    let wpm = Math.round(
      model.charactersTyped / 5 / (model.secondsTyped / 60) || ''
    );
    document.getElementById('js-wpm').innerHTML = `Words Per Minute: ${wpm}`;
  }

  if (mode === 'quote') {
    document.getElementById('js-hide').style.display = 'none';
  }

  if (mode === 'done') {
    let wpm = Math.round(
      model.charactersTyped / 5 / (model.secondsTyped / 60) || ''
    );
    document.getElementById('js-wpm').style.display = 'none';
    document.getElementById('js-success').style.display = 'flex';
    document.getElementById('js-final-wpm').innerHTML = wpm;
  }
}

function reset() {
  document.getElementById('js-success').style.display = 'none';
  document.getElementById('js-wpm').style.display = 'block';
  if (model.timer) clearInterval(model.timer);
  let initModel = {
    quote:
      currentQuote + 1 >= QUOTES.length
        ? QUOTES[(currentQuote += -QUOTES.length + 1)].split(' ')
        : QUOTES[(currentQuote += 1)].split(' '),
    index: 0,
    charIndex: 0,
    isOn: false,
    left: [],
    middle: '',
    right: [],
    current: '',
    timer: undefined,
    charactersTyped: 0,
    secondsTyped: 0,
    wordsPerMinute: 0
  };
  initModel.quote = initModel.quote.map((item, index) => {
    if (index < initModel.quote.length - 1) return item + ' ';
    else return item;
  });

  initModel.middle = initModel.quote[initModel.index];
  model = initModel;
  view('quote');
  view('left');
  view('middle');
  view('right');
  view('wpm');

  INPUT.value = '';
  INPUT.focus();
}

//App Loops
INPUT.addEventListener('input', appLoop);
window.addEventListener('keydown', handleKeys);

//Event listeners
document.getElementById('js-try-again').addEventListener('click', reset);

//Test functions
function testCharIndex(text = '') {
  let j = model.charIndex;

  console.log(`${text}`);
  console.log(`comparision: ${model.middle[j] === model.current[j]}`);
  console.log(`characters: ${model.middle[j]} ${model.current[j]}`);
  console.log(`-------------`);
}
