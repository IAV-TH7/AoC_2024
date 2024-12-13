const fs = require('fs');
const { init } = require('z3-solver');

function ReadFile(path, cod, print_err=true){
	let result = null;
	try {
		result = fs.readFileSync(path, cod);
	}
	catch(err) {
		if(print_err) console.error(err);
	}
	return result;
}

async function Advent_Main(filename, amin, amax){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n')
	
	// Parse all claw machines
	let cms = [];
	for(let i = 0; i < lines.length-2; i+=4){
		let l1 = lines[i].trim();
		let l2 = lines[i+1].trim();
		let l3 = lines[i+2].trim();
		if(l1.substr(0,12)!="Button A: X+") return;
		if(l2.substr(0,12)!="Button B: X+") return;
		if(l3.substr(0,9)!="Prize: X=") return;
		l1 = l1.substr(12);
		l2 = l2.substr(12);
		l3 = l3.substr(9);

		let cm={};

		let tmp = l1.split(', ');
		cm.ax=Number(tmp[0]);
		cm.ay=Number(tmp[1].substr(2));
		
		tmp = l2.split(', ');
		cm.bx=Number(tmp[0]);
		cm.by=Number(tmp[1].substr(2));
		
		tmp = l3.split(', ');
		cm.tx=Number(tmp[0]);
		cm.ty=Number(tmp[1].substr(2));
		
		cms.push(cm);
	}
	console.log("Registered "+cms.length+" claw machines...");
	
	// Solve equations

	const { Context } = await init();
	const { Solver, Int} = new Context('main');
	const solver = new Solver();
	
	// A)
	let result_a = 0;
	for(let i = 0; i < cms.length; i++){
		process.stdout.write("Processing rule " + (i+1) + " of "+cms.length+"...\r");		
		const a = Int.const('a');
		const b = Int.const('b');
		solver.add((a.mul(cms[i].ax)).add(b.mul(cms[i].bx)).eq(cms[i].tx));
		solver.add((a.mul(cms[i].ay)).add(b.mul(cms[i].by)).eq(cms[i].ty));
		if(await solver.check()=="sat"){
			const mdl = solver.model();
			let res_a=Number(mdl.get(a));
			let res_b=Number(mdl.get(b));
//			console.log("Equation "+(i+1)+": a="+res_a+", b="+res_b+".");
			result_a += ((3*res_a)+res_b);
		}
		solver.reset();
	}
	console.log("\r\nA): Result is "+result_a);
	
	// B)
	let result_b = 0;
	for(let i = 0; i < cms.length; i++){
		process.stdout.write("Processing rule " + (i+1) + " of "+cms.length+"...\r");		
		const a = Int.const('a');
		const b = Int.const('b');
		solver.add((a.mul(cms[i].ax)).add(b.mul(cms[i].bx)).eq(10000000000000+cms[i].tx));
		solver.add((a.mul(cms[i].ay)).add(b.mul(cms[i].by)).eq(10000000000000+cms[i].ty));
		if(await solver.check()=="sat"){
			const mdl = solver.model();
			let res_a=Number(mdl.get(a));
			let res_b=Number(mdl.get(b));
//			console.log("Equation "+(i+1)+": a="+res_a+", b="+res_b+".");
			result_b += ((3*res_a)+res_b);
		}
		solver.reset();
	}
	console.log("B): Result is "+result_b);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
