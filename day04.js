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

let pat = "XMAS";

function scanDirectional(map,z,s,n,dir){
	let nz = z+dir[0];
	let ns = s+dir[1];
	if(nz < 0 || nz >= map.length || ns < 0 || ns >= map[nz].length) return 0;
	if(map[nz][ns] != pat.charAt(n)) return 0;
	if(n >= pat.length-1) return 1;
	else return scanDirectional(map,nz,ns,n+1,dir);
}

function checkXPat(m,z,s){
	if(z < 1 || z >= m.length-1 || s < 1 || s >= m[z].length-1) return 0;
	// scan downward wing
	if((m[z-1][s-1]=='M'&&m[z+1][s+1]=='S') || (m[z-1][s-1]=='S'&&m[z+1][s+1]=='M')){
		// scan upward wing
		if((m[z+1][s-1]=='M'&&m[z-1][s+1]=='S') || (m[z+1][s-1]=='S'&&m[z-1][s+1]=='M')) return 1;
	}
	return 0;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	let map=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		map.push(lines[i].trim().split(''));
	}

	let score_a = 0;
	let score_b = 0;
	let dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
	for(let z = 0; z < map.length; z++){
		for(let s = 0; s < map[z].length; s++){
			// part A
			if(map[z][s]==pat.charAt(0)){
				for(let d = 0; d < dirs.length; d++) score_a += scanDirectional(map,z,s,1,dirs[d]);
			}
			// part B
			if(map[z][s]=='A' && checkXPat(map,z,s)) score_b++;
		}
	}

	console.log("A) Number of XMAS: "+score_a);
	console.log("B) Number of X-MAS: "+score_b);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
