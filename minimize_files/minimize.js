
var testAuto = {"states":["s2","s1","s0"],"alphabet":["b","a", "c"],"acceptingStates":["s1"],"initialState":"s0","transitions":[{"fromState":"s0","toStates":["s1"],"symbol":"a"},{"fromState":"s0","toStates":["s2"],"symbol":"b"},{"fromState":"s1","toStates":["s2"],"symbol":"a"},{"fromState":"s1","toStates":["s0"],"symbol":"b"},{"fromState":"s2","toStates":["s0"],"symbol":"a"},{"fromState":"s2","toStates":["s2"],"symbol":"b"}]}

var automaton = {}

var minStruct = {};

var minimizedAutomaton = {};

var classCount = 2;

function inputToAutomaton() {
	
	var automatonObject = {
		
	};

	var inputLineArray = $("#input").val().replace(/ /g, "").split("\n");

	inputLineArray.forEach((line) => {
		var lineParts = line.split(":");
		var left = lineParts[0];
		var right = lineParts[1];
		if (left ==="states") {
			automatonObject["states"] = right.split(",");
		} else if (left==="alphabet") {
			automatonObject["alphabet"] = right.split(",");
		} else if (left==="accepting") {
			automatonObject["acceptingStates"] = right.split(",");
		} else if (left==="initial") {
			automatonObject["initialState"] = right.split(",");
		} else if (left==="transitions") {
			automatonObject["transitions"] =  transitionTextArrayToTransitionArray(right.split("|"));
		}
	});
	
	console.log(automatonObject)
	return automatonObject;
}

function transitionTextArrayToTransitionArray(textArray) {
	var transArray = [];
	textArray.forEach((textTrans) => {
		transArray.push(textToTransition(textTrans));
	});
	return transArray;
}

function textToTransition(text) {
	var inputArray = text.split(",");
	var transitionObj = {};
	transitionObj["fromState"] = inputArray[0];
	transitionObj["toStates"]= [inputArray[2]] ;
	transitionObj["symbol"]= inputArray[1] ;
	return transitionObj;
}

function execute() {
	automaton =inputToAutomaton();
	console.log("Automaton");
	console.log(automaton);
	
	automaton['nfaeTable'] = buildInitialStucture2();
	drawGraph();
	console.log(automaton);
	nfae2nfa(automaton);
	drawGraphNFA();
	nfa2dfa(automaton);
	var formattedDFA = tableToGraphAutomata(automaton.dfaTable);
	drawGraphDFA(formattedDFA);
	
	addInitialClasses(automaton.dfaTable);
	minStruct = automaton.dfaTable;
	minimize();
	
	drawMinGraph();
}

function minimize() {
	reClass(automaton);
	var newCount = reName(automaton);
	if (newCount!= classCount) {
		classCount = newCount;
		minimize();
	};
	buildMinimizedAutomaton();
}

function drawGraph() {

console.log("formattedOriginalAutomaton");
 	var formattedAutomaton = tableToGraphAutomata(automaton.nfaeTable);
 	console.log(formattedAutomaton);
  var dotString = noam.fsm.printDotFormat(formattedAutomaton);

  var gvizXml = Viz(dotString, "svg");
  $("#automatonGraph").html(gvizXml);
  $("#automatonGraph svg").width($("#automatonGraph").width());

}

function drawGraphNFA() {

 	var formattedAutomaton = tableToGraphAutomata(automaton.nfaTable);
console.log("formattedNFAAutomaton");
 	console.log(formattedAutomaton);
  var dotString2 = noam.fsm.printDotFormat(formattedAutomaton);

  var gvizXml2 = Viz(dotString2, "svg");
  $("#automatonNFAGraph").html(gvizXml2);
  $("#automatonNFAGraph svg").width($("#automatonNFAGraph").width());

}

function drawGraphDFA(dfa) {

 	var formattedAutomaton = dfa;
console.log("formattedDFAAutomaton");
 	console.log(formattedAutomaton);
  var dotString4 = noam.fsm.printDotFormat(formattedAutomaton);

  var gvizXml4 = Viz(dotString4, "svg");
  $("#automatonDFAGraph").html(gvizXml4);
  $("#automatonDFAGraph svg").width($("#automatonDFAGraph").width());

}

function drawMinGraph() {

	console.log("minimizedAutomaton");
	console.log(minimizedAutomaton);
  var dotString3 = noam.fsm.printDotFormat(minimizedAutomaton);

  var gvizXml3 = Viz(dotString3, "svg");
  $("#minimizedAutomatonGraph").html(gvizXml3);
  $("#minimizedAutomatonGraph svg").width($("#minimizedAutomatonGraph").width());
}

function addInitialClasses(dfa) {
	Object.keys(dfa).forEach((state) => {
		dfa[state].class = (!dfa[state].accepting)?"A":"B";
	});
}


