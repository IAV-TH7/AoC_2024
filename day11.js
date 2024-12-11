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

function EvalA(stones, iter){
	for(let a = 0; a < iter; a++){
		let r = []; // result
		for(let i = 0; i < stones.length; i++){
			let n = Number(stones[i]);
			let l = stones[i].length;
			if(n==0) r.push("1");
			else if (l%2) r.push(""+(2024*n));
			else{
				let half = (stones[i].length/2);
				r.push(stones[i].substr(0,half));
				r.push(""+Number(stones[i].substr(half, half)));
			}
		}
		stones = r;
	}
	return stones.length;
}

function EvalB(stone, iter, dict){
	if(iter < 1) return 1;
	
	// lookup result from dictionary, if possible
	let lbl = stone+"_"+iter;
	if(dict.hasOwnProperty(lbl)) return dict[lbl];

	// otherwise calculate result (recursively)
	let res = 0;
	let n = Number(stone);
	let l = stone.length;
	if(n==0) res = EvalB("1", iter-1, dict);
	else if (l%2) res = EvalB(""+(2024*n), iter-1, dict);
	else{
		let half = (stone.length/2);
		let st1 = stone.substr(0,half);
		let st2 = ""+Number(stone.substr(half, half));
		res = EvalB(st1, iter-1, dict) + EvalB(st2, iter-1, dict);
	}
	
	// store result in dictionary
	dict[lbl] = res;
	return res;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let line = file.trim();
	
	let stones_a = line.split(' ');
	let stones_b = line.split(' ');
	
	// A) 
	console.log("Result A: "+EvalA(stones_a, 25));
	
	// B) 
	let dict = {};
	let result = 0;
	for(let i = 0; i < stones_b.length; i++){
		result += EvalB(stones_b[i], 75, dict);
	}
	console.log("Result B: "+result);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
