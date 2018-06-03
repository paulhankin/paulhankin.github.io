var computer = null;
var view = null;

var is_running = false;
var auto_run_callback = null;

function autoRun() {
	if (!is_running || !computer.running) {
		clickStop();
		return;
	}
	clickStep();
}

function clickExecute() {
	if (is_running) { return; }
	is_running = true;
	auto_run_callback = setInterval(autoRun, 10);
}

function clickStop() {
	is_running = false;
	clearInterval(auto_run_callback);
}

function newComputer() {
	var c = {
		memory: new Array(100),
		pc: 0,
		a: 0,
		inputLine: 0,
		flagN: false,
		running: false,
	};
	for (var i = 0; i < 100; i++) {
		c.memory[i] = 0;
	}
	return c;
};

function resetComputer(c) {
	c.pc = 0;
	c.a = 0;
	c.ins = 0;
	c.flagN = false;
	c.inputLine = 0;
	c.running = true;
	for (var i = 0; i < 100; i++) {
		c.memory[i] = 0;
	}
}

function newView() {
	var v = {
		memory: new Array(100),
		a: document.getElementById("regA"),
		pc: document.getElementById("regPC"),
		ins: document.getElementById("regIns"),
		flags: document.getElementById("flags"),
		input: document.getElementById("input"),
		output: document.getElementById("output"),
		out_clean: document.getElementById("output_clean"),
		program: document.getElementById("program"),
		share: document.getElementById("sharable_link"),
	};
	var memtbl = document.getElementById("memory");
	for (var i = 0; i < 100; i++) {
		v.memory[i] = memtbl.rows[i % 10].cells[Math.floor(i / 10)];
	}
	return v;
}

function fmt3(x) {
	return ("00" + x).slice(-3);
}

function memCell(idx) {
	return '<ul class="cell"><li>' + fmt3(idx) + '<li>---<li>---</ul>';
}

function initMemoryDom() {
	var memtbl = document.getElementById("memory");
	while (memtbl.rows.length > 0) {
		memtbl.deleteRow(0);
	}
	for (var i = 0; i < 10; i++) {
		var r = memtbl.insertRow(-1);
		for (var j = 0; j < 10; j++) {
			c = r.insertCell(-1);
			c.innerHTML = memCell(j*10 + i, 0);
		}
	}
}

function decompile(val) {
	if (val == 0) {
		return ["HLT"];
	}
	var ins = Math.floor(val / 100);
	var data = val % 100;
	switch (ins) {
	case 1:
		return ["ADD", data];
	case 2:
		return ["SUB", data];
	case 3:
		return ["STA", data];
	case 5:
		return ["LDA", data];
	case 6:
		return ["BRA", data];
	case 7:
		return ["BRZ", data];
	case 8:
		return ["BRP", data];
	case 9:
		switch (data) {
		case 1:
			return ["INP"];
		case 2:
			return ["OUT"];
		default:
			return ["???"];
		}
	default:
		return ["???"];
	}
}

function fmtCommand(cmd) {
	return cmd.join(" ");
}

function updateMemCell(mc, val, is_pc, is_target) {
	mc.className = is_pc ? "cell_pc" : "cell";
	if (is_target) {
		mc.className += " target";
	}
	mc.childNodes[0].childNodes[1].innerHTML = fmt3(val);
	mc.childNodes[0].childNodes[2].innerHTML = fmtCommand(decompile(val));
}

function updateView(v, c) {
	var cell_indexed = undefined;
	if (c.pc >= 0 && c.pc <= 99) {
		var cmd = decompile(c.memory[c.pc]);
		cell_indexed = cmd[1];
	}
	for (var i = 0; i < 100; i++) {
		updateMemCell(v.memory[i], c.memory[i], c.pc == i, cell_indexed == i);
	}
	v.pc.innerHTML = fmt3(c.pc);
	v.a.innerHTML = fmt3(c.a);
	v.ins.innerHTML = c.ins;
	v.flags.className = c.flagN ? "flag_set" : "flag_unset";
}

