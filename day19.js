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

function solveTask(task, designs, dict){
	if(dict.hasOwnProperty(task)) return dict[task]; // we need a cache for reasonable performance in part B
	
	let res = 0;
	for(let i = 0; i < designs.length; i++){
		if(task == designs[i]) res++;
		else if(task.startsWith(designs[i])){
			let task_next = task.substring(designs[i].length);
			res += solveTask(task_next, designs, dict);
		}
	}
	dict[task] = res;
	return res;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');

	// Parse input file
	let designs=lines[0].trim().split(', ');;
	let tasks=[];
	for(let i = 1; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<3) continue; // ignore (near-)empty lines etc.
		tasks.push(l);
	}
	
	let res_a = 0;
	let res_b = 0;
	for(let i = 0; i < tasks.length; i++){
		let dict = {};
		let solutions = solveTask(tasks[i], designs, dict);
		if(solutions > 0) res_a++;
		res_b += solutions;
	}

	console.log("Result A: "+res_a);
	console.log("Result B: "+res_b);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
