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

    // create game word set object
    var initialGameWordSet = {
      goalWordObject: initGoalWordObject,
      activeWordObject: initActiveWordObject
    }

    window.gameWordSet = initialGameWordSet;
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

function writeActiveWordObject(gameWordObject){
  // Write active word to HTML
  $('#activeWord').html(gameWordObject.word);

  // Write active definition to HTML
  $('#activeDefinition').html(gameWordObject.definition);

  // Write active synonyms to HTML
  if (gameWordObject.synonyms !== undefined){
    var synButton;
    for (var i = 0; i < gameWordObject.synonyms.length; i++){
      synButton = $('<div></div>');
      synButton.html("<input type='button' id='buttons' onclick='genNewWordObject(this, gameWordSet.activeWordObject)' value='" + gameWordObject.synonyms[i] + "'/>");
      $("#activeSynonyms").append(synButton);
    }
  } else {
    endGame(gameWordObject);
  }
}

function genNewWordObject(objButton, activeWordObject){

  // Check win condition
  if (window.gameWordSet.goalWordObject.word === activeWordObject.word){
    $("#gameWon").show();
    window.gameTimer.stop();
  }

  // Start / Append breadcrumbs of previous words
  $("#pastWords").show();
  $("#pastWords").append(activeWordObject.word + ", ");

  // Clear old synonyms
  $('#activeSynonyms').html("");

  // Replace active word with new word (button value)
  activeWordObject.word = objButton.value;
  $.when( requestActiveWordData(activeWordObject) ).done(function(a1, a2, a3, a4){
    writeActiveWordObject(activeWordObject);
  });
}

function endGame(gameWordObject){
  // Uppercase first letter of word, return Game Over message, and stop the timer
  gameWordObject.word = gameWordObject.word.charAt(0).toUpperCase() + gameWordObject.word.slice(1);
  $('#activeSynonyms').html("Game Over. " + gameWordObject.word + " has no synonyms. Refresh the page to play again.");
  window.gameTimer.stop();
}
