var dfa = {};

function nfa2dfa(nfa){
	var newStates = new Set([]);
	newStates.add(nfa.initialState[0]);

	nfa['dfaTable'] = {};
	while (newStates.size > 0) {
		var state = newStates.values().next().value;
		nfa.dfaTable[state] = {};
		nfa.dfaTable[state].trans = {};
		nfa.alphabet.forEach((symbol) => {
			console.log(nfa);
			var mergedState =  buildMergedState(nfa.nfaTable, state, symbol);
			console.log("Merged State");

			console.log(mergedState);
			nfa.dfaTable[state].trans[symbol] =mergedState;

			if (!Object.keys(nfa.dfaTable).includes(mergedState)){
				newStates.add(mergedState);
			}

			nfa.dfaTable[state].initial = state=== nfa.initialState[0];
			
			state.split("").forEach((s) => {
				nfa.dfaTable[state].accepting = nfa.acceptingStates.includes(s);
			})
			if (state ==='Z')
				nfa.dfaTable[state].accepting = false;
		});
		newStates.delete(state);
	}
	
	console.log(nfa);
}

function buildMergedState(nfa, stateArray, symbol) {
	console.log("Merged state "+stateArray+" with symbol "+symbol);
	if (stateArray === "Z")
		return "Z";
	var totalStates = new Set([]);
	stateArray= stateArray.split("");
	stateArray.forEach((state) => {
		if (!nfa[state].trans[symbol]) {
			return;
		}

		nfa[state].trans[symbol].forEach((toState) => {
			totalStates.add(toState);
		})
	})
	var mergedState = Array.from(totalStates).sort().join('');
	if (mergedState === "")
		mergedState = "Z";
	return mergedState;
}