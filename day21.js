const fs = require('fs');

function ReadFile(path, cod, print_err=true){
	let result = null;
	try{
		result = fs.readFileSync(path, cod);
	}
	catch(err) {
		if(print_err) console.error(err);
	}
	return result;
}

// On a given pad, check if the provided path leads from start to end coordinate and won't leave the pad area
function isPadPathValid(pad, path, s, e){
	// Return only sequences which will never leave the keypad area
	let crnt = {l: s.l, c: s.c};
	for(let i = 0; i < path.length; i++){
		let c = path[i];
		if(c=='U') crnt.l--;
		else if(c=='D') crnt.l++;
		else if(c=='L') crnt.c--;
		else if(c=='R') crnt.c++;
		else return false;
		if(!pad.hasOwnProperty(""+crnt.l+crnt.c)) return false;
	}
	return (crnt.l==e.l && crnt.c==e.c);
}

// For a given pad, return all shortests, valid paths from start to end coordinate
function PadNavigation(pad, pos_s, pos_e){
	if((pos_s.l==pos_e.l) && (pos_s.c==pos_e.c)) return ["A"];
	let lbl = pos_s.l+'_'+pos_s.c+'_'+pos_e.l+'_'+pos_e.c;

	let res = [];
	// determine theoretical sequences
	let dif = {l:(pos_e.l-pos_s.l), c:(pos_e.c-pos_s.c)};
	let dir = {l:(dif.l>0?"D":"U"), c:(dif.c>0?"R":"L")};
	let steps = {l: Math.abs(dif.l), c:Math.abs(dif.c)};
	let combs = [];
	combs.push([[], [[1]], [[1,1]]]); // 0 vertical steps, 0-2 horizontal steps
	combs.push([[[0]], [[0,1],[1,0]], [[0,1,1],[1,0,1],[1,1,0]]]); // 1 vertical step, 0-2 horizontal steps
	combs.push([[[0,0]], [[0,0,1],[0,1,0],[1,0,0]], [[0,0,1,1],[0,1,0,1],[1,0,0,1],[0,1,1,0],[1,0,1,0],[1,1,0,0]]]); // 2 vertical step, 0-2 horizontal steps
	combs.push([[[0,0,0]], [[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0]], [[0,0,0,1,1],[0,0,1,0,1],[0,1,0,0,1],[1,0,0,0,1],[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[0,1,1,0,0],[1,0,1,0,0],[1,1,0,0,0]]]); // 3 vertical step, 0-2 horizontal steps
	let vh = combs[steps.l][steps.c];
	for(let i = 0; i < vh.length; i++){
		let pat = [];
		for(let j = 0; j < vh[i].length; j++){
			if(vh[i][j]) pat.push(dir.c);
			else         pat.push(dir.l);
		}
		if(isPadPathValid(pad, pat, pos_s, pos_e)){
			pat.push("A");
			res.push(pat.join(""));
		}
	}
	return res;
}

function getKeyCoord(pad, key){
	for(const [cstr, k] of Object.entries(pad)){
		if(k!=key) continue;
		return {l:Number(cstr.substr(0,1)),c:Number(cstr.substr(1,1))}
	}
	return null;
}

function buildPadRoutes(pad){
	let keys = [];
	for(const [cstr, k] of Object.entries(pad)) keys.push(k);
	let routes={};
	for(let i = 0; i < keys.length; i++){
		for(let j = 0; j < keys.length; j++){
			routes[keys[i]+"_"+keys[j]]=PadNavigation(pad, getKeyCoord(pad, keys[i]), getKeyCoord(pad, keys[j]));	
		}
	}
	return routes;
}

function extendRoutes(routes, seqs){
	let res = [];
	if(!routes){
		for(let i = 0; i < seqs.length; i++) res.push(seqs[i]);
		return res;
	}
	if(seqs.length == 0) return routes;	

	for(let i = 0; i < routes.length; i++){
		for(let j = 0; j < seqs.length; j++){
			res.push(routes[i].concat(seqs[j]));
		}
	}
	return res;
}

function getRoutesForCode(padroutes, code){
	let routes = null;
	let crnt_key = 'A';
	for(let i = 0; i < code.length; i++){
		routes = extendRoutes(routes, padroutes[crnt_key+'_'+code[i]]);
		crnt_key = code[i];
	}
	return routes;
}

function getRouteLengthForCode(routes_d, cache, seq, padid, maxpad){
	// Lookup result in cache, if possible
	let ckey = seq+"_"+padid;
	if(cache.hasOwnProperty(ckey)) return cache[ckey];

	let prev = 'A';  // Starting position on our pad is always at "A"
	let ret_len = 0; // we'll return the input length of the final pad
	for(let i = 0; i < seq.length; i++){
		let opts = routes_d[prev+"_"+seq[i]];
		if(padid >= maxpad) ret_len += opts[0].length; // if we reached last pad, return length of first sequence (all optional sequences have same length)
		else{
			let minlen = -1;
			for(let j = 0; j < opts.length; j++){
				let crntlen = getRouteLengthForCode(routes_d, cache, opts[j], padid+1, maxpad);
				if(minlen < 0 || crntlen < minlen) minlen = crntlen; // only consider the shortest option
			}
			ret_len += minlen;
		}
		prev = seq[i];
	}
	
	cache[ckey]=ret_len; // Store result in cache
	return ret_len;
}

function Advent_Main(filename, dim, n_corr){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	
	// Parse input file
	let input_codeseq=[];
	let input_codeint=[];
	for(let i = 0; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<3) continue; // ignore (near-)empty lines etc.
		input_codeseq.push(l);
		input_codeint.push(Number(l.substr(0,l.length-1)));
	}	
	
	// Build pads (consisting of coordinates and key label) and compute shortest pad routes 
	let pad_n = { // 
		'00': '7',
		'01': '8',
		'02': '9',
		'10': '4',
		'11': '5',
		'12': '6',
		'20': '1',
		'21': '2',
		'22': '3',
		'31': '0',
		'32': 'A',
	};
	let pad_d ={
		'01': 'U',
		'02': 'A',
		'10': 'L',
		'11': 'D',
		'12': 'R',
	}
	let routes_n=buildPadRoutes(pad_n);
	let routes_d=buildPadRoutes(pad_d);
	
	// Determine possible input sequences for the first directional pad
	let dirpad_codes=[];
	for(let i = 0; i < input_codeseq.length; i++){
		dirpad_codes.push(getRoutesForCode(routes_n, input_codeseq[i]));
	}

	// A) Determine complexity of optimal input sequences for the 2nd directional pad
	let result_a = 0;
	for(let i = 0; i < dirpad_codes.length; i++){
		let result_len = -1;
		let result_code = input_codeint[i];
		for(let j = 0; j < dirpad_codes[i].length; j++){
			let testcode = dirpad_codes[i][j];
			let cache = {};
			let res = getRouteLengthForCode(routes_d, cache, testcode, 1, 2);
			if(result_len < 0 || res < result_len) result_len = res;
		}
		result_a += (result_code*result_len);
	}
	console.log("Result A: The sum of complexities is: "+result_a);
	
	// B) Determine complexity of optimal input sequences for the 25th directional pad
	let result_b = 0;
	for(let i = 0; i < dirpad_codes.length; i++){
		let result_len = -1;
		let result_code = input_codeint[i];
		for(let j = 0; j < dirpad_codes[i].length; j++){
			let testcode = dirpad_codes[i][j];
			let cache = {};
			let res = getRouteLengthForCode(routes_d, cache, testcode, 1, 25);
			if(result_len < 0 || res < result_len) result_len = res;
		}
		result_b += (result_code*result_len);
	}
	console.log("Result B: The sum of complexities is: "+result_b);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
