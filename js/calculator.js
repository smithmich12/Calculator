/********************************
 * Michael Smith
 * Last Updated: October 28, 2018
 * Lab 3 - CS 480
 * The brains of the Calculator in Javascript
 ********************************/
// This is the screenDiv which is used in multiple functions and shortens code
let screenDiv = document.getElementById("screen");

// This is called when a user clicks on one of the buttons and recieves what button was clicked
function clickButton(operator) {
  let caretpositionDiv = document.getElementById("caretposition");
  switch(operator) {

    // Back button deletes the last character
    case "D":
      screenDiv.innerHTML = screenDiv.innerHTML.slice(0, -1);
      if(caretpositionDiv.innerHTML != 0){
        caretpositionDiv.innerHTML--;
      }
      break;

    // Equals attempts to solve the equation given
    case "=":
      let expr = screenDiv.innerHTML;
      if((expr != "") && // Make sure the user's input isn't empty and an error message isn't showing
      !(expr == "Parenthesis Error" || expr == "Syntax Error" || expr == "\u221E" || expr == "Division by 0")
      && !expr.includes("e")) // if user presses enter whith e syntax ex: 6.5e+100
      {
        screenDiv.innerHTML = solve(expr);
      }
      caretpositionDiv.innerHTML = screenDiv.innerText.length;
      break;

    // This is the default case to append the users input
    default:
      let check = ["+", "*", "/", "^", ".", "-"];
      let exp = screenDiv.innerHTML;
      if(exp == "Parenthesis Error" || exp == "Syntax Error" || exp == "\u221E" || exp == "Division by 0"){
        screenDiv.innerHTML = operator;
      } else if(exp.length < 21 && checkPrevious(operator)) { //&& (!check.includes(exp.charAt(exp.length - 1)))) {
        let location = caretpositionDiv.innerHTML;
        //let newExp = exp.slice(0, location) + operator + exp.slice(location);
        screenDiv.innerHTML = exp.slice(0, location) + operator + exp.slice(location);
        caretpositionDiv.innerHTML++;
      }
      break;
  }
}

// This takes the postfix expression and solves it.
function solve(expression){
  let postfix = infixToPostfix(expression);
  if(postfix == -1) {
    return "Parenthesis Error";
  }
  let operators = ["+", "-", "*", "/", "^"];
  let stack = [];
  for(let i = 0; i < postfix.length; i++){
    let character = postfix.charAt(i);
    if(character == ' '){
      continue;
    } else if((!isNaN(character)) || character == 'N'){
      let num = "";
      let decCount = 0;
      // This is to get each number with spaces decimals and converts the negative number back to negative
      while((!isNaN(character) && character != ' ') || character == '.' || character == 'N'){

        if(character == 'N'){
          num += '-';
        }else {
          if(character == '.'){
            decCount++;
            if(decCount > 1){
              return "Syntax Error";
            }
          }
          num += character;
        }
        i++;
        character = postfix.charAt(i);
      }
      i--;
      stack.push(parseFloat(num));
    } else {
      let val1 = stack.pop();
      let val2 = stack.pop();

      if(val1 == undefined || val2 == undefined){
        return "Syntax Error";
      }
      switch(character){
        case '+':
          stack.push(val1+val2);
          break;
        case '-':
          stack.push(val2-val1);
          break;
        case '/':
          if(val1 == 0){
            return "Division by 0";
          } else {
            stack.push(val2/val1);
          }
          break;
        case '*':
          stack.push(val1*val2);
          break;
        case '^':
          stack.push(Math.pow(val2, val1));
          break;
      }
    }
  }
  let returnVal = stack.pop();
  if(returnVal == "Infinity") {
    return '\u221E';
  }
  return returnVal;
}

// This function converts the users infix expression to postfix
function infixToPostfix(exp){
  expression = checkExpression(exp);
  let result = "";
  let stack = [];
  for(let i = 0; i < expression.length; i++) {
    if(expression[i] == '.' || expression[i] == 'N'){
      result += expression[i];
      continue;
    }
    if(!isNaN(expression[i])){
      let n = 0;
      while(!isNaN(expression[i])){
        result += expression[i];
        i++
      }
      if(expression[i] != '.'){
        result += " ";
      }
      i--;
    } else if (expression[i] == '('){
      stack.push(expression[i]);
    } else if(expression[i] == ')'){
      while(stack.length > 0 && stack[stack.length - 1] != '('){
        result += stack.pop() + " ";
      }
      if(stack.length == 0){
        return -1;
      } else {
        stack.pop();
      }
    }else{
      while(stack.length > 0 && pemdas(expression[i]) <= pemdas(stack[stack.length - 1]) && (expression[i] != stack[stack.length - 1])){
        result += stack.pop() + " ";
      }
      stack.push(expression[i]);
    }
  }
  while(stack.length > 0){
    if(stack.length != 1) {
      result += stack.pop() + " ";
    } else {
      result += stack.pop();
    }
  }
  if(result.indexOf("(") != -1){
    return -1;
  }
  return result;
}

/************************************************************
 * Below are functions that check to ensure the infix
 * notation is correct and ready to send to be converted
 * to postfix.
 ************************************************************/

// Event listener to check if an illegal character is pressed
screenDiv.addEventListener("keypress", checkChar, false);

