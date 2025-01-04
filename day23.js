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

function getLabel(nodes){
	let sorted = nodes.sort();
	let res = "";
	for(let i = 0; i < nodes.length; i++) res += (nodes[i]+(i<nodes.length-1?"_":""));
	return res;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	
	// assemble lists of nodes and connections
	let conns = {};
	let nodes = {};
	for(let i = 0; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<1) continue;
		let conn = l.split('-');
 		if(!nodes.hasOwnProperty(conn[0])) nodes[conn[0]]={links:[]};
		if(!nodes.hasOwnProperty(conn[1])) nodes[conn[1]]={links:[]};
		nodes[conn[0]].links.push(conn[1]);
		nodes[conn[1]].links.push(conn[0]);
		conns[getLabel([conn[0], conn[1]])]={n1: conn[0], n2: conn[1]};
	}

	// A) Find and count groups of 3 interconnected PCs one of which starts with "t"
	let t_triangles = [];
	for(const [elbl, eobj] of Object.entries(conns)){	
		for(const [nlbl, nobj] of Object.entries(nodes)){
			if(nobj.links.includes(eobj.n1) && nobj.links.includes(eobj.n2)){
				if(eobj.n1.startsWith("t") || eobj.n2.startsWith("t") || nlbl.startsWith("t")){
					let tlbl = getLabel([eobj.n1, eobj.n2, nlbl]);
					if(!t_triangles.includes(tlbl)) t_triangles.push(tlbl);
				}
			}
		}
	}
	console.log("Result A: "+t_triangles.length);
	
	// B) Find largest group of interconnected PCs
	let maxgroup = []; // Largest group
	for(const [nlbl, nobj] of Object.entries(nodes)){
		let candlist = JSON.parse(JSON.stringify(nobj.links)); // in the best case, a node with all of its links form the entire group
		candlist.push(nlbl);
		for(let i = 0; i < candlist.length; i++){ // scan each candidate, verify group membership and invalidate violating nodes.
			let nblbl = candlist[i];
			if(!nblbl) continue; // node has already been invalidated
			let nb = nodes[nblbl];
			for(let j = 0; j < candlist.length; j++){
				let testlbl = candlist[j];
				if(testlbl && testlbl != nblbl && !nb.links.includes(testlbl)) candlist[j]=""; // invalidate candidate
			}
		}
		// assemble sorted list of remaining candiates and store largest one
		let crntgrp = [];
		for(let i = 0; i < candlist.length; i++){
			if(candlist[i]) crntgrp.push(candlist[i]);
		}
		if(crntgrp.length > maxgroup.length) maxgroup = crntgrp.sort();
	}
	console.log("Result B: "+maxgroup);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
