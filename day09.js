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

function getChecksum(disk){
	let chk = 0;
	for(let i = 0; i < disk.length; i++){
		if(disk[i]<0) continue;
		chk += (i*disk[i]);
	}
	return chk;
}

function Advent_Main(filename){
	let file = ReadFile("./"+filename, { encoding: 'utf8', flag: 'r' }, true);
	let line = file.trim();

	// Determine total disk capacity
	let sz = 0;
	for(let i = 0; i < line.length; i+=2){
		sz += Number(line[i]);
		if((i+1) < line.length) sz += Number(line[i+1]);
	}
	
	// Create and fill disk array
	let disk = new Array(sz).fill(-1);
	let file_id = 0;
	let file_rest = Number(line[0]);
	for(let i = 0; i < disk.length; i++){
		if(file_rest<1){
			i += Number(line[(2*file_id)+1]); // skip free space
			file_id++;
			file_rest=Number(line[2*file_id]);
		}
		if(file_rest>0){
			disk[i]=file_id;
			file_rest--;
		}
		else console.log("Error");
	}

	
	let disk_a = disk;
	let disk_b = JSON.parse(JSON.stringify(disk)); // independent copy of disk for part B
	
	// A) Run defragmentation with algorithm A
	for(let i = 0; i < disk_a.length; i++){
		if(disk_a[i]>=0) continue;
		for(let j = disk_a.length-1; j > i; j--){
			if(disk_a[j]>=0){
				disk_a[i]=disk_a[j];
				disk_a[j]=-1;
				break;
			}
		}
	}
	
	// B) Run defragmentation with algorithm B
	for(let i = disk_b.length-1; i > 0; i--){
		
		// Find last file and determine its length
		let file_id = disk_b[i];
		if(file_id<0) continue;
		let file_pos = i;
		while(disk_b[file_pos-1]==file_id) file_pos--;
		let file_len = (i-file_pos)+1;
		
		// Find free space of required size
		for(let gap_pos = 0; gap_pos < file_pos; gap_pos++){
			if(disk_b[gap_pos]>=0) continue;
			let gap_end = gap_pos;
			while(disk_b[gap_end+1]<0) gap_end++;
			let gap_len = (gap_end-gap_pos)+1;
			if(gap_len < file_len) continue;
			for(let j = 0; j < file_len; j++){
				disk_b[gap_pos+j]=file_id;
				disk_b[file_pos+j]=-1;
			}
			break;
		}
		
		i=file_pos;
	}

	console.log("Defragmentation algorithm A) leads to checksum: "+getChecksum(disk_a));
	console.log("Defragmentation algorithm B) leads to checksum: "+getChecksum(disk_b));
}

if(process.argv.length > 2) Advent_Main(process.argv[2]);
else console.log(1, "Filename missing");
