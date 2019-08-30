# Technologies Used
* HTML
* CSS
* SASS
* Pure Javascript + ES6 Javascript

# Problems I had to solve

## How do I structure my application? Given that this is written in pure javascript.

What I did is I have the model(application state) and the view function separated.

```javascript

let model = {
    // Application state here
}

function view(mode) {
    switch(mode) {
        // View functions here
    }
}

```

## Is this better than writing with a javascript framework?

If you wanna ship a product fast, No. But if you wanna learn and if you've got the time, I think it will help with your problem solving skills
and learn more about weird javascript syntax.

## How is the front-end of the website structured? How do I compare words with my input?

Basically, I get my words from a quote. Because strings are just an array of characters. I just
know what to compare by storing the current character index in my state.

```javascript
    //Gets called everytime I input something
    function appLoop(e) {
        // If input matches
        if(state.input === state.toCompare) {
            // then call the 'correct' view function
            view('correct');
        } else {
            //else call the 'wrong' view function
            view('wrong');
        }
    }

    function view(type) {
        if(type === 'correct') {
            /* The Quotes are wrapped in spans so all i have to do to style them is to 
            add the correct class */
            
            // current word for comparing with our input
            state.current.forEach(item => {
                // Pseudo code
                addCorrectClass(item)
            })
        } else {
            // Same as above
        }
    }
```



# Things I learned along the way
* Learning good code practices
* DOM Manipulation
* Appreciating Vanilla javascript
* Array functions (array.split(), array.splice(), etc...)