//Data URLs, can be local or APIs
const users_data_url = "data/Users.txt";
const products_data_url = "data/Products.txt";
const session_data_url = "data/CurrentUserSession.txt";

//HTML elements to fill the data
const container = document.getElementById("container");
const usersContainer = document.getElementById("users");
const moviesContainer = document.getElementById("movies");
const sessionContainer = document.getElementById("sessions");
const popularProductsContainer = document.getElementById("popularProducts");
const recProductsContainer = document.getElementById("recProducts");

//storage objects and arrays
const rawMovieData = [],
    rawUserData = [],
    rawSessionData = [];

let topRatedMovies = [],
    popularProducts = [],
    topSellingMovies;
//obj so I can store the keys instead of using [k,v] arr
let boughtMovies = {};


// -------------------- GET DATA --------------------//

//read the data from the url(txt)
//call the function to organize elements
//pass inside the object we want to fill
//pass the map function for the object
// function readData(url, organizeCallback, organizedObject, mapCallback){
//     fetch(url)
//    .then( res => res.text() )
//    .then( text => {
//        organizeCallback(text, organizedObject, mapCallback);
//    } )
// }
//the function above is the same but using promises, changed for readability
/**
 * 
 * @param {dataURL} url 
 * @param {func} organizeCallback split all the data line by line and put it inside the obj
 * @param {obj} organizedObject the object we want to fill with our data
 * @param {func} mapCallback parse every line of raw data and map it inside the object
 */
const requestData = async (url, organizeCallback, organizedObject, mapCallback) => {
   const res = await fetch(url);
   const text = await res.text();
   return organizeCallback(text, organizedObject, mapCallback);
}

//helper function to organize all elements from a txt
function organizeElements(text, organizedObject, mapCallback){
    let data = text.split("\n");
    for (let line of data){
        //add the new object with organized movie data
        // console.log("mapcallback is");
        // console.log(mapCallback(line));
        organizedObject.push( mapCallback(line));
    }
}

// -------------------- GET DATA --------------------//

// -------------------- LOAD DATA --------------------//

async function getMoviesData(){
    await requestData(products_data_url, organizeElements, rawMovieData, movieMap);
    topRatedMovies = getTopRatedMovies(rawMovieData);
    addListToHtml(rawMovieData, moviesContainer);

    console.log("sorted movies:");
    console.log(topRatedMovies);
    console.log("raw data movies:");
    console.log(rawMovieData);
}

async function getUsersData(){
    await requestData(users_data_url, organizeElements, rawUserData, userMap);
    addListToHtml(rawUserData, usersContainer);
    getBoughtMovies(rawUserData);

    console.log("raw user data:");
    console.log(rawUserData);
}

async function getSessionData(){
    await requestData(session_data_url, organizeElements, rawSessionData, sessionMap);
    addListToHtml(rawSessionData, sessionContainer);
    let popularList = getListPopularProducts();
    addListToHtml(popularList, popularProductsContainer);
    let userTags = getUserTags(rawSessionData);
    let recMovieList = getUserRecMovies(userTags, 5);
    addListToHtml(recMovieList, recProductsContainer);
    //remove the "LOADING DATA" text once everything is loaded and ready
    container.removeChild(document.getElementById("loadingText"));

    console.log("popular products");
    console.log(popularList);
    console.log("user session with keywords and their recommendations (rec)");
    console.log(userTags);
    console.log("movie recommendations based on user tags (their current movie selection)");
    console.log(recMovieList);

}
//load all the data
getMoviesData();
getUsersData();
getSessionData();

// -------------------- LOAD DATA --------------------//

// -------------------- ORGANIZE DATA --------------------//
function getUserRecMovies(userTags, numRec){
    let recUserList = [];
    // console.log(userTags);
    for(e of userTags){
        let userName = e.userName;
        let moviesRec = getRecMovies(e.rec, numRec);
        let movieId = e.movieId;
        let movieFocus = rawMovieData[movieId-1];
        let movieName = movieFocus.name;
        let movieRecObj = {
            userName: userName,
            movieName: movieName,
            moviesRec: moviesRec,
        }

        recUserList.push(movieRecObj);
    }

    // console.log(recUserList);
    return recUserList;
}
/**
 * 
 * @param {arr} recArr array from userTags of recommended movies
 * @param {number} numMovies number of movies to recommend the user
 */
//return an array with the names from recMovies
function getRecMovies(recArr, numMovies){
    let recMovies = [];
    for(let i = 0; i < numMovies; i++){
        let recId = recArr[i];
        //array is organized 
        let movie = rawMovieData[recId-1];
        recMovies.push(movie.name)
    }
    // console.log("recommended array of movies");
    // console.log(recMovies);
    return recMovies;
}
//return array of tags/keywords from the user session
function getUserTags(session){
    let userTags = [];
    for(key in session){
        let userTagsObj = getUserTagsObj(session[key]);
        userTags.push(userTagsObj);
    }
    return userTags;
}

function getUserTagsObj(userSession){
    let userid = userSession.userid;
    let name = rawUserData[userid-1].name;
    let movieId = userSession.productid;
    //need to rest one because rawmovieData array starts at 0
    let userTags = rawMovieData[movieId-1].keywords;
    // console.log("TAGS FROM CURR SESSION "+userTags);
    let rec = getRec(userTags, movieId);
    //sort by Id
    let recSorted = Object.keys(rec).sort(function(a,b){return rec[b]-rec[a]})

    let objUSerTags = {
        userid: userid,
        userName: name,
        userTags: userTags,
        movieId: movieId,
        rec: recSorted,
    }
    // console.log("recommended movies sorted");
    // console.log(recSorted);
    return objUSerTags;
}
/**
 * 
 * @param {arr} userTags keywords/tags from the movie the user is looking at
 * @param {string} movieId the id of the movie the user is looking at
 */
