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

function printRoom(dim_l, dim_c, robots){
	let map = []; // build map
	for(let i = 0; i < dim_l; i++) map.push(new Array(dim_c).fill(' '));

	for(let i = 0; i < robots.length; i++){ // place robots
		let p = robots[i].p;
		map[p.l][p.c]='X';
	}
	
	let res = ""; // return map as string
	for(let i = 0; i < map.length; i++){
		res += (map[i].join("")+"\r\n");
	}
	return res;
}

function Advent_Main(filename, dim_l, dim_c, iter){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');

	// Parse robots
	let robots=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		let tmp = lines[i].substr(2).trim().split(' v=');
		let robot = {};
		let c = tmp[0].split(',');
		robot.p={c:Number(c[0]), l: Number(c[1])};
		c = tmp[1].split(',');
		robot.v={c:Number(c[0]), l: Number(c[1])};
		robots.push(robot);
	}
	
	// Iterate movements
	for(let i = 0; i < iter; i++){
		process.stdout.write("Iteration " + (i+1) + " of "+iter+"...\r");		
		if(i==100){ // A) After 100 iterations count robots per quadrant
			let half={l:Math.floor(dim_l/2), c:Math.floor(dim_c/2)};
			let quads = [0,0,0,0];
			for(let i = 0; i < robots.length; i++){
				let p = robots[i].p;
				if(p.l == half.l || p.c==half.c) continue; // ignore robots in the middle
				quads[2*((p.l<half.l)?1:0)+((p.c<half.c)?1:0)]++; // increment quadrant count
			}
			process.stdout.write("Result A: The safety factor after 100 seconds is "+(quads[0]*quads[1]*quads[2]*quads[3])+".\r");
			console.log("");
		}

		// move forward each robot
		for(let j = 0; j < robots.length; j++){
			robots[j].p.l = (robots[j].p.l+robots[j].v.l+dim_l)%dim_l;
			robots[j].p.c = (robots[j].p.c+robots[j].v.c+dim_c)%dim_c;
		}

		// B) Check for Christmas Tree
		let pic = printRoom(dim_l, dim_c,robots);
		if(pic.includes("XXXXXXXXXXXXXXXX")){ // guess: to form a christmas tree, a lot of robots will have to stand in a row
			process.stdout.write("Result B: Possible Christmas tree in iteration "+(i+1)+"\r");
			console.log("\r\n"+pic);
		}
		
	}
}

if(process.argv.length > 5) Advent_Main(process.argv[2], Number(process.argv[3]), Number(process.argv[4]), Number(process.argv[5]));
else{
	console.log(1, "Required parameters: filename, number of map lines, number of map columns, number of iterations to test");
	console.log(1, "Example: node day14.js day14_input.txt 103 101 10000");
}
