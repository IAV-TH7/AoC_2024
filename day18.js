const fs = require('fs');
const cytoscape = require('cytoscape');

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

function runAstar(csdat, start, end){
	let res={
		found:false,
		pathlbls:[]
	};
	
	var cy = cytoscape({
		elements: csdat
	});

	var dfs = cy.elements().aStar({
		root: start,
		goal: end,
		directed: false
	});
	if(dfs.found){
		res.found = true;
		for(let i = 0; i < dfs.path.length; i++){
			let crnt_id=dfs.path[i].id();
			if(crnt_id.startsWith('E')){
				res.pathlbls.push(crnt_id);
			}
		}	
	}
	return res;
}

function isCoordFree(map, z, s){
	if(z<0 || z>=map.length) return false;
	if(s<0 || s>=map[z].length) return false;
	return (map[z][s]=='.');
}

function pathlenAtTimestamp(dim, coords, t){
	// Assemble map at timestamp
	let map = [];
	for(let i = 0; i < dim; i++) map.push(new Array(dim).fill('.'));
	for(let i = 0; i < Math.min(t, coords.length); i++){
		map[coords[i][1]][coords[i][0]]='X';
	}
	
	// Prepare relevant nodes and edges for Cytoscape
	let csdat=[];
	for(let i = 0; i < map.length; i++){ // add all (free) spots:
		for(let j = 0; j < map[i].length; j++){
			if(isCoordFree(map, i, j)) csdat.push({data:{id:('N'+i+'_'+j)}});
		}
	}
	for(let i = 0; i < map.length; i++){ // add all edges:
		for(let j = 0; j < map[i].length; j++){
			if(!isCoordFree(map, i, j)) continue;
			if(isCoordFree(map, i, j+1)) csdat.push({data:{id:('E'+i+'_'+j+'H'),source:('N'+i+'_'+j),target:('N'+i+'_'+(j+1))}});
			if(isCoordFree(map, i+1, j)) csdat.push({data:{id:('E'+i+'_'+j+'V'),source:('N'+i+'_'+j),target:('N'+(i+1)+'_'+j)}});
		}
	}

	// Run A* algorithm in cytoscape
	let start = "#N0_0";
	let end   = "#N"+(dim-1)+"_"+(dim-1);
	let asres = runAstar(csdat, start, end);
	return asres.pathlbls.length;
}

function Advent_Main(filename, dim, n_corr){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	
	// Parse input file
	let coords=[];
	for(let i = 0; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<3) continue; // ignore (near-)empty lines etc.
		let c = l.split(',');
		coords.push([c[0],c[1]]);
	}
	
	// A)
	let plen = pathlenAtTimestamp(dim, coords, n_corr);
	console.log("Result A: The length of the shortest path is "+plen);

	// B)
	for(let i = n_corr;;i++){
		process.stdout.write("Test byte fall "+(i+1)+"/"+coords.length+"...\r");
		let plen = pathlenAtTimestamp(dim, coords,i);
		if(!plen){
			console.log("Result B: All paths blocked after corruption at "+coords[i-1][0]+"/"+coords[i-1][1]);
			break;
		}
	}
}

// "node day18.js day18_example.txt 7 12" or "node day18.js day18_input.txt 71 1024"
if(process.argv.length > 4) Advent_Main(process.argv[2], Number(process.argv[3]), Number(process.argv[4]));
else console.log(1, "Filename, dimension and initial number of corruptions need to be specified");
