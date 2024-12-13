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

function processPlot(map, plot, stats){
	map[plot.l][plot.c] = '*'; // mark current plot as processing
	stats.plots.push(plot);
	// iterate all neighbor coordinates
	let nbcoords = [{l:plot.l-1, c:plot.c}, {l:plot.l, c:plot.c+1}, {l:plot.l+1, c:plot.c}, {l:plot.l, c:plot.c-1}];
	for(let k = 0; k < nbcoords.length; k++){
		if(!isCoordValid(map, nbcoords[k])){ // map border
			stats.fences.push([plot,nbcoords[k]]);
			continue;
		}
		let nbpl = map[nbcoords[k].l][nbcoords[k].c];
		if(nbpl=='*') continue; // this plot of current area has already been processed
		if(nbpl!=stats.plant){ // plot of a different area
			stats.fences.push([plot,nbcoords[k]]);
			continue;
		}
		else processPlot(map, nbcoords[k], stats); // another plot of same area
	}
}

function clearFinishedArea(map){
	for(let i = 0; i < map.length; i++){
		for(let j = 0; j < map[i].length; j++){
			if(map[i][j]=='*')map[i][j]='.';
		}
	}
}

function areBordersInLine(f1, f2){
	let shifts = [[-1, 0],[0, 1],[1, 0],[0, -1]];
	for(let i = 0; i < shifts.length; i++){
		let s = shifts[i];
		if(((f1[0].l+s[0]) == f2[0].l) &&
		   ((f1[1].l+s[0]) == f2[1].l) &&
		   ((f1[0].c+s[1]) == f2[0].c) &&
		   ((f1[1].c+s[1]) == f2[1].c)) return true;
	}
	return false;
}

function reducibleSegments(fences){
	let inline = 0; // total number of reducible fence segments
	for(let i = 0; i < fences.length; i++){
		for(let j = i+1; j < fences.length; j++){
			if(areBordersInLine(fences[i], fences[j])) inline++;
		}
	}
	return inline;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');

	// assemble topographic map
	let map=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		map.push(lines[i].trim().split(''));
	}
	
	// iterate all plots
	let result_a = 0;
	let result_b = 0;
	for(let i = 0; i < map.length; i++){
		for(let j = 0; j < map[i].length; j++){
			if(map[i][j]=='.') continue; // this plot belongs to previously processed area
			let stats={plant:map[i][j], plots:[], fences:[]};
			processPlot(map, {l:i,c:j}, stats);
			result_a += (stats.plots.length*stats.fences.length);
			result_b += (stats.plots.length*(stats.fences.length-reducibleSegments(stats.fences)));
			clearFinishedArea(map); // set current area to '.'
		}
	}
	console.log("A: Total fence price is "+result_a+".");
	console.log("B: Reduced fence price is "+result_b+".");
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
