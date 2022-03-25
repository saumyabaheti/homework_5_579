

/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton = document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');

// Stores saved words.
const savedWordsArray = [];
savedWords.textContent = "(None)";

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 * 
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {

    wordOutput.innerHTML = "Loading";

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            // This invokes the callback that updates the page.
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': wordInput.value})).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': wordInput.value})).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */

//const allWords = [];

function addToSavedWords(word) {
    savedWords.textContent = " ";
    savedWordsArray.push(word);
    let joined = savedWordsArray.join();
    savedWords.append(joined);
    // You'll need to finish this...
}

// Add additional functions/callbacks here.

//For rhyming words

const rhymeCallBack = (listOfRhymes) => {

    wordOutput.innerHTML = '';
    outputDescription.innerHTML = "Words that rhyme with" + ` ${wordInput.value}`

        if (listOfRhymes.length) {

            let groups = groupBy(listOfRhymes, "numSyllables");

            for (let i=1; i <= Object.keys(groups).length; i++) {
                wordOutput.innerHTML += `<h3>Syllables: ${i}</h3>`;
                for (group in groups[i]) {
                    const {word} = groups[i][group];
                    wordOutput.innerHTML += `<li>${word}<button class="btn btn-sm btn-outline-success" type="button" onclick="addToSavedWords('${word}')">(Save)</button></li>`;

                }

            }

    }

        else {

            const listItem = document.createElement("p");
            listItem.textContent = "No results";
            wordOutput.append(listItem);
        }

    }


showRhymesButton.addEventListener("click", ()=> {

    showSynonymsButton.classList.remove("btn-primary");
    showSynonymsButton.classList.add("btn-secondary");
    showRhymesButton.classList.remove("btn-secondary");
    showRhymesButton.classList.add("btn-primary");

    datamuseRequest(getDatamuseRhymeUrl(wordInput.value), rhymeCallBack);
})

//for synonyms

const similarCallBack = (listOfSynonyms) => {

    wordOutput.innerHTML = '';
    outputDescription.innerHTML = "Words with a similar meaning to" + ` ${wordInput.value}`

        if (listOfSynonyms.length) {

            for (let similarWord in listOfSynonyms) {

                const btn = document.createElement("button");
                btn.type = "button";
                btn.classList.add("btn", "btn-sm", "btn-outline-success");
                btn.innerHTML = "(Save)";
                const {word} = listOfSynonyms[similarWord];
                const listItem = document.createElement("li");
                listItem.textContent = word;
                listItem.append(btn);
                wordOutput.append(listItem);

                btn.addEventListener("click", () => {
                    addToSavedWords(word);
                })

        }

    }

        else {

            const listItem = document.createElement("p");
            listItem.textContent = "No results";
            wordOutput.append(listItem);

        }


    }

showSynonymsButton.addEventListener("click", ()=> {

    showSynonymsButton.classList.add("btn-primary");
    showSynonymsButton.classList.remove("btn-secondary");
    showRhymesButton.classList.add("btn-secondary");
    showRhymesButton.classList.remove("btn-primary");

    datamuseRequest(getDatamuseSimilarToUrl(wordInput.value), similarCallBack);
})

wordInput.addEventListener("keydown", function(event) {

    if (event.key === 'Enter') {

        if (showSynonymsButton.classList.contains("btn-primary")) {

        datamuseRequest(getDatamuseSimilarToUrl(wordInput.value), similarCallBack);

        }

        if (showRhymesButton.classList.contains("btn-primary")) {
        
        datamuseRequest(getDatamuseRhymeUrl(wordInput.value), rhymeCallBack);

        }

    }

})




//Save button onclick event listener




// Add event listeners here.