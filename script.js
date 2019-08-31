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
    quote: QUOTES[currentQuote].split(' '),

    // Current word index of the quote
    index: 0,

    // Curent char index of the current word
    charIndex: 0,
    isOn: false,

    // Already typed part
    left: [],

    // Current word to be compared
    middle: '',

    // Not yet typed part
    right: [],

    // Whatever the user inputs
    // Gets cleared everytime we match it with the current word
    current: '',

    // Timer used for calculating WPM
    timer: undefined,

    // For calculating WPM
    charactersTyped: 0,

    // For calculating WPM
    secondsTyped: 0,

    // WPM is stored here
    wordsPerMinute: 0,

    // Make sure we don't initialize twice
    firstOn: true
  };

  // Add space to the end of the quotes for comparing with input
  initModel.quote = initModel.quote.map((item, index) => {
    if (index < initModel.quote.length - 1) return item + ' ';
    else return item;
  });

  // Initialize model.middle
  initModel.middle = initModel.quote[initModel.index];
  model = initModel;

  // Initialize view
  view('quote');
  view('left');
  view('middle');
  view('right');

  // Focus on input
  INPUT.value = '';
  INPUT.focus();
}

// Main Function called everytime the user inputs something
function appLoop(e) {
  // Check end of line
  // Will be used again below
  function checkEndOfLine() {
    if (model.index >= model.quote.length) {
      model.left = model.quote;
      model.middle = '';
      model.right = [''];
      model.isOn = false;

      clearInterval(model.timer);
      view('left');
      view('middle', false);
      view('right');
      view('done');
      return true;
    } else {
      return false;
    }
  }

  // Don't do anything
  if (checkEndOfLine()) return;

  // Don't do anything if we press backspace input
  // Backspace interferes with handleKeys function below
  if (e.inputType === 'deleteContentBackward') {
    return;
  }

  // Start timer once user starts typing
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

  // Check if current characters match
  if (model.middle[j] === model.current[j] || model.current === '') {
    model.charIndex++;
    model.charactersTyped++;

    if (model.current === '') model.charIndex = 0;
    view('middle');

    // Check if the current words match
    if (model.middle === model.current) {
      //
      // Add spaces for left part and add the word beind compared
      // since they already matched
      //
      model.left = [...model.left, model.current].map(item => {
        if (item[item.length - 1] !== ' ') return item + ' ';
        else return item;
      });

      // Clear input
      INPUT.value = '';
      model.current = '';
      model.charIndex = 0;
      model.index++;

      // Catch if end of line
      // and do nothing if true
      if (checkEndOfLine()) return;

      view('left');
      view('middle');
      view('right');
    }
  }
  // Do this when it doesn't match anything
  else {
    model.charIndex++;
    view('middle');
  }
}

// Function for handling all the keys
function handleKeys(event) {
  let k = event.keyCode;

  // If backspace, decrease the current char index
  if (k === 8 && event.target == document.getElementById('js-input')) {
    if (model.charIndex > 0) model.charIndex--;
    model.current = INPUT.value.slice(0, -1);
    view('middle');
  }

  // If enter, then initialize
  // Also make sure doesn't initialize twice
  if (k === 13 && !model.isOn && !model.firstOn) {
    view('quote');
    init();
  } else if (k === 13) {
    INPUT.focus();
  }

  if (k === 27) {
    reset();
  }
}

// DOM Manipulation
function view(mode, state = true) {
  switch (mode) {
    // Render Already Typed
    case 'left':
      LEFT.innerHTML = model.left.join('');
      break;

    // Render the Word being compared
    case 'middle':
      if (!state) {
        MIDDLE.innerHTML = '';
      } else if (state) {
        model.middle = model.quote[model.index];
        let html = '';

        // Style the characters accordingly
        // by adding correct class
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
      break;

    // Render What Has To Be Typed
    case 'right':
      // For the words that have to be typed,
      // Just erase what the left part and the middle part already have
      // from the quote and display it
      let toErase = [...model.left, model.quote[model.index]];
      model.right = model.quote.filter((item, index) => {
        if (toErase[index] === item) return false;
        else return true;
      });
      RIGHT.innerHTML = model.right.join('');
      break;

    // Render WPM
    case 'wpm':
      //Calculate WPM
      let wpm = Math.round(
        // WPM formula (charactersTyped / 5 / (secondsTyped / 60))
        model.charactersTyped / 5 / (model.secondsTyped / 60) || ''
      );
      document.getElementById('js-wpm').innerHTML = `Words Per Minute: ${wpm}`;
      break;

    // Render The Quote When we initialize
    case 'quote':
      document.getElementById('js-hide').style.display = 'none';
      break;

    // Render Final WPM
    case 'done': {
      let wpm = Math.round(
        model.charactersTyped / 5 / (model.secondsTyped / 60) || ''
      );
      document.getElementById('js-wpm').style.display = 'none';
      document.getElementById('js-success').style.display = 'flex';
      document.getElementById('js-final-wpm').innerHTML = wpm;
    }
    default:
      return;
  }
}

// Get's Called when we reset
function reset() {
  // Remove the final wpm div
  document.getElementById('js-success').style.display = 'none';
  document.getElementById('js-wpm').style.display = 'block';
  if (model.timer) clearInterval(model.timer);

  // Initialize state again
  let initModel = {
    // Increment the quote
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
    wordsPerMinute: 0,
    firstOn: true
  };

  // Add spaces to the quote for comparing
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

// App Loops
INPUT.addEventListener('input', appLoop);
window.addEventListener('keydown', handleKeys);

// Event listeners
document.getElementById('js-try-again').addEventListener('click', reset);

// Test functions
function testCharIndex(text = '') {
  let j = model.charIndex;

  console.log(`${text}`);
  console.log(`ToCompare:${model.middle[j]}, Input:${model.current[j]}`);
  console.log(`comparison: ${model.middle[j] === model.current[j]}`);
  console.log(`-------------`);
}
