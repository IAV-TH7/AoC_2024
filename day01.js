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

const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n')

	// assemble left and right list
	let list_l=[];
	let list_r=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		let l_arr=lines[i].trim().split('   ');
		if(l_arr.length!=2) continue;
		list_l.push(Number(l_arr[0]));
		list_r.push(Number(l_arr[1]));
	}

	// sort lists
	list_l = [...list_l].sort((a, b) => a - b)
	list_r = [...list_r].sort((a, b) => a - b)

	// task A): calculate total distance
	let diff = 0;
	for(let i = 0; i < list_l.length; i++){
		diff += Math.abs(list_l[i]-list_r[i]);
	}
	console.log("Result A: Total distance is "+diff);

	// task B): calculate similarity score
	let score = 0;
	for(let i = 0; i < list_l.length; i++){
		let val = list_l[i];
		let cnt = countOccurrences(list_r, val);
		score += (val*cnt);
	}
	console.log("Result B: Similarity score is "+score);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
