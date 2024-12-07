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

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n')

	// Parse input to Number arrays
	let results=[];
	let numbers=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		let tmp = lines[i].trim().split(':');
		if(tmp.length != 2) return;
		results.push(Number(tmp[0]));
		tmp = tmp[1].trim().split(' ');
		if(tmp.length < 2) return;
		let n = [];
		for(let j = 0; j < tmp.length; j++){
			n.push(Number(tmp[j]));
		}
		numbers.push(n);
	}

	// Part A: Addition and multiplication
	let result_a = 0;
	for(let i = 0; i < numbers.length; i++){
		let n_comb = 2 ** (numbers[i].length-1); // number of operator combinations to try
		let match = false;
		for(let x = 0; x < n_comb && !match; x++){ // try each combination
			let res = numbers[i][0];
			for(let comb = x, j = 0; j < (numbers[i].length-1); j++){
				let mode = comb%2;
				if(      mode == 0) res+= numbers[i][j+1];
				else if (mode == 1) res*= numbers[i][j+1];
				comb = Math.floor(comb/2);
			}
			if(res == results[i]) match = true;
		}
		if(match) result_a += results[i];
	}
	console.log("Result A: "+result_a);

	// Part B: Addition, multiplication and concatenation
	let result_b = 0;
	for(let i = 0; i < numbers.length; i++){
		let n_comb = 3 ** (numbers[i].length-1); // number of operator combinations to try
		let match = false;
		for(let x = 0; x < n_comb && !match; x++){ // try each combination
			let res = numbers[i][0];
			for(let comb = x, j = 0; j < (numbers[i].length-1); j++){
				let mode = comb%3;
				if(      mode == 0) res+= numbers[i][j+1];
				else if (mode == 1) res*= numbers[i][j+1];
				else                res= Number((res+""+numbers[i][j+1]));
				comb = Math.floor(comb/3);
			}
			if(res == results[i]) match = true;
		}
		if(match) result_b += results[i];
	}
	console.log("Result B: "+result_b);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