function clearConsole(con) {
	for (var i = 0; i < con.childNodes.length; i++) {
		con.childNodes[i].innerHTML = '';
	}
}

function writeConsole(con, line) {
	var t = document.createElement("li");
	t.innerHTML = line;
	con.removeChild(con.childNodes[0]);
	con.appendChild(t);
}

function cmd_args(w) {
	switch (w) {
	case 'ADD':
	case 'SUB':
	case 'STA':
	case 'LDA':
	case 'BRA':
	case 'BRZ':
	case 'BRP':
		return 1;
	case 'INP':
	case 'OUT':
	case 'HLT':
		return 0;
	case 'DAT':
		return 1;
	}
	return -1;
}

var label_pat = new RegExp("^[A-Za-z][a-zA-Z0-9_]*$");

function assemble1(line) {
	line = line.replace(/\/\/.*/, '').trim();
	words = line.split(/ +/);
	if (words.length == 0) return {};
	var cmd = {};
	var i = 0;
	if (cmd_args(words[0].toUpperCase()) == -1) {
		if (label_pat.test(words[0]) === undefined) {
			return {
				error: "bad label: " + words[0],
			};
		}
		cmd.label = words[0];
		i = 1;
	}
	if (i == words.length) {
		return cmd;
	}
	var c = words[i].toUpperCase();
	cmd.op = c;
	if (cmd_args(c) == -1) {
		return {
			error: "unknown command: " + words[i],
		};
	}
	if (i + cmd_args(c) + 1 < words.length) {
		return {
			error: c + ' has too many arguments: ' + words.slice(i+1).join(' '),
		};
	}
	if (c != 'DAT' && i + cmd_args(c) + 1 > words.length) {
		return {
			error: c + ' is missing an argument',
		};
	}
	if (c == 'DAT') {
		cmd.arg = 0;
	}
	if (cmd_args(c) && i + 1 < words.length) {
		cmd.arg = words[i+1];
	}
	return cmd;
}

function clickAssemble() {
	var con = view.output;
	var c = computer;
	resetComputer(c);
	view.out_clean.value = '';
	var errors = false;
	var program = view.program.value.split('\n');
	var asm = [];
	var labels = {};
	var e = function() {
		var args = Array.prototype.slice.call(arguments);
		args.splice(1, 0, ': ');
		args.splice(0, 0, 'Error at line ');
		if (!errors) {
			writeConsole(con, args.join(''));
		}
		errors = true;
	}
	for (var pass = 0; pass < 2; pass++) {
		var p = 0;
		for (var i = 0; i < program.length; i++) {
			var cmd = assemble1(program[i]);
			if (cmd.error && pass == 0) {
				e(i, cmd.error);
				continue;
			}
			if (pass == 0) {
				if (cmd.label) {
					if (labels[cmd.label] !== undefined) {
						e(i, 'Label ', cmd.label, ' redefined');
					}
					labels[cmd.label] = p;
				}
			}
			if (pass == 1 && cmd.op) {
				var argv = undefined;
				if (cmd.arg != undefined) {
					var limit = cmd.op == 'DAT' ? 999 : 99;
					var x = parseInt(cmd.arg);
					if (x == Math.floor(x) && x >= 0 && x <= limit) {
						argv = x;
					} else if (labels[cmd.arg] !== undefined) {
						argv = labels[cmd.arg];
					} else {
						e(i, cmd.arg + ' is not a valid number or label');
						continue;
					}
				}
				switch (cmd.op) {
				case 'ADD':
					c.memory[p] = 100 + argv;
					break;
				case 'SUB':
					c.memory[p] = 200 + argv;
					break;
				case 'STA':
					c.memory[p] = 300 + argv;
					break;
				case 'LDA':
					c.memory[p] = 500 + argv;
					break;
				case 'BRA':
					c.memory[p] = 600 + argv;
					break;
				case 'BRZ':
					c.memory[p] = 700 + argv;
					break;
				case 'BRP':
					c.memory[p] = 800 + argv;
					break;
				case 'INP':
					c.memory[p] = 901;
					break;
				case 'OUT':
					c.memory[p] = 902;
					break;
				case 'HLT':
					c.memory[p] = 0;
					break;
				case 'DAT':
					c.memory[p] = argv;
					break;
				default:
					e(i, 'Unknown command: ', cmd.op);
					continue;
				}
			}
			p += cmd.op ? 1 : 0;
		}
	}
	if (!errors) {
		writeConsole(con, 'Assembly OK!');
	}
	writeSharableLink(view)
	updateView(view, computer);
}

