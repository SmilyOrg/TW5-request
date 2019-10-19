(function () {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  exports.name = "m.essen-und-trinken.de";

  exports.after = ["request"];

  exports.parse = function (doc) {
    const parsed = JSON.parse(doc.querySelector("#json-ld script").innerText);
    const recipes = parsed
      .filter(item => item["@type"] == "Recipe");

    if (recipes.length == 0) return {
      error: "No recipes found"
    };

    const recipe = recipes[0];
    console.log(recipe);
    return {
      title: recipe.name,
      instructions: recipe.recipeInstructions,
      ingredients: recipe.recipeIngredient
    };
  }

})();