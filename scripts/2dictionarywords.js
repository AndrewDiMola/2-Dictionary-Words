function initializeGame(){

  return $.get('words/popularInAll.txt', function(txt) {

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
    var initWordList = { undefined };

    // create game word set object
    var initialGameWordSet = {
      goalWordObject: initGoalWordObject,
      activeWordObject: initActiveWordObject,
      wordList: initWordList
    }

    window.gameWordSet = initialGameWordSet;

    $.get('words/all.txt', function(txt) {

      var lines = txt.split("\n");
      window.gameWordSet.wordList = lines;
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

    // Check if object containing definition exists
    if (!$.isEmptyObject(defKey)){
      var definition = defKey[defKeyAny][0].definition;
    }

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

    if (!$.isEmptyObject(defKey)){
      var definition = defKey[defKeyAny][0].definition;
      var synonyms = defKey[defKeyAny][0].synonyms;
    }

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

function writeActiveWordObject(gameWordObject, wordList){

  // Write active word to HTML
  $('#activeWord').html(gameWordObject.word);

  // Write active definition to HTML
  if (gameWordObject.definition !== undefined){
    // Convert eligible definition words to buttons
    genDefinitionWordButtons(gameWordObject, wordList);
  } else {
    $('#activeDefinition').html(gameWordObject.word + " has no available definition.");
  }

  // Write active synonyms to HTML and convert them to buttons
  if (gameWordObject.synonyms !== undefined){
    var synButton;
    for (var i = 0; i < gameWordObject.synonyms.length; i++) {
      if (isWordEligible(gameWordObject.synonyms[i], wordList)){
        synButton = $('<div></div>');
        synButton.html("<input type='button' class='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + gameWordObject.synonyms[i] + "'/>");
        $("#activeSynonyms").append(synButton);
      }
    }

    // If all synonyms are ineligible, write a message about the ineligibility
    if ($('activeSynonyms').text().length == 0) {
      $('#activeSynonyms').html(gameWordObject.word + " has no synonyms.");
}
  } else {
    gameWordObject.word = gameWordObject.word.charAt(0).toUpperCase() + gameWordObject.word.slice(1);
    $('#activeSynonyms').html(gameWordObject.word + " has no synonyms.");
  }
}

function genDefinitionWordButtons(activeWordObject, wordList){

  // Split definition String into Array
  var definition = activeWordObject.definition;
  var definitionArray = definition.split(" ");

  for (i = 0; i < definitionArray.length; i++) {

    var firstLetter = definitionArray[i].charAt(0).toLowerCase();
    var isEligible = false;

    // word eligibility check
    isEligible = isWordEligible(definitionArray[i], wordList);

    if (isEligible){
      $("#activeDefinition").append("<input type='button' class='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + definitionArray[i] + "'/>");
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

  // Clear old definition and synonyms
  $('#activeDefinition').html("");
  $('#activeSynonyms').html("");

  // Start / Append breadcrumbs of previous words
  $("#pastWords").show();
  $("#pastWords").append(" <input type='button' class='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + activeWordObject.word + "'/> → ");

  // Replace active word with new word (button value)
  activeWordObject.word = objButton.value;

  $.when( requestActiveWordData(activeWordObject) ).done(function(a1, a2, a3, a4){
    writeActiveWordObject(activeWordObject, window.gameWordSet.wordList);

    // Check win condition
    if (window.gameWordSet.goalWordObject.word.toLowerCase() === activeWordObject.word.toLowerCase()){
      gameWon(window.gameWordSet.goalWordObject.word);
    }
  });
}

function gameWon(goalWord){

  // Write final breadcrumb trail to goal word
  $("#pastWords").append(goalWord);

  // Show win message
  $("#gameWon").show();
  $("#gameWon").html("Congratulations! You found the goal word in " + window.gameTimer.getTimeValues().toString() + " minutes/seconds!");

  // Update message underneath instructions
  $("#noteMsg").html("Refresh the page to play again.");

  // Disable all buttons on the page
  $(':button').prop('disabled', true);

  // Stop the game timer
  window.gameTimer.stop();
}
