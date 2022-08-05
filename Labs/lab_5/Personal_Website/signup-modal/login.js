function openModal() {
    /* Note that you do NOT have to do a document.getElementById anywhere in this exercise. Use the elements below */        
    var myInput = document.getElementById("psw");
    var confirmMyInput = document.getElementById("cpsw");
	var letter = document.getElementById("letter");
	var capital = document.getElementById("capital");
	var number = document.getElementById("number");
	var length = document.getElementById("length");    
    var match = document.getElementById("match");


	// When the user starts to type something inside the password field
	myInput.onkeyup = function() {
       console.log('helllooo')
    //    console.log(myInput.innerText)
        
        /* TODO: Question 1.1: Starts here */
        var lowerCaseLetters = /[a-z]/g; // : Fill in the regular experssion for lowerCaseLetters
        var upperCaseLetters = /[A-Z]/g; // : Fill in the regular experssion for upperCaseLetters
        var numbers = /[0-9]/g; // : Fill in the regular experssion for digits
        var minLength = 8; // : Change the minimum length to what what it needs to be in the question 
        /* TODO: Question 1.1: Ends here */
        

        /* TODO: Question 1.2:  Starts here */
         /*
         - So first read up on classList.  
         - Perform a console.log(letter.classList) and check the array that you see. By default the first time, there should be just 1 element and it should be
         "invalid". "invalid" is a class that is present in login.css. 
         - Below, there are a bunch of if blocks and else blocks.
         - Each if block means that some successful condition is satisfied for our password conditon. So the red cross need to be converted to a check mark.
         - Each else block stands for a failed condition, so the green check mark needs to be a red cross again.
         - All that you need to do is, in each of the blocks, fill in the correct classNames for the remove and the add methods.
         */

        // Validate lowercase letters
        if(myInput.value.match(lowerCaseLetters)) {             
            letter.classList.remove("invalid","invalid:before"); 
            letter.classList.add("valid","valid:before"); 
        } else {
            letter.classList.remove("valid","valid:before"); 
            letter.classList.add("invalid","invalid:before"); 
        }

        // Validate capital letters        
        if(myInput.value.match(upperCaseLetters)) { 
            capital.classList.remove("invalid","invalid:before"); 
            capital.classList.add("valid","valid:before");
        } else {
            capital.classList.remove("valid","valid:before");
            capital.classList.add("invalid","invalid:before");
        }

        // Validate numbers        
        if(myInput.value.match(numbers)) { 
            number.classList.remove("invalid","invalid:before"); 
            number.classList.add("valid","valid:before"); 
        } else {
            number.classList.remove("valid","valid:before"); 
            number.classList.add("invalid","invalid:before");
        }

        // Validate length
        if(myInput.value.length >= minLength) {
            length.classList.remove("invalid","invalid:before");
            length.classList.add("valid","valid:before");
        } else {
            length.classList.remove("valid","valid:before");
            length.classList.add("invalid","invalid:before");
        }
        /* TODO: Question 1.2:  Ends here */
    }
    /* TODO Question 1.3: Starts here */
    confirmMyInput.onkeyup = function() {
                // Validate password and confirmPassword
                // console.log(myInput.value)
                var passEqualsConfPass = (myInput.value === confirmMyInput.value); // TODO: Change this to the condition that needs to be checked so that the text entered in password equals the text in confirm password
                // console.log(myInput.value)
                // console.log(passEqualsConfPass)
                if(passEqualsConfPass) { 
                    match.classList.remove("invalid","invalid:before"); 
                    match.classList.add("valid","valid:before"); 
                } else {
                    match.classList.remove("valid","valid:before"); 
                    match.classList.add("invalid","invalid:before"); 
                }        
    /* TODO Question 1.3: Starts here */

                // Disable or Enable the button based on the elements in classList
                enableButton(letter, capital, number, length, match);
    }
}
// Passport1

function enableButton(letter, capital, number, length, match) {
    // TODO: Clear this function for students to implement    
    var button = document.getElementById('my_submit_button');
    // console.log("this is:",letter.innerHTML)
    var condition = ((letter.classList[0] === "valid") & (capital.classList[0] === "valid") & (number.classList[0] === "valid") & (length.classList[0] ==="valid") & (match.classList[0] === "valid")); // TODO: Replace false with the correct condition
    // console.log((letter.classList[0] === "valid") & (capital.classList[0] === "valid") & (number.classList[0] === "valid") &(length.classList[0] ==="valid") &(match.classList[0] === "valid"))
    // console.log(match.classList[0])
    if(condition) {       
            button.disabled = false;
            button.setAttribute('onclick','onClickFunction()');
            // console.log(button)
        }        
    }    

function onClickFunction() {
    alert("Hey! I'm all green! Well done.")
}