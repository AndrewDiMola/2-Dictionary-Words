function initializeGame(){

  // modified .txt file of popular words (dolph/dictionary)
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

function requestGoalWordData(goalWordObject){

  // Set up Unofficial Google API requests for definitions and synonyms
  var googleDictionaryAPI="https://api.dictionaryapi.dev/api/v1/entries/en/";
  var requestURL = googleDictionaryAPI + goalWordObject.word;

  return $.get(requestURL, function(data){

    // Parse JSON for *any* part-of-speech result
    var defKey = data[0].meaning;
    var defKeyAny = Object.keys(defKey)[0];

    // Check if object containing definition exists
    if (!$.isEmptyObject(defKey)){
      var definition = defKey[defKeyAny][0].definition;
    }

    window.gameWordSet.goalWordObject.definition = definition;
  });
}

function requestActiveWordData(activeWordObject){

  // Set up Unofficial Google API requests (meetDeveloper/googleDictionaryAPI)
  var googleDictionaryAPI="https://api.dictionaryapi.dev/api/v1/entries/en/";
  var requestURL = googleDictionaryAPI + activeWordObject.word;

  return $.get(requestURL, function(data){

    // Parse JSON for *any* part of speech result
    var defKey = data[0].meaning;
    var defKeyAny = Object.keys(defKey)[0];

    // Check if object containing definition and synonyms exists
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

function writeGoalWordObject(goalWordObject){

  // Write goal word to HTML
  $('#goalWord').html(goalWordObject.word);

  // Write active definition to HTML
  if (goalWordObject.definition !== undefined){
    $('#goalDefinition').html(goalWordObject.definition);
  } else {
    $('#goalDefinition').html(goalWordObject.word + " has no available definition.");
  }
}

function writeActiveWordObject(activeWordObject, wordList){

  // Write active word to HTML
  $('#activeWord').html(activeWordObject.word);

  // Clear loading message
  $('#activeDefinition').html("");

  // Add related words based on fuzzy matches
  var fuzzyMatches = genFuzzyMatches(activeWordObject);
  genFuzzyMatchButtons(activeWordObject, fuzzyMatches, wordList);

  // Write active definition to HTML
  if (activeWordObject.definition !== undefined){
    // Convert eligible definition words to buttons
    genDefinitionWordButtons(activeWordObject, wordList);
  } else {
    $('#activeDefinition').html(activeWordObject.word + " has no available definition.");
  }

  // Write active synonyms to HTML and convert them to buttons
  if (activeWordObject.synonyms !== undefined){
    var synButton;
    var hasEligibleSyn = false;

    for (var i = 0; i < activeWordObject.synonyms.length; i++) {
      if (isWordEligible(activeWordObject.synonyms[i], wordList)){
        hasEligibleSyn = true;
        synButton = $('<div></div>');
        synButton.html("<input type='button' class='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + activeWordObject.synonyms[i] + "'/>");
        $("#activeSynonyms").append(synButton);
      }
    }

    // If all synonyms are ineligible for request, write a message about the ineligibility
    if (!hasEligibleSyn) {
      $('#activeSynonyms').html(activeWordObject.word + " has no available synonyms.");
    }
  } else {
    $('#activeSynonyms').html(activeWordObject.word + " has no available synonyms.");
  }
}

// Returns an array of arrays like: [[0.5715476066494082, 'Mississippi']]
function genFuzzyMatches(activeWordObject){

  // Get fuzzy matches and drop first array item (the perfect-matched input word)
  var fuzzyMatches = window.fuzzySet.get(activeWordObject.word, ".33", "0.70");
  fuzzyMatches.shift();

  return fuzzyMatches;
}

// fuzzyMatches returns an array of arrays like: [[0.5715476066494082, 'Mississippi']]
function genFuzzyMatchButtons(activeWordObject, fuzzyMatches, wordList){

  var hasEligibleMatches = false;

  for (var i = 0; i < fuzzyMatches.length; i++){

    var fuzzyWord = fuzzyMatches[i][1];

    if (isWordEligible(fuzzyWord, wordList)){
      hasEligibleMatches = true;
      $("#activeFuzzyMatches").append(" <input type='button' class='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + fuzzyWord + "'/> " );
    }
  }

  // If all fuzzy matches are ineligible for request, write a message about the ineligibility
  if (!hasEligibleMatches || fuzzyMatches === undefined || fuzzyMatches.length == 0) {
    $('#activeFuzzyMatches').html(activeWordObject.word + " has no similar words.");
  }
}

function genDefinitionWordButtons(activeWordObject, wordList){

  // Split definition String into Array
  var definitionString = activeWordObject.definition;
  var definitionStringNoPeriods = definitionString.split('.').join("");
  var definitionArray = definitionStringNoPeriods.split(" ");

  for (i = 0; i < definitionArray.length; i++) {

    var definitionWord = definitionArray[i];
    var isEligible = false;

    // word eligibility check
    isEligible = isWordEligible(definitionWord.toLowerCase(), wordList);

    if (isEligible){
      $("#activeDefinition").append("<input type='button' class='buttons' onclick='genNewWordObject(this, window.gameWordSet.activeWordObject)' value='" + definitionWord + "'/>");
    } else {
      $('#activeDefinition').append(definitionWord + " ");
    }
  }

  // Return period to end of sentence
  $('#activeDefinition').append(".");
}

function genNewWordObject(objButton, activeWordObject){

  // Clear past active word information
  $('#activeFuzzyMatches').html("");
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

function isWordEligible(wordInDefinition, completeWordList){

  if (completeWordList.includes(wordInDefinition)){
    return true;
  } else {
    return false;
  }
}

function gameWon(goalWord){

  // Write final breadcrumbs trail to goal word
  $("#pastWords").append(goalWord);

  // Show win messages
  $("#gameWon").show();
  $("#gameWon").html("Congratulations! You found the goal word in " + window.gameTimer.getTimeValues().toString() + " minutes/seconds!");
  $("#noteMsg").html("Refresh the page to play again.");

  // Disable all buttons on the page
  $(':button').prop('disabled', true);

  // Stop the game timer
  window.gameTimer.stop();
}
