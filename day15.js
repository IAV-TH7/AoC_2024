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

// Checks if and which object (wall or box) is located at a warehouse's specific coordinate
function getObjAt(whouse, coord){
	for(let i = 0; i < whouse.objs.length; i++){
		let o = whouse.objs[i];
		if(o.t=="box" && o.c.l == coord.l && o.c.c == coord.c) return i;
		if(o.t=="box" && o.hasOwnProperty('c2') && o.c2.l == coord.l && o.c2.c == coord.c) return i; // check second coordinate for long boxes
		if(o.t=="wall" && o.c.l == coord.l && o.c.c == coord.c) return i;
	}
	return -1;
}

// Debugging function, prints the current state of a given warehouse
function printMap(whouse, robot){
	let map = []; // build map
	for(let i = 0; i < whouse.dim.l; i++) map.push(new Array(whouse.dim.c).fill('.'));

	for(let i = 0; i < whouse.objs.length; i++){ // boxes and walls
		let o = whouse.objs[i];
		if(o.t=="box"){
			if(o.hasOwnProperty('c2')){
				map[o.c.l][o.c.c]='[';
				map[o.c2.l][o.c2.c]=']';
			}
			else map[o.c.l][o.c.c]='O';
		}
		else if(o.t=="wall") map[o.c.l][o.c.c]='#';
	}

	map[robot.l][robot.c]="X";

	for(let i = 0; i < map.length; i++){
		console.log(map[i].join(""));
	}
}

// Calculates the box coordinate checksum of a given warehouse
function calcChecksum(whouse){
	let result = 0;
	for(let i = 0; i < whouse.objs.length; i++){
		let o = whouse.objs[i];
		if(o.t!="box") continue;
		result += (100*o.c.l)+o.c.c;
	}
	return result;
}

// Recursively determine all boxes affected by moving the given box in the given direction. Also finds if any of these boxes is blocked in this direction...
function getBoxNeighbors(whouse, oid, move, nlist){
	if(nlist.stuck) return;
	if(nlist.objs.hasOwnProperty(oid)) return; // this box is already covered
	nlist.objs[oid]=true;
	let o = whouse.objs[oid];
	let nid1 = undefined;
	let nid2 = undefined;
	if     (move=="<") nid1 = getObjAt(whouse, {l:o.c.l, c:o.c.c-1});
	else if(move==">"){
		if(o.hasOwnProperty('c2')) nid1 = getObjAt(whouse, {l:o.c2.l, c:o.c2.c+1});
		else                       nid1 = getObjAt(whouse, {l:o.c.l, c:o.c.c+1});
	}
	else if(move=="^"){
		               nid1 = getObjAt(whouse, {l:o.c.l-1, c:o.c.c});
	             	   if(o.hasOwnProperty('c2')) nid2 = getObjAt(whouse, {l:o.c2.l-1, c:o.c2.c});
	}
	else if(move=="v"){
		               nid1 = getObjAt(whouse, {l:o.c.l+1, c:o.c.c});
		               if(o.hasOwnProperty('c2')) nid2 = getObjAt(whouse, {l:o.c2.l+1, c:o.c2.c});
	}
	if(nid1>=0){
		if(whouse.objs[nid1].t=='wall') nlist.stuck=true;
		else getBoxNeighbors(whouse, nid1, move, nlist);
	}
    if(nid2>=0){
		if(whouse.objs[nid2].t=='wall') nlist.stuck=true;
		else getBoxNeighbors(whouse, nid2, move, nlist);
	}
}

// Try to move the bot 1 step, possibly pushing any boxes
function tryBotMove(whouse, robot, move){
	let dirs={
		'^':{l:-1,c:0},
		'>':{l:0,c:1},
		'v':{l:1,c:0},
		'<':{l:0,c:-1}
	};
	let coord_next = {l:(robot.l+dirs[move].l), c:(robot.c+dirs[move].c)}; // coordinate the robot would step to

	// Handle any objects in direction of movement
	let oid = getObjAt(whouse, coord_next);
	if(oid >= 0){
		// Abort bot moving trial, if it would step into a wall directly 
		if(whouse.objs[oid].t=='wall') return;

		// Box in target position, get list of all affected boxes and check if any of them is blocked
		let nlist = {stuck:false, objs:{}};
		getBoxNeighbors(whouse, oid, move, nlist);
		if(nlist.stuck) return; // Abort bot moving trial, if any box is blocked by a wall
		
		// We're not stuck, so let's move all affected boxes in target direction
		for(const [oid, val] of Object.entries(nlist.objs)){
			let o = whouse.objs[oid];
			o.c.l += dirs[move].l;
			o.c.c += dirs[move].c;
			if(o.hasOwnProperty('c2')) o.c2.l += dirs[move].l;
			if(o.hasOwnProperty('c2')) o.c2.c += dirs[move].c;
		}
	}

	// Finally, also move the robot
	robot.l=coord_next.l;
	robot.c=coord_next.c;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');

	// Parse warehouses A+B and locate both robots
	let whouse_a={
		dim:undefined, // width and height
		objs:[] // locations of boxes and walls
	}
	let whouse_b={
		dim:undefined, // width and height
		objs:[] // locations of boxes and walls
	}
	let robot_a=undefined;
	let robot_b=undefined;
	let i = 0	
	for(; i < lines.length; i++){
		let l = lines[i].trim().split('')
		if(l.length<3){
			whouse_a.dim.l=whouse_b.dim.l=i;
			break; // after first blank line continue to movements
		}
		if(!whouse_a.dim) whouse_a.dim={l:undefined, c:l.length};
		if(!whouse_b.dim) whouse_b.dim={l:undefined, c:2*l.length};
		for(let j = 0; j < l.length; j++){
			if(l[j]=='#'){
				whouse_a.objs.push({t:"wall",c:{l:i,c:j}});
				whouse_b.objs.push({t:"wall",c:{l:i,c:(2*j)}});
				whouse_b.objs.push({t:"wall",c:{l:i,c:(2*j)+1}});
			}
			else if(l[j]=='O'){
				whouse_a.objs.push({t:"box",c:{l:i,c:j}});
				whouse_b.objs.push({t:"box",c:{l:i,c:(2*j)},c2:{l:i,c:(2*j)+1}});
			}
			else if(l[j]=='@'){
				robot_a={l:i,c:j};
				robot_b={l:i,c:(2*j)};
			}
		}
	}
	
	// Parse movements
	let moves=[];
	for(; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		moves = moves.concat(lines[i].trim().split(''));
	}
	console.log("Parsed warehouse A with "+whouse_a.dim.l+"x"+whouse_a.dim.c+" spots, warehouse B with "+whouse_b.dim.l+"x"+whouse_b.dim.c+" spots, and "+moves.length+" movement tries the robot will make...");

	// Iterate robot movement
	for(i = 0; i < moves.length; i++){
		tryBotMove(whouse_a, robot_a, moves[i]);
		tryBotMove(whouse_b, robot_b, moves[i]);
	}
	
	// Calculate checksums
	console.log("A) Checksum is "+calcChecksum(whouse_a));
	console.log("B) Checksum is "+calcChecksum(whouse_b));
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
