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

function prune(n){
	return n%16777216n;
}

function mix(n1, n2){
	return n1 ^ n2;
}

function hash(num){
	num = prune(mix(num, 64n*num));
	num = prune(mix(num, num/32n));
	num = prune(mix(num, 2048n*num));
	return num;
}

function evalEarn(prices, needle, bestearn){
	let needle_str = JSON.stringify(needle);
	let earn = 0;
	let diffs=[-10,-10,-10,-10];
	for(let b = 0; b < prices.length; b++){
		for(let p = 0; p < prices[b].length; p++){
			diffs[0]=diffs[1];
			diffs[1]=diffs[2];
			diffs[2]=diffs[3];
			diffs[3]=(p>0?prices[b][p]-prices[b][p-1]:100);
			
			if(JSON.stringify(diffs)==needle_str){
				earn += prices[b][p];
				break;
			}
		}
//		if(b>100){ // performance tweak: for large quantities of buyers drop sequences with bad initial performance
//			let progress = (b/prices.length);
//			let expected = progress*bestearn;
//			let earnfrac = earn/expected;
//			if(progress > 0.1 && earnfrac < 0.5) return 0;
//		}
	}
	return earn;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	
	// assemble code list
	let codes=[];
	for(let i = 0; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<1) continue;
		codes.push(Number(l));
	}
	
	// calculate first 2000 prices for each bidder
	let prices_all=[];
	let res_a = 0n;
	for(let i = 0; i < codes.length; i++){
		let prices=[];
		let n = BigInt(codes[i]);
		prices.push(Number(n%10n));
		for(let j = 0; j < 2000; j++){
			n = hash(n);
			prices.push(Number(n%10n));
		}
		res_a += n;
		prices_all.push(prices);
	}
	console.log("Result A: "+res_a);
	
	// Check combinations of consecutive changes
	let testvals = [0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6,7,-7,8,-8,9,-9]; // Sequences with values around 0 should be tested first (since ideal sequence would be all-9)
	let seqs = []; // list of change sequences to test
	for(let i = 0; i < testvals.length; i++){
		let d1 = testvals[i];
		for(let j = 0; j < testvals.length; j++){
			let d2 = testvals[j];
			for(let k = 0; k < testvals.length; k++){
				let d3 = testvals[k];
				for(let l = 0; l < testvals.length; l++){
					let d4 = testvals[l];
					// sort out impossible sequences
					if(((d1+d2)<(-9) || (d1+d2)>9)) continue;
					if(((d1+d2+d3)<(-9) || (d1+d2+d3+d4)>9)) continue;
					if(((d1+d2+d3+d4)<(-9) || (d1+d2+d3+d4)>9)) continue;
					// sort out unlikely sequences (too speed this up)
//					if(((d1+d2)<(-3) || (d1+d2)>3)) continue;
//					if(((d1+d2+d3)<(-3) || (d1+d2+d3+d4)>3)) continue;
//					if(((d1+d2+d3+d4)<(-3) || (d1+d2+d3+d4)>3)) continue;
					seqs.push([d1,d2,d3,d4]);
				}
			}
		}
	}
	
	// Test sequences and determine best earning
	let best_earn = 0;
	let best_needle = "n/a";
	for(let i = 0; i < seqs.length; i++){
		if(1 > 0) process.stdout.write("State: "+i+"/"+seqs.length+" sequences...\r");
		let needle=seqs[i];
		let earn = evalEarn(prices_all, needle, best_earn);
		if(earn > best_earn){
			console.log("Possible result B: Getting "+earn+" bananas with sequence "+needle);
			best_earn=earn;
			best_needle = needle;
		}
	}
	console.log("Finished scan. Best earn is: "+best_earn);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
