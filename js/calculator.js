
function clickButton(operator) {
  console.log(operator);
  switch(operator) {
    case "AC":
      document.getElementById("screen").value = "";
      break;
    case "=":
      let expression = document.getElementById("screen").value;
      if(expression != ""){
        document.getElementById("screen").value = solve(expression);//eval(expression);
        //console.log(expression+"="+eval(expression));
      } else {
        document.getElementById("screen").value =  "invalid";
      }

      break;
    default:
      document.getElementById("screen").value += operator;
      break;
  }
}


function solve(expression){
  let postfix = infixToPostfix(expression);
  let stack = [];
  for(let i = 0; i < postfix.length; i++){
    let character = postfix.charAt(i);
    if(character == ' '){
      continue;
    } else if(!isNaN(character) && character != ' '){
      let num = "";

      while(!isNaN(character) && character != ' '){
        num += character;
        i++;
        character = postfix[i];
      }
      i--;
      stack.push(parseInt(num));
    } else {
      let val1 = parseInt(stack.pop());
      let val2 = parseInt(stack.pop());
      switch(character){
        case '+':
          stack.push(val1+val2);
          break;
        case '-':
          stack.push(val2-val1);
          break;
        case '/':
          stack.push(val2/val1);
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

  return stack.pop();
}

function infixToPostfix(expression){

  let result = "";
  let stack = [];

  for(let i = 0; i < expression.length; i++) {

    if(!isNaN(expression[i])){
      let n = 0;
      while(!isNaN(expression[i])){
        result += expression[i];
        i++
      }
      i--;
      result += ' ';

    } else if (expression[i] == '('){
      stack.push(expression[i]);
    } else if(expression[i] == ')'){
      while(stack.length > 0 && stack[stack.length - 1] != '('){
        result += stack.pop();
      }
      if(stack.length > 0 && stack[stack.length - 1] != '('){
        return -1;
      } else {
        stack.pop();
      }
    }else{
      while(stack.length > 0 && pemdas(expression[i]) <= pemdas(stack[stack.length - 1])){
        result += stack.pop();
      }
      stack.push(expression[i]);
    }

  }

  while(stack.length > 0){
    result += stack.pop();
  }
  if(result.indexOf("(") != -1){
    return -1;
  }
  return result;
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
