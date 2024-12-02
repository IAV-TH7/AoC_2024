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

function checkReport(r){
	let x_inc = false;
	let x_dec = false;
	for(let j = 1; j < r.length; j++){
		let d = r[j]-r[j-1];
		if(d==0) return false;
		else if(d>0){
			x_inc = true;
			if(d > 3 || x_dec) return false;
		}
		if(d<0){
			x_dec = true;
			if(d < -3 || x_inc) return false;
		}
	}
	return true;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n')

	// assemble list of reports
	let reports=[];
	for(let i = 0; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		reports.push(lines[i].trim().split(' '));
	}

	// determine safe reports
	let safe_immediate = 0; // (immediately) safe reports
	let safe_additional = 0; // additional reports tolerable as safe
	for(let i = 0; i < reports.length; i++){
		// task A): determine immediately safe reports
		if(checkReport(reports[i])) safe_immediate++;
		// task B): determine tolerated safe reports
		else{
			let found = false;
			for(let j = 0; j < reports[i].length && !found; j++){
				let rtmp = reports[i].slice(0,j).concat(reports[i].slice(j+1));
				if(checkReport(rtmp)) found = true;
			}
			if(found) safe_additional++;
		}
	}
	console.log("Result A: Number of completely safe reports is "+safe_immediate);
	console.log("Result B: Number of reports tolerated as safe is "+(safe_immediate+safe_additional));
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
