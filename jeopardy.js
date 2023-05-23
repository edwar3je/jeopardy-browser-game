// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4},
//        {question: "1+1", answer: 2},
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare"},
//        {question: "Bell Jar Author", answer: "Plath"},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Takes the whole array generated from getCategoryIds() and creates a set that contains 5 ids (this ensures that duplicate ids aren't present in the final array).
 *  
 * Once the set is generated, it is then converted into an array of ids.
*/

function randomId(arr){
    let compare = new Set([]);
    while(compare.size < 6){
        let ranIndex = (Math.floor(Math.random() * arr.length));
        compare.add(arr[ranIndex])
    }
    let ranArr = Array.from(compare);
    return ranArr;
}

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids (uses randomId to help randomize indices and create id array)
 */

async function getCategoryIds() {
    let numCat = await axios.get('http://jservice.io/api/categories?count=100');
    let filterCat = [];
    for(let i = 0; i<numCat.data.length; i++){
        if(numCat.data[i].clues_count >= 5){
            filterCat.push(numCat.data[i].id)
        }
    }
    let finalCat = randomId(filterCat)
    return finalCat;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare"},
 *      {question: "Bell Jar Author", answer: "Plath"},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let officialCategory = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    let allClues = officialCategory.data.clues;
    let compare = new Set ([]);
    while(compare.size < 5){
        let ranIndex = (Math.floor(Math.random() * allClues.length));
        compare.add(allClues[ranIndex]);
    }
    let cluesArr = Array.from(compare);
    let obj = {
        title : officialCategory.data.title,
        clues : cluesArr
    }
    return obj;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */


//async function fillTable()
function fillTable(information) {
    const divGame = document.querySelector('div.gamecontainer');
    const tbl = document.createElement('table');
    tbl.setAttribute('id', 'jeopardy');
    divGame.append(tbl);
    const tbHead = document.createElement('thead');
    const tbBody = document.createElement('tbody');
    const tbhRow = document.createElement('tr');
    tbl.append(tbHead, tbBody);
    tbHead.append(tbhRow);
    let price = 0;
    for(let info of information){
        const header = document.createElement('th');
        header.innerText = info.title.toUpperCase();
        tbhRow.append(header);
    }
    for(let i=0; i<5; i++){
        const tbbRow = document.createElement('tr');
        tbBody.append(tbbRow);
        let clueIndex = i;
        price += 200;
        for(let j=0; j<information.length; j++){
            let catIndex = j;
            const cell = document.createElement('td');
            cell.setAttribute('class', information[catIndex].clues[clueIndex].question.toUpperCase());
            cell.setAttribute('id', information[catIndex].clues[clueIndex].answer.toUpperCase());
            cell.innerText = `$${price}`
            tbbRow.append(cell);
        }
    }
    console.log(information);
}

$('body').on('click', 'td', function(e){
    e.preventDefault();
    let quest = e.target.getAttribute('class');
    let ans = e.target.getAttribute('id');
    if(e.target.innerText.includes('$')){
        e.target.innerHTML = `<td>${quest}</td>`;
        $(e.target).css('color', 'white');
        console.log(quest);
    }
    else if(e.target.innerText == quest){
        e.target.innerHTML = `<td>${ans}</td>`;
        $(e.target).css('color', 'white');
        console.log(ans);
    }
})

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView(shape) {
    const t = document.querySelector('table');
    t.remove();
    shape.classList.toggle('loading');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView(shape) {
    shape.classList.toggle('loading');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let firstPart = await getCategoryIds();
    for (let first of firstPart){
        let category = await getCategory(first);
        categories.push(category);
    }
    fillTable(categories);
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO

$('document').ready(function(){
    $('<h1>JEOPARDY</h1>').appendTo('body');
    $('<h2>America\'s Favorite Gameshow!</h2>').appendTo('body');
    $('<div class="loadcontainer"></div>').appendTo('body');
    $('<h3 class="loadmessage">Click The Button To Start Playing!</h3>').appendTo('div.loadcontainer');
    $('<div class="gamecontainer"></div>').appendTo('body');
    $('<div class="buttoncontainer"></div>').appendTo('body');
    $('<button class="start">Let\'s Play Jeopardy!</button>').appendTo('div.buttoncontainer');
})

$('body').on('click', '.start', async function(e){
    e.preventDefault();
    if(!document.querySelector('table')){
        const h3 = document.querySelector('h3');
        h3.innerText = 'Loading Board...'
        await setupAndStart();
        h3.remove();
        const button = document.querySelector('button');
        button.innerText = 'Reset Board';
    }
    else{
        const divLoad = document.querySelector('div.loadcontainer');
        categories = [];
        showLoadingView(divLoad);
        await setupAndStart();
        hideLoadingView(divLoad);
    }
})