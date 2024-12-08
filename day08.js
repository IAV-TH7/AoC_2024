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

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n')

	// assemble map
	let map=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		map.push(lines[i].trim().split(''));
	}

	// assemble list of antennas
	let ants = {};
	for(let i = 0; i < map.length; i++){
		for(let j = 0; j < map[i].length; j++){
			let a = map[i][j];
			if(a=='.') continue;
			if(!ants.hasOwnProperty(a)) ants[a]=[];
			ants[a].push({l:i,c:j});
		}
	}
	// assemble lists of antinode locations:
	ancodes_a=[];
	ancodes_b=[];
	for(const [type, coords] of Object.entries(ants)) { // Check each antenna (frequency) type
		for(let i = 0; i < coords.length; i++){ // Check each pair of...
			for(let j = i+1; j < coords.length; j++){ // ... antenna coordinates
				let dif={l:coords[j].l-coords[i].l,c:coords[j].c-coords[i].c}; // determine delta between current two antennas

				let c = {l:coords[i].l, c:coords[i].c}; // Iterate in first direction until end of map
				for(let k = 0; isCoordValid(map,c); k++){
					let ancode = (100000*c.l)+c.c;
					if(k==1 && !ancodes_a.includes(ancode)) ancodes_a.push(ancode);
					if(!ancodes_b.includes(ancode)) ancodes_b.push(ancode);
					c.l-=dif.l;
					c.c-=dif.c;
				}

				c = {l:coords[j].l, c:coords[j].c}; // Iterate in second direction until end of map
				for(let k = 0; isCoordValid(map,c); k++){
					let ancode = (100000*c.l)+c.c;
					if(k==1 && !ancodes_a.includes(ancode)) ancodes_a.push(ancode);
					if(!ancodes_b.includes(ancode)) ancodes_b.push(ancode);
					c.l+=dif.l;
					c.c+=dif.c;
				}
			}
		}
	}
	console.log("Part A: Number of antinode locations is "+ancodes_a.length+".");
	console.log("Part B: Number of antinode locations is "+ancodes_b.length+".");
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
