# The Academy Complex Case

## Instructions:
1. Using this existing data, write a system that creates a list of "recent popular products" (high purchase rate and/or high user review).  
2. Secondly, create a solution to recommend individual products to a user base on their current session data. CurrentUserSession.txt indicates which product the user is currently looking at.

## Implementation:
First I've parsed and stored the data for ease of access and manipulation. Used fetch and async load functions so it could work with APIs as well. 
Afterwards I tried to make the code as fragmented and extendible as possible, so anyone could come in and change anything with ease. 
That's why there are a lot of functions and getters/setters.

I left console logs as part of comments in case you want to see how everything works easily. There's also data being printed on console right away, so you can see all important objects.

## Known Bugs:
Promise error loading: rarely happens and I haven't bothered catching it because it's local. But this would be something to fix/implement/change.