const NUM_ROUNDS = 6;
const ANSWER_LENGTH = 5;
const letters = document.querySelectorAll(".cell");
const commentary = document.querySelector(".status");

const jsConfetti = new JSConfetti();

async function init() {
  //start the app
  //set the initial state of the app

  let currentRow = 0;
  let currentGuess = "";
  let done = false;
  let isLoading = false;
  commentary.innerText = `Can you guess at what the word is? You have ${NUM_ROUNDS} attempts to see if you can. Good luck`;

  //get the word of the day and store it in a variable called word
  const url = "https://words.dev-apis.com/word-of-the-day?random=1";
  const res = await fetch(url);
  const { word: wordRes } = await res.json();
  const word = wordRes.toUpperCase();
  const wordParts = word.split("");

  // add user input letters to the gameboard

  // event listner on body to listen for key strokes and routing to the right function
  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      //done nothing
      return;
    }
    const action = event.key;
    if (action === "Enter") {
      handleCommit();
    } else if (action === "Backspace") {
      handleBackspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      return;
    }
  });

  function addLetter(letter) {
    //add the letter to the currentGuess only if current guess is less than the answer length
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      // if its at the answer length but not commit, then remove last letter and then input new
      currentGuess = currentGuess.substring(0, ANSWER_LENGTH - 1) + letter;
    }
    // update the gameboard with the letter
    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText =
      letter;
  }

  async function handleCommit() {
    //if not enough letters then do nothing
    if (currentGuess.length !== ANSWER_LENGTH) {
      return;
    }
    //otherwise first check if the word is correct
    else if (currentGuess === word) {
      //apply the correct style to all letters
      for (
        let i = currentRow * ANSWER_LENGTH;
        i < currentRow * ANSWER_LENGTH + currentGuess.length;
        i++
      ) {
        letters[i].classList.add("correct");
      }

      done = true;
      commentary.innerText = "Congratulations You Guessed The Word";
      jsConfetti.addConfetti();
      setTimeout(() => {
        return jsConfetti.addConfetti();
      }, 3000);
      setTimeout(() => {
        return jsConfetti.addConfetti();
      }, 5000);
    }
    // otherwise lets check if the word is a valid word to begin with
    else {
      const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({ word: currentGuess }),
      });
      const { validWord } = await res.json();

      if (!validWord) {
        return;
        //need to add some css styling to prompt
      }
      //if it is a valid word check letters

      // we need to loop through the current guess and match to the letters that are correct in the word of the day correct words
      // make an array from guess
      const guessParts = currentGuess.split("");
      map = makeMap(wordParts);
      console.log(map);
      //check correct letters
      for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (wordParts[i] === guessParts[i]) {
          letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
          map[guessParts[i]]--;
          console.log(map);
        }
      }

      //check close as second pass
      for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (wordParts[i] === guessParts[i]) {
          //do nothing
        } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
          letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
          map[guessParts[i]]--;
        } else {
          letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
        }
      }
      currentGuess = "";
      currentRow++;
      if (currentRow === NUM_ROUNDS) {
        done = true;
        commentary.innerText = `Oh no, you didn't get the word! It was ${word}. Better luck next time`;
        document.body.style.backgroundColor = "firebrick";
      } else {
        let attemptsLeft = NUM_ROUNDS - currentRow;
        switch (attemptsLeft) {
          case 5:
            commentary.innerText = `Try again. You still have ${attemptsLeft} attempts left`;
            break;
          case 4:
            commentary.innerText = `That's not it either. Don't worry, you still have ${attemptsLeft} attempts left`;
            break;
          case 3:
            commentary.innerText = `You have only ${attemptsLeft} attempts left. Come on you can do this`;
            break;
          case 2:
            commentary.innerText = `You have ${attemptsLeft} attempts left. Concentrate!`;
            break;
          case 1:
            commentary.innerText = `Last chance. You have only ${attemptsLeft} shot, one opportunity, Mom's spaghetti!!`;
            break;
        }
      }
    }
  }

  function handleBackspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
  }

  //make a map of word function
  function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
      if (obj[array[i]]) {
        obj[array[i]]++;
      } else {
        obj[array[i]] = 1;
      }
    }
    return obj;
  }
}

// function to test if input is a letter
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

init();
