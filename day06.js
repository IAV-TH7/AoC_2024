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

// Checks if a map position is valid, i.e. in allowed boundary
function isPosValid(map, pos){
	if((pos.l<0) || (pos.l>=map.length)) return false;
	if((pos.c<0) || (pos.c>=map[0].length)) return false;
	return true;
}

function take1Step(map,cpos){
	let npos = {l:cpos.l, c:cpos.c, d:cpos.d};
	if(cpos.d=='n') npos.l--;
	else if(cpos.d=='e') npos.c++;
	else if(cpos.d=='s') npos.l++;
	else if(cpos.d=='w') npos.c--;
	else return null;
	if(!isPosValid(map, npos)) return null;

	if(map[npos.l][npos.c]!='#') return npos; // step, if no obstacle
	if(cpos.d=='n') cpos.d='e'; // in front of obstacles, don't step but turn clockwise
	else if(cpos.d=='e') cpos.d='s';
	else if(cpos.d=='s') cpos.d='w';
	else if(cpos.d=='w') cpos.d='n';
	return cpos;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n')

	// Assemble map
	let map=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		map.push(lines[i].trim().split(''));
	}
	
	// Find guard's starting position
	let dirs = ["s","e","n","w"];
	let start = null;
	for(let z=0; z < map.length; z++){
		for(let s=0; !start && s < map[z].length; s++){
			if(map[z][s]=='^') start = {l:z,c:s,d:'n'};
		}
	}
	if(!start) return;
	
	// Part A): Find fields passed by the guard before he leaves
	let cpos = {l:start.l, c:start.c, d:start.d};
	let passed=[];
	passed.push(start.l+"/"+start.c); // add starting position
	while(true){
		let npos = take1Step(map, cpos);
		if(npos==null) break; // guard left area
		let loc = npos.l+"/"+npos.c;
		if(!passed.includes(loc)) passed.push(loc);
		cpos=npos;
	}
	console.log("Result A: Guard passed "+passed.length+" locations.");
	
	// Part B) Count possible locations for placing an obstacle which will cause a loop
	let loopcount = 0;
	for(let z=0; z < map.length; z++){
		for(let s=0; s < map[z].length; s++){
			if(map[z][s]=='#') continue; // There's already an obstacle here
			map[z][s]='#'; // Place obstacle

			passed={};
			let loopfound = false;
			let cpos = {l:start.l, c:start.c, d:start.d};
			while(!loopfound){
				let npos = take1Step(map, cpos);
				if(npos==null) break; // guard left area
				let loc = npos.l+"/"+npos.c+"_"+npos.d; // this time we also respect the orientation
				if(passed.hasOwnProperty(loc)) loopfound = true;
				else passed[loc]='true';
				cpos=npos;
			}
			map[z][s]='.'; // remove obstacle
			if(loopfound) loopcount++;
		}
	}
	console.log("Result B: Number of possible loops by placing 1 obstacle: "+loopcount);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
