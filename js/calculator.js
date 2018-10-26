let screenDiv = document.getElementById("screen");

// Event listeners to update caret position
screenDiv.addEventListener('keyup', update, false);
screenDiv.addEventListener('keydown', update, false);
screenDiv.addEventListener('mousedown', update, false);
screenDiv.addEventListener('mouseup', update, false);


// Click equals button if user presses enter in the input
screenDiv.addEventListener("keyup", function(event) {
  event.preventDefault();
  if(event.keyCode === 13) {
    document.getElementById("equals").click();
  }
});

screenDiv.addEventListener("blur", function(event){
  event.target.focus();
});

function update() {
  document.getElementById("caretposition").innerHTML = getCaretPosition(screenDiv);
}

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



// This is called when a user clicks on one of the buttons and recieves what button was clicked
function clickButton(operator) {
  let caretpositionDiv = document.getElementById("caretposition")
  switch(operator) {
    case "AC":
      screenDiv.innerHTML = "";
      caretpositionDiv.innerHTML = "0"
      break;
    case "=":
      let expression = screenDiv.innerHTML;
      if((expression != "") && !(expression == "Parenthesis Error" || expression == "Division by 0")){
        screenDiv.innerHTML = solve(expression);
      }
      caretpositionDiv.innerHTML = screenDiv.innerText.length;
      break;
    default:
      let exp = screenDiv.innerHTML;

      if(exp == "Parenthesis Error" || exp == "Operator Syntax Error" || exp == "\u221E" || exp == "Division by 0"){
        screenDiv.innerHTML = operator;
      } else if(exp.length < 21) {

        let location = caretpositionDiv.innerHTML;
        let newExp = exp.slice(0, location) + operator + exp.slice(location);
        screenDiv.innerHTML = newExp;
        caretpositionDiv.innerHTML++;
      }
      break;
  }
}




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
    } else if((!isNaN(character) && character != ' ') || character == 'N'){
      let num = "";

      while((!isNaN(character) && character != ' ') || character == '.' || character == 'N'){
        if(character == 'N'){
          num += '-';
        }else {
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
      console.log(val1 + " " + val2);
      if(val1 == undefined || val2 == undefined){
        return "Operator Syntax Error";
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

function checkExpression(exp) {
  let len = exp.length;
  for(let i = 0; i < len; i++){
    let temp = "";
    // Check if multiplication should be added case like 8(2) should be 8*(2)


    // Check for opening parens and add multiplication
    let newExp;
    if(exp.charAt(i) == '(' && i != 0){
      if(!isNaN(exp.charAt(i - 1))){
        temp = exp.slice(0, i);
        exp = temp + "*" + exp.slice(i);
      } else if(exp.charAt(i - 1) == "N"){
        temp = exp.slice(0,i);
        exp = temp + "1*"  + exp.slice(i);
      }
    }

    if(exp.charAt(i) == ')' && i != exp.length - 1){
      if(!isNaN(exp.charAt(i + 1)) || exp.charAt(i + 1) == "(" || exp.charAt(i + 1) == "N"){
        temp = exp.slice(0, i + 1);
        exp = temp + "*" + exp.slice(i + 1);
      }
    }

    if(exp.charAt(i) == '-'){
      if(i == 0){
        exp = "N"  + exp.slice(1);
        //console.log("NEGATIVE IN FIRST POS");
      }else if(isNaN(exp.charAt(i - 1))){
        exp = exp.slice(0, i) + "N" + exp.slice(i+1);
      }
    }


  }
  return exp;
}


function newExpr(exp, i){

}

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
