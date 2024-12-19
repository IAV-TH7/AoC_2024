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

function getSegmentSteps(c1, c2){
	if(c1.l==c2.l) return Math.abs(c1.c-c2.c);
	else return Math.abs(c1.l-c2.l);
}

function getLbl(coord, dir){
	return "L"+coord.l+"C"+coord.c+"D"+dir;
}

function getFloorType(map, coord, dir){
	let dirs=[{l:-1,c:0},{l:0,c:1},{l:1,c:0},{l:0,c:-1}]; // up, right, down, left
	
	c_rhand = {l:(coord.l+dirs[(dir+1)%4].l), c:(coord.c+dirs[(dir+1)%4].c)};
	c_lhand = {l:(coord.l+dirs[(dir+3)%4].l), c:(coord.c+dirs[(dir+3)%4].c)};
	c_forwd = {l:(coord.l+dirs[dir].l), c:(coord.c+dirs[dir].c)};

	if(map[c_forwd.l][c_forwd.c]!='.' && map[c_lhand.l][c_lhand.c]!='.' && map[c_rhand.l][c_rhand.c]!='.') return "E"; // dead end
	if(map[c_forwd.l][c_forwd.c]=='.' && map[c_lhand.l][c_lhand.c]!='.' && map[c_rhand.l][c_rhand.c]!='.') return "S"; // straight
	if(map[c_lhand.l][c_lhand.c]=='.' || map[c_rhand.l][c_rhand.c]!='.') return "C"; // corner
}

function addSegments(map, coord_crnt, segs){
	let dirs=[{l:-1,c:0},{l:0,c:1},{l:1,c:0},{l:0,c:-1}];
	for(let dir = 0; dir < 4; dir++){
		if(segs.hasOwnProperty(getLbl(coord_crnt, dir))) continue; // this segment is already covered
		let coord_next = {l:(coord_crnt.l+dirs[dir].l), c:(coord_crnt.c+dirs[dir].c)};
		if(map[coord_next.l][coord_next.c]!='.') continue; // wall
		let ct = undefined;
		while(true){
			ct = getFloorType(map, coord_next, dir)
			if(ct!='S') break;
			coord_next.l += dirs[dir].l;
			coord_next.c += dirs[dir].c;
		}
		// we will end up here with ct = "E" (end) or "C" (corner)
		let lbl_forth = getLbl(coord_crnt, dir);
		let lbl_back = getLbl(coord_next, ((dir+2)%4));
		if(!segs.hasOwnProperty(lbl_forth)) segs[lbl_forth]={src:coord_crnt, trg:coord_next, dir:dir};
		if(!segs.hasOwnProperty(lbl_back)) segs[lbl_back]={src:coord_next, trg:coord_crnt, dir:((dir+2)%4)};
		if(ct!="E") addSegments(map,coord_next,segs, dir); // at corners repeat recursively
	}
}

function runAstar(csdat, start, end){
	let res={
		found:false,
		totweight:0,
		pathlbls:[],
		pathlen:0
	};
	
	var cy = cytoscape({
		elements: csdat
	});

	var dfs = cy.elements().aStar({
		root: start,
		goal: cy.collection().merge(end[0]).merge(end[1]).merge(end[2]).merge(end[3]),
		directed: true,
		weight: function(edge){
			return edge.data('weight');
		}
	});
	let weightsum = 0;
	if(dfs.found){
		res.found = true;
		for(let i = 0; i < dfs.path.length; i++){
			let crnt_id=dfs.path[i].id();
			if(crnt_id.includes('_')){
				res.totweight += dfs.path[i].data().weight;
				if(!crnt_id.includes('T')){
					res.pathlbls.push(crnt_id);
					res.pathlen+=dfs.path[i].data().weight;
				}
			}
		}	
	}
	return res;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');

	// Parse map and start/end coordinates
	let map = [];
	let coord_s=undefined;
	let coord_e=undefined;
	for(let i = 0; i < lines.length; i++){
		let l = lines[i].trim().split('')
		if(l.length<3) break;
		let idx = l.indexOf('S');
		if(idx >= 0){
			coord_s={l:i,c:idx};
			l[i,idx]='.';
		}
		idx = l.indexOf('E');
		if(idx >= 0){
			coord_e={l:i,c:idx};
			l[i,idx]='.';
		}
		map.push(l);
	}
	
	// Collect all segments
	let segs={};
	addSegments(map, coord_s, segs);
	
	// Use cytoscape to detect shortest path
	let csdat=[]; // prepare JSON object for cytoscape:
	for(const [id1, val] of Object.entries(segs)){
		let id2 = getLbl(val.trg, val.dir);
		csdat.push({data:{id:id1}});                                 // add start node
		csdat.push({data:{id:id2}});                                 // add end node
		csdat.push({data:{id:(id1+"_"+id2),source:id1,target:id2,weight:getSegmentSteps(val.src, val.trg)}}); // add directed edge
		let id2r = getLbl(val.trg, (val.dir+1)%4); // label of possible right-hand segment's start coordinate
		let id2l = getLbl(val.trg, (val.dir+3)%4); // label of possible left-hand segment's start coordinate
		if(segs.hasOwnProperty(id2r)) csdat.push({data:{id:(id2+"_TR"),source:id2,target:id2r,weight:1000}}); // does a segment start righthand side? Then add turn-edge...
		if(segs.hasOwnProperty(id2l)) csdat.push({data:{id:(id2+"_TL"),source:id2,target:id2l,weight:1000}}); // does a segment start lefthand side? Then add turn-edge...
	}
	csdat.push({data:{id:("L"+coord_s.l+"C"+coord_s.c+"D1")}}); // add node for initial position/orientation (might not be in array)
	csdat.push({data:{id:("L"+coord_s.l+"C"+coord_s.c+"D1_TL"),source:"L"+coord_s.l+"C"+coord_s.c+"D1",target:"L"+coord_s.l+"C"+coord_s.c+"D0",weight:1000}}); // Rule to turn north in starting position

	// Run A* algorithm in cytoscape
	let start = "#L"+coord_s.l+"C"+coord_s.c+"D1";
	let gbase = "#L"+coord_e.l+"C"+coord_e.c;
	let end = [gbase+"D0",gbase+"D1",gbase+"D2",gbase+"D3"];
	let asres = runAstar(csdat, start, end);
	if(asres.found) console.log("Shortest path has a weight of: "+asres.totweight);
	else console.log("No path found");
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