function readInput(c, v) {
	var lines = v.input.value.split('\n');
	lines = lines.map(function(x){return x.trim();});
	lines = lines.filter(function(x){return x;});
	var line = lines[c.inputLine];
	if (line === undefined) {
		throw "no more input";
	}
	n = parseInt(line);
	if (n != Math.floor(n) || n < 0 | n > 999) {
		throw "bad input: " + line;
	}
	c.inputLine += 1;
	return n;
}

function setA(c, a) {
	c.flagN = a < 0 || a > 999;
	while (a < 0) a += 1000;
	while (a > 999) a -= 1000;
	c.a = a;
}

function step(c, v) {
	if (c.pc < 0 || c.pc > 99) {
		return "PC " + c.pc + " out of range";
	}
	c.ins += 1;
	cmd = decompile(c.memory[c.pc]);
	switch (cmd[0]) {
	case 'ADD':
		setA(c, c.a + c.memory[cmd[1]]);
		c.pc += 1;
		break;
	case 'SUB':
		setA(c, c.a - c.memory[cmd[1]]);
		c.pc += 1;
		break;
	case 'STA':
		c.memory[cmd[1]] = c.a;
		c.pc += 1;
		break;
	case 'LDA':
		setA(c, c.memory[cmd[1]]);
		c.pc += 1;
		break;
	case 'BRA':
		c.pc = cmd[1];
		break;
	case 'BRZ':
		c.pc = c.a == 0 ? cmd[1] : c.pc + 1;
		break;
	case 'BRP':
		c.pc = c.flagN ? c.pc + 1 : cmd[1];
		break;
	case 'INP':
		try {
			var inv = readInput(c, v);
			setA(c, inv);
			writeConsole(v.output, 'Read input: ' + inv);
		} catch (err) {
			return "problem reading input: " + err;
		}
		c.pc += 1;
		break;
	case 'OUT':
		writeConsole(v.output, 'Output value: ' + c.a);
		if (v.out_clean.value) v.out_clean.value += '\n';
		v.out_clean.value += c.a;
		c.pc += 1;
		break;
	case 'HLT':
		writeConsole(v.output, 'The program has stopped.');
		c.running = false;
		break;
	default:
		c.running = false;
		return "Unknown opcode found: " + fmt3(c.memory[c.pc]);
	}
	return null;
}

function clickStep() {
	if (computer.running) {
		var error = step(computer, view);
		if (error) {
			var con = view.output;
			writeConsole(con, 'Error: ' + error);
		}
	}
	updateView(view, computer);
}

function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i");
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function writeSharableLink(v) {
	var url = window.location.href;
	url = url.replace(/[?].*/, '');
	url = url + '?program=' + btoa(v.program.value) + '&input=' + btoa(v.input.value);
	view.share.innerHTML = "<a href=" + url + ">Sharable Link</a>";
}

function init() {
	initMemoryDom();
	computer = newComputer();
	computer.memory[42] = 102;
	view = newView();
	var qp = getParameterByName("program");
	if (qp) {
		view.program.value = atob(qp);
	}
	qp = getParameterByName("input");
	if (qp) {
		view.input.value = atob(qp);
	}
	clickAssemble();
	updateView(view, computer);
}

