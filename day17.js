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

function getCombo(vm, op){
	if(op < 4) return op;
	if(op == 4) return vm.a;
	if(op == 5) return vm.b;
	if(op == 6) return vm.c;
	return undefined;
}

function exec(vm){
	if(vm.ip >= vm.p.length) return false; // end of program reached
	let ins = vm.p[vm.ip];
	let opd = vm.p[vm.ip+1];
	
	switch(ins){
		case 0:{ // ADV
			let z = vm.a;
			let n = 2 ** getCombo(vm, opd);
			vm.a = Math.floor(z/n);
			break;
		}
		case 1: // BXL
			vm.b ^= opd;
			break;
		case 2: // BST
			vm.b = (getCombo(vm, opd)&7);
			break;
		case 3: // JNZ
			if(vm.a) vm.ip = opd-2;
			break;
		case 4: // BXC
			vm.b ^= vm.c;
			break;
		case 5: // OUT
			vm.o.push(getCombo(vm, opd)&7);
			break;
		case 6:{ // BDV
			let z = vm.a;
			let n = 2 ** getCombo(vm, opd);
			vm.b = Math.floor(z/n);
			break;
		}
		case 7:{ // CDV
			let z = vm.a;
			let n = 2 ** getCombo(vm, opd);
			vm.c = Math.floor(z/n);
			break;
		}
		default:
			console.log("Error: invalid instruction!");
			break;
	}
	vm.ip += 2;
	return true;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	
	// prepare our virtual machine
	let vm={
		a: undefined,
		b: undefined,
		c: undefined,
		p: [],
		ip: 0,
		o: []
	}

	// parse input file
	for(let i=0; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<3){
			continue;
		}
		if(l.includes("Register A: ")) vm.a=Number(l.split(": ")[1]);
		else if(l.includes("Register B: ")) vm.b=Number(l.split(": ")[1]);
		else if(l.includes("Register C: ")) vm.c=Number(l.split(": ")[1]);
		else if(l.includes("Program: ")){
			let pr = l.split(": ")[1].split(',');
			for(let j = 0; j < pr.length; j++) vm.p.push(Number(pr[j]));
		}
	}
	
	// A)
	let vm_a = JSON.parse(JSON.stringify(vm));
	while(true){
		if(!exec(vm_a)) break;
	}
	console.log("Result A: Program output is '"+vm_a.o+"'");
	
	// B)
	for(let a = 0;; a++){
		let vm_b = JSON.parse(JSON.stringify(vm));
		vm_b.a=a;
		while(true){
			if(!exec(vm_b)) break;
		}
		if(JSON.stringify(vm_b.o)==JSON.stringify(vm_b.p)){
			console.log("Result B: Correct value of register A would be '"+a+"'");		
			break;
		}
	}
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
