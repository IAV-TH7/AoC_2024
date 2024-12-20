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

function getCoordData(map, l, c){
	if(l<0 || l>=map.length) return '#'; // treat outside the area like walls
	if(c<0 || c>=map[l].length) return '#';
	return map[l][c];
}

function Advent_Main(filename, maxradius, threshold){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	
	// Assemble topographic map
	let map=[];
	let start = undefined;
	let end = undefined;
	for(let i = 0; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<3) continue; // ignore (near-)empty lines etc.
		map.push(l.split(''));
		let s = l.indexOf('S');
		let e = l.indexOf('E');
		if(s >= 0){
			start = {l:i,c:s};
			map[i][s]='.';
		}
		if(e >= 0){
			end = {l:i,c:e};
			map[i][e]='.';
		}
	}
	
	// annotate positions in map
	let pos = {l:start.l, c:start.c};
	let ctr = 1;
	while(true){
		map[pos.l][pos.c]=ctr;
		if(pos.l == end.l && pos.c == end.c) break;
		if     (map[pos.l]  [pos.c-1]=='.'){pos.c--}
		else if(map[pos.l]  [pos.c+1]=='.'){pos.c++}
		else if(map[pos.l-1][pos.c]  =='.'){pos.l--}
		else if(map[pos.l+1][pos.c]  =='.'){pos.l++}
		else return;
		ctr++;
	}
	
	let res = 0; // number of cheats up to maxradius which save at least 'threshold'
	// Use each track point as potential start of cheat
	for(let l1 = 1; l1 < map.length-1; l1++){
		for(let c1 = 1; c1 < map[l1].length-1; c1++){
			let src = getCoordData(map, l1, c1);
			if(src=='#') continue;
			// try for each possible cheat...
			for(let radius = 2; radius <= maxradius; radius++){ // of any possible length
				for(let sh = 0; sh <= radius; sh++){ // with every possible amount of horizontal steps
					let sv = (radius - sh); // and the corresponding amount of vertical steps
					let deltas = [[sv,sh],[sv,(0-sh)],[(0-sv),sh],[(0-sv),(0-sh)]]; // in any direction
					for(let j = 0; j < 4; j++){
						if((sv==0 && j>1) || (sh==0 && j%2)) continue; // zero steps in one dimension don't count twice
						let l2 = l1+deltas[j][0];
						let c2 = c1+deltas[j][1];
						let trg = getCoordData(map, l2, c2);
						if(trg=='#' || trg < src) continue; // we won't consider cheats leading into a wall or backwards on the track
						if((trg-src-radius) >= threshold) res++; // compare saved amount to threshols
					}
				}
			}
		}
	}
	console.log("Result = "+res);
}

// examples:
// node day20.js day20_example.txt 2 60
// node day20.js day20_input.txt 2 100
// node day20.js day20_input.txt 20 100
if(process.argv.length > 4) Advent_Main(process.argv[2], process.argv[3], process.argv[4]);
else console.log(1, "Specify filename, cheat duration and minimum saving");
