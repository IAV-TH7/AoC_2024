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

function BooleanIteration(vars){
	let left = 0;
	for(const [vlbl, vobj] of Object.entries(vars)){
		if(vobj.type=="fix") continue;
		if(vars[vobj.i1].type != "fix" || vars[vobj.i2].type != "fix"){
			left++;
			continue;
		}
		if     (vobj.type=="XOR") vobj.val=vars[vobj.i1].val ^ vars[vobj.i2].val;
		else if(vobj.type=="OR" ) vobj.val=vars[vobj.i1].val | vars[vobj.i2].val;
		else if(vobj.type=="AND") vobj.val=vars[vobj.i1].val & vars[vobj.i2].val;
		vobj.type="fix";
	}
	return left;
}

function getVar(vars, v){
	let val = 0n;
	for(let i = 0n; ;i++){
		let lbl=(i<10?v+"0":v)+i;
		if(!vars.hasOwnProperty(lbl)) break;
		val += (1n<<i)*BigInt(vars[lbl].val);
	}
	return val;
}

function RulesPrint(list){
	let lstr=[];
	for(const [vlbl, vobj] of Object.entries(list)){
		if(vobj.type == "fix") continue;
		lstr.push(vobj.i1+" "+vobj.type+" "+vobj.i2+" = "+vlbl);
	}
	lstr.sort();
	for(let i = 0; i < lstr.length; i++) console.log(lstr[i]);
}

function PrintRulesOrdered(vars){
	let list1={};
	let list2={};
	let list3={};
	for(const [vlbl, vobj] of Object.entries(vars)){
		if(vobj.type=="fix") continue;
		if(vobj.i1.startsWith("x") && vobj.i2.startsWith("y")) list1[vlbl]=vobj;
		else if(vlbl.startsWith("z")) list3[vlbl]=vobj;
		else list2[vlbl]=vobj;
	}
	console.log("List 1:");
	RulesPrint(list1);
	console.log("List 2:");
	RulesPrint(list2);
	console.log("List 3:");
	RulesPrint(list3);
}

function RenameKey(obj, kold, knew){
	if (kold !== knew) {
		Object.defineProperty(obj, knew, Object.getOwnPropertyDescriptor(obj, kold));
		delete obj[kold];
	}
}

function RenameAll(list, vold, vnew){
	// rename corresponding entry
	RenameKey(list, vold, vnew);
	// rename links in other entries
	for(const [vlbl, vobj] of Object.entries(list)){
		if(vobj.i1==vold){
			vobj.i1=vnew;
			if(vobj.i1 > vobj.i2){
				let tmp = vobj.i2;
				vobj.i2=vobj.i1;
				vobj.i1=tmp;
			}
		}
		if(vobj.i2==vold){
			vobj.i2=vnew;
			if(vobj.i1 > vobj.i2){
				let tmp = vobj.i2;
				vobj.i2=vobj.i1;
				vobj.i1=tmp;
			}
		}
	}
}

function runSystem(sys){
	for(let i = 1; ; i++){
		if(!BooleanIteration(sys)) break;
	}
	return getVar(sys,'z');
}

