//organize movies from products.txt
function organizeProducts(text){
    let movieData = text.split("\n");


    for (let movie of movieData){
        //add the new object with organized movie data
        organizedMovies += movieMap(movie);
    }
}

//return an object with 
function movieMap(movie){
    console.log(movie);
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
    console.log(movieObj);
    return movieObj;
}