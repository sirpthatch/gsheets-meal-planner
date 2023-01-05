/* Utility Methods */
function cleanList(list) {
  // Returns a List[String], cleans the input list of duplicates and empty values
  var deduplicated = [...new Set(list)];
  var removeEmpty = deduplicated.filter((c, index) => {
    return c != '';
  });
  return removeEmpty;
}

/* Data Retrieval */
var pivotRows = {
  "Dinner":["Current Meals",4,1],
  "Ingredients":["Current Meals",5,1],
  "Groceries":["Current Meals",1,13]
}

function getPivotCell(name) {
  var coordinates = pivotRows[name];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(coordinates[0]);
  var pivotCell = sheet.getRange(coordinates[1],coordinates[2]);
  return pivotCell;
}

function getIngredientMappings() {
  // Returns Dict(String, String), mapping of ingredient name to classification
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var classificationSheet = ss.getSheetByName("Ingredient Classifications");
  var data = classificationSheet.getRange(1,1,classificationSheet.getLastRow(),2).getValues()
  
  var mapping = {};
  for (var i = 0; i < data.length; i++) {
    mapping[data[i][0]] = data[i][1];
  }
  return mapping;
}

function getIngredientLists() {
  // Return Dict(String, [String]), mapping of dinner name to list of ingredients
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ingredientsSheet = ss.getSheetByName("Ingredients");
  var mealColumn = 2;
  var hasMeals = true;
  var mapping = {};

  while (hasMeals){
    var dinnerName = ingredientsSheet.getRange(1, mealColumn).getValue();
    mapping[dinnerName] = [];

    var hasIngredients = true;
    var ingredientRow = 2;
    while (hasIngredients){
      var ingredientName = ingredientsSheet.getRange(ingredientRow, mealColumn).getValue();
      mapping[dinnerName].push(ingredientName);

      ingredientRow += 1;
      hasIngredients = !ingredientsSheet.getRange(ingredientRow, mealColumn).isBlank();
    }
    mealColumn += 1;
    hasMeals = !ingredientsSheet.getRange(1, mealColumn).isBlank();
  }
  return mapping;
}

function getStapleIngredients() {
  // Return Dict(String, [String]), mapping of classification to list of ingredients
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stapleSheet = ss.getSheetByName("Staple Groceries");
  var classificationColumn = 1;
  var hasClasses = true;
  var mapping = {};

  while (hasClasses){
    var classification = stapleSheet.getRange(1, classificationColumn).getValue();
    mapping[classification] = [];

    var hasIngredients = true;
    var ingredientRow = 2;
    while (hasIngredients){
      var ingredientName = stapleSheet.getRange(ingredientRow, classificationColumn).getValue();
      mapping[classification].push(ingredientName);

      ingredientRow += 1;
      hasIngredients = !stapleSheet.getRange(ingredientRow, classificationColumn).isBlank();
    }
    classificationColumn += 1;
    hasClasses = !stapleSheet.getRange(1, classificationColumn).isBlank();
  }
  return mapping;
}

/* Actions */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('Meal Planning Automations')
      .addItem('Lookup Ingredients', 'lookupIngredients')
      .addItem('Compile', 'compile')
      .addItem('Clear Ingredients','clearIngredients')
      .addItem('Clear List','clearList')
      .addItem('Save History','saveHistory')
      .addToUi();
}

function clearIngredients(){
  var ingredientsPivot = pivotRows["Ingredients"];
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ingredientsPivot[0]);
  // Assumption: Ingredients list is 14x9
  var ingredientsRange = sheet.getRange(ingredientsPivot[1],ingredientsPivot[2]+1,14, 9);
  ingredientsRange.clear();
}

function clearList(){
  var groceriesPivot = pivotRows["Groceries"];
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(groceriesPivot[0]);
  // Assumption: Only going to be 7 classifications
  var groceriesRange = sheet.getRange(groceriesPivot[1]+1,groceriesPivot[2]+1,100, 7);
  groceriesRange.clear();
}

function lookupIngredients() {
  var dinnerPivot = pivotRows["Dinner"];
  var ingredientsPivot = pivotRows["Ingredients"];
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(dinnerPivot[0]);
  var ingredientsMapping = getIngredientLists();
  // Assumption, meal list is going to be 9 meals
  for(var i = 0; i<9; i++){
    var dinnerCell = sheet.getRange(dinnerPivot[1], dinnerPivot[2]+1+i);
    var dinnerName = dinnerCell.getValue();
    var dinners = dinnerName.split("\\");
    var ingredients = [];
    for (var j = 0; j<dinners.length; j++) {
      var dinner = dinners[j].trim();
      if (dinner in ingredientsMapping){
        ingredients.push(...ingredientsMapping[dinner]);
      }
    }

    for (var j = 0; j < ingredients.length; j++) {
      var ingredient = ingredients[j];
      // TODO: add validation that we are not overwriting existing data
      sheet.getRange(ingredientsPivot[1]+j, ingredientsPivot[2]+1+i).setValue(ingredient);
    }
  }
}

function compile() {
  var ingredientsLists = getStapleIngredients();
  var ingredientMapping = getIngredientMappings();
  var ingredientsPivot = pivotRows["Ingredients"];
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ingredientsPivot[0]);
  Logger.log(ingredientsLists);

  // Assumption, meal list is going to be 9 meals
  for(var i = 0; i<9; i++){
    var ingredientOffset = ingredientsPivot[1];
    var hasIngredients = !sheet.getRange(ingredientOffset, ingredientsPivot[2]+1+i).isBlank();
    
    while (hasIngredients){
      var ingredientName = sheet.getRange(ingredientOffset, ingredientsPivot[2]+1+i).getValue();
      var ingredientClassification = "Unknown";
      if (ingredientName in ingredientMapping){
        ingredientClassification = ingredientMapping[ingredientName];
      }
      ingredientsLists[ingredientClassification].push(ingredientName);

      ingredientOffset += 1;
      hasIngredients = !sheet.getRange(ingredientOffset, ingredientsPivot[2]+1+i).isBlank();
    }
  }

  var groceriesPivot = pivotRows["Groceries"];
  var classificationOffset = groceriesPivot[2];
  var hasClassification = !sheet.getRange(groceriesPivot[1],classificationOffset).isBlank();
  while(hasClassification) {
    var classification = sheet.getRange(groceriesPivot[1],classificationOffset).getValue();
    var rawIngredients = ingredientsLists[classification];
    var cleanedIngredients = cleanList(rawIngredients);

    for (var i = 0; i < cleanedIngredients.length; i++){
      sheet.getRange(groceriesPivot[1] + 1 + i, classificationOffset).setValue(cleanedIngredients[i]);
    }

    classificationOffset += 1;
    hasClassification = !sheet.getRange(groceriesPivot[1],classificationOffset).isBlank();
  }
}

function saveHistory() {
  var historySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('History');
  var currentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Current Meals');

  var historyStartingRow = historySheet.getLastRow() + 2;
  historySheet.getRange(historyStartingRow,1).setValue(new Date(Date.now()).toDateString());
  currentSheet.getRange(1,1,4,10).copyTo(historySheet.getRange(historyStartingRow+1,1,4,10));
}