//return an object with all the ids of movies that fit the current movie (movieId)
function getRec(userTags, movieId){
    let moviesWithTag = {};
    //ugly O(n^3) but userTags and movie.keywords are pretty small
    for(tag of userTags){
        for(movie of topRatedMovies){
            for(keyword of movie.keywords){
                //check for the same tag from userSession
                //check for the same keyword from movie tags
                //make sure it's not the same movie the user is checking right now
                if(tag === keyword
                    && movieId!== movie.id){
                        moviesWithTag[movie.id] ? moviesWithTag[movie.id]++ : moviesWithTag[movie.id] = 1;
                }
            }
        }
    }
    // console.log("ids from the movies that fit the keywords, incremented if it's more than once");
    // console.log(moviesWithTag);
    return moviesWithTag;
}
//return array with the most popular products
//topSellingMovies is determned by how many sales you want to count from
//in our case the limit of sales is only 2
function getListPopularProducts(){
    topSellingMovies = getTopBoughtMovies(2);
    let mostPupularProducts = [];
    let lessPopularProducts = [];

    for(movie of topSellingMovies[0][0]){
        mostPupularProducts.push(rawMovieData[movie-1])
    }

    for(movie of topSellingMovies[1][0]){
        lessPopularProducts.push(rawMovieData[movie-1])
    }
    //order by rating
    let sortedPopular = getTopRatedMovies(mostPupularProducts);
    let sortedLessPopular = getTopRatedMovies(lessPopularProducts);
    // console.log(mostPupularProducts);
    // console.log(lessPopularProducts);
    // console.log(sortedLessPopular);
    let popularProducts = [...sortedPopular, ...sortedLessPopular];
    return popularProducts;
}

//fill the boughtMovies obj with the bought movies from rawUserData
function getBoughtMovies(arrUsers){
    for(user of arrUsers){
        for(movie of user.purchased){
            boughtMovies[movie] ? boughtMovies[movie]++: boughtMovies[movie] = 1;
        }
    }
    // console.log(boughtMovies);
}

//this is a bit simple, I could have just sorted the boughtMovies obj as well
//but this function gives you the specific sales and you can extend it
//to only get the top or the bottom sales, etc

//return the top movies with most sales by order
/**
 * 
 * @param {num} sales determine what's the limit on sales you want to start counting from
 */
function getTopBoughtMovies(sales){
    const topBought = [];
    const lessBought = [];
    for(movieId in boughtMovies){
        if(boughtMovies[movieId] >= sales){
            topBought.push(movieId);
        } else{
            lessBought.push(movieId);
        }
    }
    const bestBoughtProducts = [[topBought], [lessBought]];
    return bestBoughtProducts;
}
//return movies sorted by user rating
function getTopRatedMovies(movies){
    let sortedMovies = [...movies];
    sortedMovies.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    // console.log("sorted movies");
    // console.log(sortedMovies);
    return sortedMovies;
}

/**
 * 
 * Organize Session
 */
//return obj with session information per user
function sessionMap(session){
    let userid = getCommaWord(0, session);
    let productid = getCommaWord(1, session);
    let sessionObj = {
        userid: userid,
        productid: productid
    }
    return sessionObj
}

/**
 * 
 * Organize Users
 */
//return an obj with all the user data parsed correctly
function userMap(user){
    // console.log(user);
    let id = getCommaWord(0, user);
    let name = getCommaWord(1, user);
    let viewed = user.split(" ")[2].split(";");
    //remove the comma from the last element
    viewed[viewed.length-1] = viewed[viewed.length-1].slice(0, -1);
    let purchased = user.split(" ")[3].split(";");
    //delete the \r at the end and keep the string consistency of the data
    purchased[purchased.length-1] = parseInt(purchased[purchased.length-1]).toString();
    let userObj = {
        id: id,
        name: name,
        viewed: viewed,
        purchased: purchased
    }
    // console.log(userObj);
    return userObj;
}

/**
 * 
 * Organize MOVIES
 */
//return an object with all the movie data parsed correctly
function movieMap(movie){
    let id = getCommaWord(0, movie);
    let name = getCommaWord(1, movie);
    let year = getCommaWord(2, movie);
    let yearLastIndex = movie.search(year)+year.length;
    let rating = getCommaWord(8, movie);
    let price = getCommaWord(9, movie);
    let keywordsLastIndex = rating.length+price.length+2;
    //get the keywords by removing the information around
    //afterwards put them in an array if the word is more than one letter
    let keywords = movie.substring(yearLastIndex, movie.length-keywordsLastIndex)
                        .split(",")
                        .flatMap(word => word.length > 1? [word.slice(1)]: []);
                        //found a way to optimize the 2 functions below
                        //https://stackoverflow.com/a/55257477
                        // .map(word => word.slice(1))
                        // .filter(word => word.length > 1);
    let movieObj = {
        id: id,
        name: name,
        year: year,
        rating: rating,
        price: price,
        keywords: keywords,
    };

    return movieObj;
}

// -------------------- ORGANIZE DATA --------------------//

// -------------------- HTML FUNCTIONS --------------------//

/**
 * 
 * add HTML elements
 */
function addListToHtml(list, container){
    for (e of list){
        addObjToHtml(e, container);
    }
}
function addObjToHtml(obj, htmlContainer){
    let div = document.createElement("div");
    div.textContent = JSON.stringify(obj);;
    htmlContainer.appendChild(div);
}

// -------------------- HTML FUNCTIONS --------------------//

// -------------------- TEXT HELP --------------------//

//return the element from the specific comma
function getCommaWord(num, text){
    return text.split("," )[num].trim();
}

function getSemicolonWord(num, text){
    return text.split(";" )[num].trim();
}