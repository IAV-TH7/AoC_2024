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

function isNum(s){
	for(let i = 0; i < s.length; i++){
		if(s.charAt(i) < '0' || s.charAt(i) > '9') return false;
	}
	return true;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let sum_a = 0;
	let sum_b = 0;
	let active = true;
	for(let i = 0; i < file.length; i++){
		let seg = file.substr(i,12);
		if(seg.startsWith("do()")) active = true; 
		else if(seg.startsWith("don't()")) active = false;
		else if(seg.startsWith("mul(")){
			let idx_c = seg.indexOf(",");
			let idx_b = seg.indexOf(")");
			if(idx_b < 0 || idx_c <0 || idx_b < idx_c) continue;
			let num1 = seg.substr(4, idx_c-4);
			let num2 = seg.substr(idx_c+1, idx_b-idx_c-1);	
			if(!isNum(num1) || !isNum(num2)) continue;
			let prod = (Number(num1)*Number(num2));
			sum_a += prod;
			if(active) sum_b += prod;
		}
	}
	
	console.log("Result A: "+sum_a);
	console.log("Result B: "+sum_b);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