function buildInitialStucture2() {
	var struct = {};
	automaton.states.forEach((state) => {
		var stateTransitions = {};
		var accepting = automaton.acceptingStates.includes(state);
		var initial = state === automaton.initialState[0];
		struct[state] = {
			trans: stateTransitions,
			accepting,
			initial
		}
	});
	automaton.transitions.forEach((transition) => {
		if (!struct[transition.fromState].trans[transition.symbol])
			struct[transition.fromState].trans[transition.symbol] = [];
		struct[transition.fromState].trans[transition.symbol].push(transition.toStates[0]);
	})
	console.log("struct");
	console.log(struct);
	return struct;
}
function getNextState(automaton, currentState, symbol) {
	var transition = automaton.transitions.find((transition) => {
		//console.log("finding <"+currentState+"> <"+symbol+"> in "+JSON.stringify(transition));
		//console.log(transition.fromState +"="+currentState+"? "+(transition.fromState==currentState));
		//console.log(transition.symbol +"="+symbol+"? "+(transition.symbol==symbol));
		//console.log(transition.fromState==currentState && transition.symbol==symbol);
		return transition.fromState==currentState && transition.symbol==symbol
	})
	//console.log("transition")
	//console.log(transition)
	if (transition)
		return transition.toStates[0];
	else
		return null;
}

//Gets the new class for each state, based on the clases of its transitions
function reClass(automaton) {
	Object.keys(minStruct).forEach((state) => {
		minStruct[state].newClass = minStruct[state].class;
		Object.keys(minStruct[state].trans).forEach((symbol) => {
			var nextState = minStruct[state].trans[symbol];
			minStruct[state].newClass+=minStruct[nextState].class;
		})
	})
}

//renames the new assigned classes to simpler ones (i.e. AAA -> A, AAB -> B, BAA -> C)
//and replaces the original classes with the new ones
function reName() {
	var counter = 65; //65 = ascii A
	var shortClasses = {};
	Object.keys(minStruct).forEach((state) => {
		var longClass = minStruct[state].newClass;
		if (!shortClasses[longClass]){
			shortClasses[longClass] = String.fromCharCode(counter);
			counter++
		}
	});
	console.log(shortClasses);
	

	Object.keys(minStruct).forEach((state) => {
		var shortClass = shortClasses[minStruct[state].newClass];
		minStruct[state].class=shortClass;
		minStruct[state].newClass=null;
	});
	console.log(minStruct);

	console.log("new class count =" +(counter-65));
	return (counter-65);
}

function buildMinimizedAutomaton(struct) {
	var minimizedAutomatonObject = {
		
	};

	var stateArray = [];
	Object.keys(minStruct).forEach((state) => {
		if (!stateArray.includes(minStruct[state].class)) {
			stateArray.push(minStruct[state].class);
		}
	});
	minimizedAutomatonObject["states"] = stateArray;

	var transitionArray = [];
	var classesAdded = [];
	var acceptedArray = [];
	var initialArray = [];
	Object.keys(minStruct).forEach((state) => {
		var stateClass = minStruct[state].class;
			if (!classesAdded.includes(stateClass)){
				Object.keys(minStruct[state].trans).forEach((symbol) => {
					
						var nextState = minStruct[state].trans[symbol];
						var nextStateClass = minStruct[nextState].class;
						transitionArray.push({fromState: stateClass, toStates:[nextStateClass], symbol});					
				})

				if (minStruct[state].accepting)
					acceptedArray.push(stateClass);

				if (minStruct[state].initial) {
					initialArray.push(stateClass);
				}
			}
		classesAdded.push(stateClass);
	})
	minimizedAutomatonObject["transitions"] = transitionArray;
	minimizedAutomatonObject["alphabet"] = automaton["alphabet"];
	minimizedAutomatonObject["initialState"] = initialArray;
	minimizedAutomatonObject["acceptingStates"] = acceptedArray;
	console.log(minimizedAutomatonObject);
	minimizedAutomaton = minimizedAutomatonObject;
}

function tableToGraphAutomata(table) {
	var automatonObject = {
		
	};

	var stateArray = [];
	Object.keys(table).forEach((state) => {
		if (!stateArray.includes(table[state].class)) {
			stateArray.push(table[state].class);
		}
	});
	automatonObject["states"] = automaton.states;

	var transitionArray = [];
	var classesAdded = [];
	var acceptedArray = [];
	var initialArray = [];
	Object.keys(table).forEach((state) => {
		
			Object.keys(table[state].trans).forEach((symbol) => {
					
						var nextState = table[state].trans[symbol];
						
						transitionArray.push({fromState: state, toStates:[nextState], symbol});					
				})

				if (table[state].accepting)
					acceptedArray.push(state);

				if (table[state].initial) {
					initialArray.push(state);
				}
	})
	automatonObject["transitions"] = transitionArray;
	automatonObject["alphabet"] = automaton["alphabet"];
	automatonObject["initialState"] = initialArray;
	automatonObject["acceptingStates"] = acceptedArray;
	console.log(automatonObject);
	return automatonObject;
}