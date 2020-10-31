const users_data_url = "data/Users.txt";
const products_data_url = "data/Products.txt";
const session_data_url = "data/CurrentUserSession.txt";

const usersContainer = document.getElementById("users");
const moviesContainer = document.getElementById("movies");
const sessionContainer = document.getElementById("sessions");
const popularProductsContainer = document.getElementById("popularProducts");



// let popularProducts = {};
// let recommendedProducts = {};

// let organizedMovies = {};
// const organizedMovies = [];
// let organizedUsers = [];

const organizedMovies = [],
    organizedUsers = [],
    organizedSessions = [];

let topRatedMovies = [],
    popularProducts = [],
    topSellingMovies;
//obj so I can store the keys instead of using [k,v] arr
let boughtMovies = {};



// //read the data from the url(txt) and act on it
// function readData(url, callback){
//     fetch(url)
//    .then( res => res.text() )
//    .then( text => {
//     //    console.log(text);
//     //    console.log(typeof(text));
//        callback(text);
//    } )
// }

// readData(products_data_url, organizeProducts);

// // organize movies from products.txt
// function organizeProducts(text){
//     let movieData = text.split("\n");
//     for (let movie of movieData){
//         //add the new object with organized movie data
//         organizedMovies.push(movieMap(movie));
//     }
// }

//read the data from the url(txt)
//call the function to organize elements
//pass inside the object we want to fill
//pass the map function for the object
function readData(url, organizeCallback, organizedObject, mapCallback, option){
    fetch(url)
   .then( res => res.text() )
   .then( text => {
    //    console.log(text);
    //    console.log(typeof(text));
       organizeCallback(text, organizedObject, mapCallback);
    //    console.log(organizedMovies);
   } )
}

const requestData = async (url, organizeCallback, organizedObject, mapCallback, option) => {
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

//read and map movie data
// readData(products_data_url, organizeElements, organizedMovies, movieMap);
// readData(users_data_url, organizeElements, organizedUsers, userMap);
// readData(curr_user_data_url, organizeElements, organizedSessions, sessionMap);

async function getMoviesData(){
    await requestData(products_data_url, organizeElements, organizedMovies, movieMap);
    // console.log("getMoviesData");
    // console.log("organized movies is");
    // console.log(organizedMovies);
    // console.log("-------");
    topRatedMovies = getTopRatedMovies(organizedMovies);
    console.log("sorted movies: ");
    console.log(topRatedMovies);

    console.log("organized movies: ");
    console.log(organizedMovies);
}

async function getUsersData(){
    await requestData(users_data_url, organizeElements, organizedUsers, userMap);
    // console.log("now it loads");
    countBoughtMovies(organizedUsers);

}

async function getSessionData(){
    await requestData(session_data_url, organizeElements, organizedSessions, sessionMap);
    let popularList = listPopularProducts();
    addListToHtml(popularList, popularProductsContainer);
}
//load all the data
getMoviesData();
getUsersData();
getSessionData();


function listPopularProducts(){
    topSellingMovies = getTopBoughtMovies(2);
    let mostPupularProducts = [];
    let lessPopularProducts = [];

    console.log("inside popular products");
    console.log(topSellingMovies[0]);
    console.log(topSellingMovies[1]);
    console.log(topRatedMovies);
    console.log(organizedMovies);

    for(movie of topSellingMovies[0][0]){
        console.log("movie is "+movie);
        mostPupularProducts.push(organizedMovies[movie-1])

        
    }

    for(movie of topSellingMovies[1][0]){
        console.log("second movie is "+movie);
        lessPopularProducts.push(organizedMovies[movie-1])

        
    }
    let sortedPopular = getTopRatedMovies(mostPupularProducts);
    let sortedLessPopular = getTopRatedMovies(lessPopularProducts);

    console.log(mostPupularProducts);
    console.log(lessPopularProducts);
    console.log(sortedLessPopular);

    let popularProducts = [...sortedPopular, ...sortedLessPopular];

 
    console.log(popularProducts);
    return popularProducts;
}



function countBoughtMovies(arrUsers){
    for(user of arrUsers){
        // console.log(user);
        // console.log(user.purchased);
        for(movie of user.purchased){
            boughtMovies[movie] ? boughtMovies[movie]++: boughtMovies[movie] = 1;
        }
    }
    console.log("boughtmovies is");
    console.log(boughtMovies);

}
//this is a bit simple, I could have just sorted the boughtMovies obj as well
//but this function gives you the specific sales and you can extend it
//to only get the top or the bottom sales, etc
function getTopBoughtMovies(sales){
    const topBought = [];
    const lessBought = [];
    for(movieId in boughtMovies){
        if(boughtMovies[movieId] >= sales){
            // console.log("pushed ");
            topBought.push(movieId);
        } else{
            lessBought.push(movieId);
        }
    }
    // const bestBoughtProducts = [...topBought, ...lessBought];
    const bestBoughtProducts = [[topBought], [lessBought]];
    return bestBoughtProducts;
}

function getTopRatedMovies(movies){
    // console.log("movies is");
    // console.log(movies);
    // console.log("SORTING");
    // console.log(movies);
    // let sortedMovies = movies;
    let sortedMovies = [...movies];

    sortedMovies.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    // console.log("sorted is");
    // console.log(sortedMovies);
    // console.log("after sorted");
    // console.log(movies);
    return sortedMovies;
}

/**
 * 
 * Organize Session
 */
function sessionMap(session){
    let userid = getCommaWord(0, session);
    let productid = getCommaWord(1, session);
    let sessionObj = {
        userid: userid,
        productid: productid
    }
    console.log(sessionObj);
    //add all the objs to html
    addObjToHtml(sessionObj, sessionContainer);
    return sessionObj
}

/**
 * 
 * Organize Users
 */
function userMap(user){
    console.log(user);

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
    console.log(userObj);
    //add all the objects to html
    addObjToHtml(userObj, usersContainer);
    return userObj;
}

/**
 * 
 * Organize MOVIES
 */
//return an object with 
function movieMap(movie){
    // console.log(movie);
    //parseInt or Regex could be used as well
    // let id = parseInt(movie.slice(0,2));
    let id = getCommaWord(0);
    let name = getCommaWord(1);
    let year = getCommaWord(2);
    let yearLastIndex = movie.search(year)+year.length;
    let rating = getCommaWord(8);
    let price = getCommaWord(9);
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
    //return the element from the specific comma
    function getCommaWord(num){
        return movie.split("," )[num].trim();
    }
    //add all the objects to HTML
    addObjToHtml(movieObj, moviesContainer);
    return movieObj;
}

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
    // console.log("INSIDE DIV");
    // console.log(div);
    // console.log(htmlContainer);
    htmlContainer.appendChild(div);
}



//return the element from the specific comma
function getCommaWord(num, text){
    return text.split("," )[num].trim();
}

function getSemicolonWord(num, text){
    return text.split(";" )[num].trim();
}