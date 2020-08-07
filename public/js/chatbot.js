const trigger = [
    ["hi", "hey", "hello", "good morning", "good afternoon"], //0
    ["how are you", "how is life", "how are things"], //1
    ["what are you doing", "what is going on", "what is up"], //2
    ["how old are you"], //3
    ["who are you", "are you human", "are you bot", "are you human or bot"], //4
    ["who created you", "who made you"], //5
    [
      "your name please",
      "your name",
      "may i know your name",
      "what is your name",
      "what call yourself"
    ], //6
    ["i love you"], //7
    ["happy", "good", "fun", "wonderful", "fantastic", "cool"], //8
    ["bad", "bored", "tired"], //9
    ["help me", "tell me story", "tell me joke"], //10
    ["ah", "yes", "ok", "okay", "nice"], //11
    ["thanks", "thank you"], //12
    ["bye", "good bye", "goodbye", "see you later"], //13
    ["what should i eat today"], //14
    ["bro"], //15
    ["what", "why", "how", "where", "when"], //16
    ["tristan"], //17
    ["who made this website", "developer", "creator of this website"], //18
    ["what is the price of nmd?", "nmd"], //19
  ];
  
  const reply = [
    ["Hello!", "Hi!", "Hey!", "Hi there!"], //0
    [
      "Fine... how are you?",
      "Pretty well, how are you?",
      "Fantastic, how are you?"
    ], //1
    [
      "Nothing much",
      "About to go to sleep",
      "Can you guess?",
      "I don't know actually"
    ], //2
    ["I am infinite"], //3
    ["I am just a bot", "I am a bot. What are you?"], //4
    ["The one true God, JavaScript"], //5
    ["I am nameless", "I don't have a name"], //6
    ["I love you too", "Me too"], //7
    ["Have you ever felt bad?", "Glad to hear it"], //8
    ["Why?", "Why? You shouldn't!", "Try watching TV"], //9
    ["What about?", "Once upon a time..."], //10
    ["Tell me a story", "Tell me a joke", "Tell me about yourself"], //1
    ["You're welcome"], //12
    ["Bye", "Goodbye", "See you later"], //13
    ["Sushi", "Pizza"], //14
    ["Bro!"], //15
    ["Yes?"], //16
    ["Tech lead"], //17
    ["Students of NYP"], //18
    ["The NMD costs $239. View more information about it here: <a href='https://www.google.com'> google </a>"] //19
  ];
  
  const alternative = [
    "Same",
    "Go on...",
    "Bro...",
    "Try again",
    "I'm listening..."
  ]; //anything not in trigger
  
  const coronavirus = ["Please stay home"]; // as long as "coronavirus" is inside, respond
  
  document.addEventListener("DOMContentLoaded", () => {
      const inputField = document.getElementById("input")
      inputField.addEventListener("keydown", function(e) { // when "Enter" is hit, register input
          if (e.code === "Enter") {
              let input = inputField.value;
              inputField.value = "";
              output(input);
      }
    });
  });
  
  function output(input) {
    let product;
  
    //lowercase input and remove all chars except word characters, space, and digits
    let text = input.toLowerCase().replace(/[^\w\s\d]/gi, "");
  
    // 'tell me a story' -> 'tell me story'
    // 'i feel happy' -> 'happy'
    text = text
      .replace(/ a /g, " ")
      .replace(/i feel /g, "")
      .replace(/whats/g, "what is")
      .replace(/please /g, "")
      .replace(/ please/g, "");
  
    //compare function, then search keyword, then random alternative
    if (compare(trigger, reply, text)) {
      product = compare(trigger, reply, text);
    } else if (text.match(/coronavirus/gi)) {
      product = coronavirus[Math.floor(Math.random() * coronavirus.length)];
    } else {
      product = alternative[Math.floor(Math.random() * alternative.length)];
    }
  
    //update DOM
    addChat(input, product);
  }
  
  function compare(triggerArray, replyArray, string) {
    let item;
    for (let x = 0; x < triggerArray.length; x++) {
      for (let y = 0; y < replyArray.length; y++) {
        if (triggerArray[x][y] == string) {
          items = replyArray[x];
          item = items[Math.floor(Math.random() * items.length)];
        }
      }
    }
    return item;
  }
  
  function addChat(input, product) {
    const mainDiv = document.getElementById("main");
    let userDiv = document.createElement("div");
    userDiv.id = "user";
    userDiv.innerHTML = `You: <span id="user-response">${input}</span>`;
    mainDiv.appendChild(userDiv);
  
    let botDiv = document.createElement("div");
    botDiv.id = "bot";
    botDiv.innerHTML = `Jun Hui: <span id="bot-response">${product}</span>`;
    mainDiv.appendChild(botDiv);
    speak(product);
  }
  
  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  
  
  function speak(string) {
    let u = new SpeechSynthesisUtterance(string);
    u.text = string;
    u.lang = "en-US";
    u.volume = 1; //0-1 interval
    u.rate = 1;
    u.pitch = 2; //0-2 interval
    synth.speak(u);
    debugger
  }
  
  
  