// the algorithm (reversed from the opcodes of my puzzle)
function AlgoStep(a){
	let b = (a%8n)^1n;
	return Number((b^(a>>b)^6n)%8n);
}

function AlgoComplete(num){
	let res = [];
	for(let a=BigInt(num);a>0n;a>>=3n){
		res.push(AlgoStep(a));
	}
	return res;
}

// recursively find an input which will cause the program to output its opcode sequence
function crackIteration(iter, cand_prev, stats){
	for(let i = 0n; i < 8n; i++){ // The next iteration includes 3 further bits, try all combinations again
		let candidate = cand_prev | (i<<(7n+(3n*iter))); // prepend the 3 bits to the candidate
		if(AlgoStep(candidate >> (3n*iter))!=stats.resarr[iter]) continue; // Do we get the correct next output value?
		if(iter >= (stats.resarr.length-1)){
			if(JSON.stringify(AlgoComplete(candidate)) == JSON.stringify(stats.resarr) /*candidates might produce more output than aimed for*/ && (stats.mininput===undefined || (candidate < stats.mininput))) stats.mininput = candidate;
		}
		else crackIteration(iter+1n, candidate, stats);
	}
}

let stats={
	resarr: [2,4,1,1,7,5,0,3,4,7,1,6,5,5,3,0],
	mininput: undefined
}

for(let candidate = 0n; candidate < 1024n; candidate++){ // First step: Find all combinations for the 10 least significant bits which output the first required character
	if(AlgoStep(candidate)!=stats.resarr[0])continue;
	crackIteration(1n, candidate, stats); // Do the next steps recursively
}

console.log("Result B: "+stats.mininput);