function ErrorScan(sys){
	for(const [lbl1a, obj1a] of Object.entries(sys)){
		// Search XOR rule on highest level (x01 XOR y01, x02 XOR y02...)
		if(obj1a.type=="XOR" && obj1a.i1.startsWith("x") && obj1a.i2.startsWith("y")){
			let bitpos = obj1a.i1.substr(1);
			// The result of this XOR rule must be parameter of an AND rule
			for(const [lbl2a, obj2a] of Object.entries(sys)){
				if(obj2a.type=="AND" && (obj2a.i1==lbl1a || obj2a.i2==lbl1a)){
					// The result of this END rule must parameter in the corresponding Z rule (XOR)
					let lbl3a = "z"+bitpos;
					let obj3a = sys[lbl3a];
					if(obj3a.type=="XOR" && (obj3a.i1==obj2a.i1 || obj3a.i2==obj2a.i1) && (obj3a.i1==obj2a.i2 || obj3a.i2==obj2a.i2)){
						obj1a.safe=true;
						obj2a.safe=true;
						obj3a.safe=true;
						// Node lbl2a must be parameter of an or operation...
						for(const [lbl2b, obj2b] of Object.entries(sys)){
							if(obj2b.type=="OR"){
								if(obj2b.i1==lbl2a || obj2b.i2==lbl2a){
									// where the other parameter is the corresponding high-level AND operation (x01 AND y01, x02 AND y02...)
									let lbl1b = (obj2b.i1==lbl2a ? obj2b.i2 : obj2b.i1);
									let obj1b = sys[lbl1b];
									if(obj1b.type=="AND" && (obj1b.i1==obj1a.i1 || obj1b.i1==obj1a.i2) && (obj1b.i2==obj1a.i1 || obj1b.i2==obj1a.i2)){
										obj1b.safe=true;
										// if lbl2b is parameter of z(n+1) also lbl2b (OR-operations on level 2) is safe
										let lbl3b = "z"+(bitpos < 9?"0":"")+(Number(bitpos)+1);
										let obj3b = sys[lbl3b];
										if(obj3b.type=="XOR" && (obj3b.i1==lbl2b || obj3b.i2==lbl2b)) obj2b.safe=true;
									}
								}
							}
						}
					}
				}	
			}
		}
	}
	// special cases:
	let z0 = sys["z00"];
	if(z0.type=="XOR" && ((z0.i1=="x00" && z0.i2=="y00") || (z0.i1="y00" || z0.i2=="x00"))) z0.safe=true;	
	
	for(const [lbl, obj] of Object.entries(sys)){
		if(obj.type=="AND" && ((obj.i1=="x00" && obj.i2=="y00") || (obj.i1="y00" || obj.i2=="x00")) && (sys["z01"].i1==lbl || sys["z01"].i2==lbl)) obj.safe=true;	
	}
	
	let unsafe = [];
	for(const [lbl, obj] of Object.entries(sys)){
		if(obj.type!='fix'&&!obj.safe) unsafe.push(lbl);
	}
	return unsafe;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let lines = file.split('\n');
	
	// parse input file into system of boolean variables/rules
	let sys={};
	let i = 0;
	for(; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<1) break;
		let tmp = l.split(': ');
		sys[tmp[0]]={type:"fix", val:Number(tmp[1])};
	}
	for(; i < lines.length; i++){
		let l = lines[i].trim();
		if(l.length<1) continue;
		let tmp = l.split(' ');
		if(tmp[0] < tmp[2]) sys[tmp[4]] = {type:tmp[1],i1:tmp[0],i2:tmp[2]};
		else                sys[tmp[4]] = {type:tmp[1],i1:tmp[2],i2:tmp[0]};
	}
	
	// A) calculate result
	let res_a = runSystem(JSON.parse(JSON.stringify(sys)));
	console.log("A) Result in register Z is: "+res_a);
	
	// B) Begin with automatic scan for error candidates
	let err_candidates = ErrorScan(JSON.parse(JSON.stringify(sys)));
	console.log("B) There are "+err_candidates.length+" candidates for faulty rules: "+err_candidates.sort());
	
	// C) Generate sorted system for manual analysis
	let sysclean = JSON.parse(JSON.stringify(sys));
	for(const [vlbl, vobj] of Object.entries(sys)){
		if(vobj.type=="AND" && vobj.i1.startsWith("x") && vobj.i2.startsWith("y") && !vlbl.startsWith('z')){
			RenameAll(sysclean, vlbl, vobj.i1.substr(1)+"B_"+vlbl);
		}
		else if(vobj.type=="XOR" && vobj.i1.startsWith("x") && vobj.i2.startsWith("y") && !vlbl.startsWith('z')){
			RenameAll(sysclean, vlbl, vobj.i1.substr(1)+"A_"+vlbl);
		}
	}
	console.log("Re-ordered ruleset for manual fault identification:");
	PrintRulesOrdered(sysclean);
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
