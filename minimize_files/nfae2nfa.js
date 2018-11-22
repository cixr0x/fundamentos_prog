
var EPS = '$';

function nfae2nfa(nfae) {
	console.log("NFAE to NFA");
	
	//getCompleteTransitions(nfae, 'A', '0');
	// getCompleteTransitions(nfae, 'B', '0');
	//getCompleteTransitions(nfae, 'B', '1');
	nfae.nfaTable = {}
	Object.keys(nfae.nfaeTable).forEach((state) => {
		nfae.nfaTable[state] = {};
		nfae.nfaTable[state].trans = {};
		nfae.nfaTable[state].accepting =nfae.nfaeTable[state].accepting  ;
		nfae.nfaTable[state].initial =nfae.nfaeTable[state].initial  ;

		//console.log(nfae.alphabet);
		nfae.alphabet.forEach((symbol) => {
			if (symbol=== EPS) {
				return;
			}	
			var stateSet = getCompleteTransitions(nfae, state, symbol);
			if (stateSet.size === 0) return;
			nfae.nfaTable[state].trans[symbol] = [...stateSet];

		})
	})
	if (nfae.alphabet.includes(EPS))
		nfae.alphabet.splice( nfae.alphabet.indexOf(EPS), 1 );

}

function recursiveFind(nfae, state, symbol, stateArray) {
	
	//console.log("Looking for "+state+" transitions");

	var toStates = getStateTransitions(nfae, state, symbol);
	stateArray.add(state);
	
	//console.log("Transitions with "+symbol);
	//console.log(toStates);
	if (toStates === undefined)
		return;
	toStates.forEach((toState) => {
		if (stateArray.has(toState))
			return;
		stateArray.add(toState);
		recursiveFind(nfae, toState, symbol, stateArray);
	});

}

function getCompleteTransitions(nfae, state, symbol) {
	var epsClosure1 = new Set();
	recursiveFind(nfae, state, EPS, epsClosure1);
	//console.log('epsClosure1');
	//console.log(epsClosure1);

	var completeStates = new Set();
	epsClosure1.forEach((epsilonState) => {
		if (epsilonState !== state){
			completeStates.add(epsilonState);
		}
		var stateSymbolTransitions = getStateTransitions(nfae, epsilonState, symbol);
		if (stateSymbolTransitions !== undefined) {
			stateSymbolTransitions.forEach((symbolTransition) => {
				recursiveFind(nfae, symbolTransition, EPS, completeStates);
			});
		}
	});
//	console.log("Complete transition "+state+"  "+symbol);
//	console.log(completeStates);
	return completeStates;
}

function getStateTransitions(nfae, state, symbol) {
	var stateInfo = nfae.nfaeTable[state];
	if (stateInfo === undefined)
		return [];
	var stateTransitions = stateInfo.trans;
	var toStates = stateTransitions[symbol];
	return toStates;
}