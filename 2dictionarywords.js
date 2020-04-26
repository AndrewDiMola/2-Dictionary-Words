function initializeGame(){

  return $.get('popular.txt', function(txt) {

    // Calculate two random line numbers
    var lines = txt.split("\n");
    var randLine1 = Math.floor(Math.random() * lines.length);
    var randLine2 = Math.floor(Math.random() * lines.length);

    // Set the goal and start words
    var randGoalWord = lines[randLine1];
    var randStartWord = lines[randLine2];

    // initialize goal word object
    var initGoalWordObject = {
      word: randGoalWord,
      definition: undefined,
      synonyms: undefined
    };

    // initialize active word object
    var initActiveWordObject = {
      word: randStartWord,
      definition: undefined,
      synonyms: undefined
    };

    // initialize word lists object
    var initWordLists = {
      aWords: undefined,
      bWords: undefined,
      cWords: undefined,
      dWords: undefined,
      eWords: undefined,
      fWords: undefined,
      gWords: undefined,
      hWords: undefined,
      iWords: undefined,
      jWords: undefined,
      kWords: undefined,
      lWords: undefined,
      mWords: undefined,
      nWords: undefined,
      oWords: undefined,
      pWords: undefined,
      qWords: undefined,
      rWords: undefined,
      sWords: undefined,
      tWords: undefined,
      uWords: undefined,
      vWords: undefined,
      wWords: undefined,
      xWords: undefined,
      yWords: undefined,
      zWords: undefined
    };

    // create game word set object
    var initialGameWordSet = {
      goalWordObject: initGoalWordObject,
      activeWordObject: initActiveWordObject,
      wordLists: initWordLists
    }

    window.gameWordSet = initialGameWordSet;

    $.get('a.txt', function(txt) {

      var lines = txt.split("\n");
      window.gameWordSet.wordLists.aWords = lines;
    });
  });
}

function requestGoalWordData(gameWordObject){

  // Set up Unofficial Google API requests for definitions and synonyms
  var googleDictionaryAPI="https://api.dictionaryapi.dev/api/v1/entries/en/";
  var requestURL = googleDictionaryAPI + gameWordObject.word;

  return $.get(requestURL, function(data){

    // Parse JSON for *any* working definition
    var defKey = data[0].meaning;
    var defKeyAny = Object.keys(defKey)[0];
    var definition = defKey[defKeyAny][0].definition;

    window.gameWordSet.goalWordObject.definition = definition;
  });
}

function requestActiveWordData(gameWordObject){

  // Set up Unofficial Google API requests for definitions and synonyms
  var googleDictionaryAPI="https://api.dictionaryapi.dev/api/v1/entries/en/";
  var requestURL = googleDictionaryAPI + gameWordObject.word;

  return $.get(requestURL, function(data){

    // Parse JSON for *any* working definition
    var defKey = data[0].meaning;
    var defKeyAny = Object.keys(defKey)[0];
    var definition = defKey[defKeyAny][0].definition;
    var synonyms = defKey[defKeyAny][0].synonyms;

    window.gameWordSet.activeWordObject.definition = definition;
    window.gameWordSet.activeWordObject.synonyms = synonyms;
  });
}

function startTimer(){
  var timer = new Timer();
  timer.start();
  timer.addEventListener('secondsUpdated', function (e) {
    $('#basicUsage').html(timer.getTimeValues().toString());
  });

  return timer;
}

function writeGoalWordObject(gameWordObject){
  // Write goal word to HTML
  $('#goalWord').html(gameWordObject.word);

  // Write goal definition to HTML
  $('#goalDefinition').html(gameWordObject.definition);
}

function writeActiveWordObject(gameWordObject, wordLists){
  // Write active word to HTML
  $('#activeWord').html(gameWordObject.word);

  // Write active definition to HTML
  if (gameWordObject.definition !== undefined){
    // Convert eligible definition words to buttons
    genDefinitionWordButtons(gameWordObject, wordLists);
  } else {
    $('#activeDefinition').html(gameWordObject.word + " has no available definition.");
  }

  // Write active synonyms to HTML and convert them to buttons
  if (gameWordObject.synonyms !== undefined){
    var synButton;
    for (var i = 0; i < gameWordObject.synonyms.length; i++){
      synButton = $('<div></div>');
      synButton.html("<input type='button' id='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + gameWordObject.synonyms[i] + "'/>");
      $("#activeSynonyms").append(synButton);
    }
  } else {
    gameWordObject.word = gameWordObject.word.charAt(0).toUpperCase() + gameWordObject.word.slice(1);
    $('#activeSynonyms').html(gameWordObject.word + " has no synonyms.");
  }
}

function genDefinitionWordButtons(activeWordObject, wordLists){

  // Split definition String into Array
  var definition = activeWordObject.definition;
  var definitionArray = definition.split(" ");

  for (i = 0; i < definitionArray.length; i++) {

    var firstLetter = definitionArray[i].charAt(0).toLowerCase();
    var isEligible = false;

    // initial framework for word eligibility checks
    switch(firstLetter) {
      case "a":
        if (wordLists !== undefined){
          isEligible = isWordEligible(definitionArray[i], wordLists.aWords);
        }
        break;
      case "b":
        break;
      case "c":
        break;
      case "d":
        break;
      case "e":
        break;
      case "f":
        break;
      case "g":
        break;
      case "h":
        break;
      case "i":
        break;
      case "j":
        break;
      case "k":
        break;
      case "l":
        break;
      case "m":
        break;
      case "n":
        break;
      case "o":
        break;
      case "p":
        break;
      case "q":
        break;
      case "r":
        break;
      case "s":
        break;
      case "t":
        break;
      case "u":
        break;
      case "v":
        break;
      case "w":
        break;
      case "x":
        break;
      case "y":
        break;
      case "z":
        break;
      default:
        // Likely a number or punctuation: do nothing.
        break;
    }

    if (isEligible){
      $("#activeDefinition").append("<input type='button' id='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + definitionArray[i] + "'/> ");
    } else {
      $('#activeDefinition').append(definitionArray[i] + " ");
    }
  }
}

function isWordEligible(wordInDefinition, completeWordList){
  if (completeWordList.includes(wordInDefinition)){
    return true;
  } else {
    return false;
  }
}

function genNewWordObject(objButton, activeWordObject){

  // Check win condition
  if (window.gameWordSet.goalWordObject.word === activeWordObject.word){
    $("#gameWon").show();
    window.gameTimer.stop();
  }

  // Clear old definition and synonyms
  $('#activeDefinition').html("");
  $('#activeSynonyms').html("");

  // Start / Append breadcrumbs of previous words
  $("#pastWords").show();
  $("#pastWords").append(" <input type='button' id='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + activeWordObject.word + "'/> → ");

  // Replace active word with new word (button value)
  activeWordObject.word = objButton.value;
  $.when( requestActiveWordData(activeWordObject) ).done(function(a1, a2, a3, a4){
    writeActiveWordObject(activeWordObject, window.gameWordSet.wordLists);
  });
}
