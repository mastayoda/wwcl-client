var sentenceArr = params.arr;
var wordCountArr = [];
var totalWords = 0;
for (i=0;i<=sentenceArr.length;i++)
{
  var count = sentenceArr[i].split(' ').length;
  wordCountArr.push(count);
  totalWords+= count;
}
result = {
  "wcArr":wordCountArr,
  "wcTotal":totalWords
};


{
  "arr":
  [
    "A long time ago, in a galaxy far, far away....",
    "It is a period of civil war. Rebel",
    "spaceships, striking from a hidden",
    "base, have won their first victory",
    "against the evil Galactic Empire.",
    "During the battle, rebel spies managed",
    "to steal secret plans to the Empire's",
    "ultimate weapon, the DEATH STAR, an",
    "armored space station with enough",
    "power to destroy an entire planet.",
    "Pursued by the Empire's sinister agents,",
    "Princess Leia races home aboard her",
    "starship, custodian of the stolen plans",
    "that can save her people and restore",
    "freedom to the galaxy...."
  ]
}


/* Since our parameter is not partitioned, we
 * only have an array with onen element, in
 * this example, we are going to validate our
 * word count algorithm results.
 */
var wcRes = resultsArr[0];
var totalCount = 0;

/* Lets iterate and sum the totals once again */
for (i=0;i<wcRes.wcArr.length;i++)
{
  totalCount+= wcRes.wcArr[i];
}

/* Now we check if the totals are the same */
if(totalCount == wcRes.wcTotal)
  result = "Correct! Total number of word is: " + totalCount;
else
  result = "Incorrect :( ! " + totalCount + "!=" + wcRes.wcTotal;