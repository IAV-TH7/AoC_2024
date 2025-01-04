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

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	
	// parse lock and key sequences from input file
	let locks=[];
	let keys=[];
	for(let i = 0; i < lines.length; i++){
		let l1 = lines[i].trim();
		let seq = [0,0,0,0,0];
		let is_lock=false;
		if(l1=='#####') is_lock = true; // first line of each block only determines key/lock type
		else if (l1 != '.....') return;
		for(i++; i < lines.length; i++){ // add up all # chars in next lines' columns
			let ln = lines[i].trim().split('');
			if(ln.length < 3) break;
			for(let j=0; j < (Math.min(5, ln.length)); j++) if(ln[j]=='#') seq[j]++;
		}
		if(is_lock) locks.push(seq);
		else{
			for(let j = 0; j < seq.length; j++) seq[j]--; // for keys, we have to ignore all # chars from last line
			keys.push(seq);
		}
	}
	
	// try all lock/key combinations
	let n_fit = 0;
	for(let k = 0; k < keys.length; k++){
		for(let l = 0; l < locks.length; l++){
			let overlap = false;
			for(let i = 0; !overlap && i < Math.min(keys[k].length, locks[l].length); i++){
				if(keys[k][i]+locks[l][i] > 5) overlap=true;
			}
			if(!overlap) n_fit++;
		}
	}
	console.log("Result: "+n_fit+" lock-key pairs fit");
	
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
