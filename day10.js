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

function isCoordValid(map, coord){
	if(coord.l<0 || coord.l>=map.length) return false;
	if(coord.c<0 || coord.c>=map[coord.l].length) return false;
	return true;
}

function climbUpwards(map, crnt, trg){
	let diffs = [{l:-1,c:0},{l:0,c:1},{l:1,c:0}, {l:0,c:-1}];
	let nxtval = map[crnt.l][crnt.c]+1;
	for(let i = 0; i < diffs.length; i++){
		let next = {l:(crnt.l+diffs[i].l),c:(crnt.c+diffs[i].c)};
		if(!isCoordValid(map, next)) continue;
		if(map[next.l][next.c]!=nxtval) continue;
		if(nxtval == 9){
			let loccode = ((10000*next.l)+next.c);
			if(!trg.hasOwnProperty(loccode)) trg[loccode]=1;
			else trg[loccode]++;
		}
		else climbUpwards(map, next, trg);
	}
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n')

	// assemble topographic map
	let map=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		let n = [];		
		let tmp = lines[i].trim().split('');
		for(let j = 0; j < lines[i].length; j++){
			n.push(Number(tmp[j]));
		}
		map.push(n);
	}
	
	// find and count hiking trails
	let th_score = 0;
	let th_rating = 0;
	for(let i = 0; i < map.length; i++){
		for(let j = 0; j < map[i].length; j++){
			if(map[i][j] != 0) continue;
			reachable={};
			climbUpwards(map, {l:i, c:j}, reachable);
			for(const [code, cnt] of Object.entries(reachable)) {
				th_score++;
				th_rating+=cnt;
			}
		}
	}
	console.log("Part A: The sum of trailhead scores is "+th_score+".");
	console.log("Part B: The sum of trailhead ratings is "+th_rating+".");
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
