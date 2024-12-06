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

function StringArrToNumArr(sa){
	let na = [];
	for(let i = 0; i < sa.length; i++){
		na.push(Number(sa[i]));
	}
	return na;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n')

	// Parse rules and updates to arrays
	let rules=[];
	let updates=[];
	let i = 0
	for(; i < lines.length; i++){
		if(lines[i].length<3) break; // end of first section
		let tmp = lines[i].trim().split('|')
		if(tmp.length == 2) rules.push(StringArrToNumArr(tmp));
		else{
			console.log("unexpected format");
			return;
		}
	}
	for(; i < lines.length; i++){
		if(lines[i].length<3) continue; // ignore (near-)empty lines etc.
		let tmp = lines[i].trim().split(',')
		updates.push(StringArrToNumArr(tmp));
	}
	

	// Check updates
	let midsum_ok = 0;
	let midsum_nok = 0;
	for(i = 0; i < updates.length; i++){ // Check each update
		let upd = updates[i];
		let upd_ok = true;
		for(j = 0; j < upd.length && upd_ok; j++){ // Check each position in update
			for(let k = 0; k < rules.length && upd_ok; k++){ // Check each applicable rule for violation
				if(rules[k][0]!=upd[j]) continue; // rule not applicable
				let before = upd.slice(0,j); // check page segment before current position
				if(before.includes(rules[k][1])) upd_ok = false;
			}
		}
		// determine middle pages of valid (A) and resorted (B) updates
		if(upd_ok) midsum_ok+=upd[Math.floor(upd.length/2)]
		else{
			let reordered = upd.sort(function(a, b) {
				for(let k = 0; k < rules.length; k++){
					if(rules[k][0]==a && rules[k][1]==b) return -1;
					if(rules[k][0]==b && rules[k][1]==a) return 1;
				}
				return 0;
			});
			midsum_nok+=reordered[Math.floor(reordered.length/2)]
		}
	}
	
	// Print sums of middle pages
	console.log("Result A: "+midsum_ok);
	console.log("Result B: "+midsum_nok);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