// Called on every keypress, only allows numbers and operators
// If enter is pressed it calls equals
function checkChar(event) {
  let keyCode = event.keyCode;
  let otherKeys = [13, 40, 41, 42, 43, 45, 46, 47, 94]
  if(keyCode != 0){
    if (!(keyCode >= 48 && keyCode <= 57) && !(otherKeys.includes(keyCode)) || !checkPrevious(event.key)) {
      event.preventDefault();
    } else if (keyCode === 13){
      event.preventDefault();
      document.getElementById("equals").click();
      // The following code sets the caret position to the end after enter is pressed
      let range = document.createRange();
      let sel = window.getSelection();
      range.setStart(screenDiv.childNodes[0], screenDiv.innerHTML.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      screenDiv.focus();
    }
  }
}

// Function that doesn't allow multiple operators to be entered in a row
function checkPrevious(pressed) {
  let exp = screenDiv.innerHTML;
  let caretPos = document.getElementById("caretposition").innerHTML;
  let check = ['+', '-', '.', '*' , '/', '^'];

  if(caretPos > 0){
    let lastChar = exp.charAt(caretPos - 1);
    // Allows to multiply or divide by a negative number
    if(pressed == "-" && (lastChar == "*" || lastChar == "/" || lastChar == "^")) {
      return true;
    }
    // Disallows adding back to back operators
    if(check.includes(lastChar) && check.includes(pressed)){
      return false;
    }
  } else {
    // Disallows all operators except - in the first character spot
    if(check.includes(pressed) && pressed != '-'){
      return false;
    }
  }
  return true;
}

// This function checks for certain cases, cases are described with comments
// down below.
function checkExpression(exp) {
  let len = exp.length - 1;

  // This adds parenthesis for multiple exponents
  let exponents = [];
  let x = 0;
  while((x = exp.indexOf("^", x + 1)) >= 0){
    exponents.push(x);
  }
  while(exponents.length > 1){
    let k = exponents[exponents.length - 2] + 1;
    exp = exp.slice(0, k) + "(" + exp.slice(k) + ")";
    if(exp.charAt(k + 1) == "-"){
      k += 2;
      exp = exp.slice(0, k) + "(" + exp.slice(k) + ")";
    }
    exponents.pop();
  }

  for(let i = 0; i < exp.length; i++){
    // Checks for negative number
    if(exp.charAt(i) == '-'){
      if(i == 0){
        let checkForExponent = false;
        let k = 1;
        while(!isNaN(exp.charAt(k)) && k < len){
          if(exp.charAt(k + 1) == "^") checkForExponent = true;
          k++;
        }
        if(checkForExponent = true) {
          exp = "N(" + exp.slice(1) + ")";
        } else {
          exp = "N"  + exp.slice(1);
        }
      }else if(isNaN(exp.charAt(i - 1))){
        exp = exp.slice(0, i) + "N" + exp.slice(i+1);

      }
    }
    // Multiplication for parenthesis ex: 4(5)
    if(exp.charAt(i) == '(' && i != 0){
      if(!isNaN(exp.charAt(i - 1))){
        exp = exp.slice(0, i) + "*" + exp.slice(i);

      } else if(exp.charAt(i - 1) == "N"){
        exp = exp.slice(0, i) + "1*"  + exp.slice(i);

      }
    }
    // Multiplication for parenthesis ex: (5)4
    if(exp.charAt(i) == ')' && i + 1 < len){
      if(!isNaN(exp.charAt(i + 1)) || exp.charAt(i + 1) == "(" || exp.charAt(i + 1) == "N"){
        exp = exp.slice(0, i + 1) + "*" + exp.slice(i + 1);
      }
    }
  }
  return exp;
}

// Order of operations
function pemdas(character) {
  switch(character){
    case '+':
    case '-':
      return 1;
    case '*':
    case '/':
      return 2;
    case '^':
      return 3;
  }
  return -1;
}

/************************************************************
 * Below are helper functions to make it a better experience
 * These do not affect how the calculator performs
 ************************************************************/

 // Event listeners to update caret position
 screenDiv.addEventListener('keyup', update, false);
 screenDiv.addEventListener('keydown', update, false);
 screenDiv.addEventListener('mousedown', update, false);
 screenDiv.addEventListener('mouseup', update, false);

 // Called on every keyup/down or mouseup/down to update caret position
 function update(event) {
   if(event.keyCode != 13){
     document.getElementById("caretposition").innerHTML = getCaretPosition(screenDiv);
   }
 }

 // This gets the caret position so a user can click in the middle of their
 // equation and their input will be where they expect it to be
 function getCaretPosition(screen){
   let caretPos = 0, sel, range;
   if(window.getSelection){
     sel = window.getSelection();
     if(sel.rangeCount){
       range = sel.getRangeAt(0);
       if(range.commonAncestorContainer.parentNode == screen){
         caretPos = range.endOffset;
       }
     }
   } else if (document.selection && document.selection.createRange) {
     range = document.selection.createRange();
     if(range.parentElement() == screen) {
       let tempEl = document.createElement("span");
       screen.insertBefore(tempEl, screen.firstChild);
       let tempRange = range.duplicate();
       tempRange.moveToElementText(tempEl);
       tempRange.setEndPoint("EndToEnd", range);
       caretPos = tempRange.text.length;
     }
   }
   return caretPos;
 }

 // This is called when a double click on the back button occurs to clear input
 function clearScreen() {
   let caretpositionDiv = document.getElementById("caretposition");
   caretpositionDiv.innerHTML = 0;
   screenDiv.innerHTML = "";
 }
