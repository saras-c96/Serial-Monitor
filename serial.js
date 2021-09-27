const ipcRenderer = require('electron').ipcRenderer
const serialport = require('serialport')
const Readline = require('serialport').parsers.Readline

const filter_enter_btn = document.getElementById('filter_enter');
const filter_string_txt = document.getElementById('filter_string');
const autoscroll_check = document.getElementById('autoscroll');
const autoscroll_raw_check = document.getElementById('autoscroll_raw');
const textArea = document.getElementById('incomingData');
const textAreaUnfiltered = document.getElementById('incomingData_raw');

let currentRaw = ''
let head = document.getElementById('heading')

let filter_string = ''
let filter_Strings = []

console.log('serial.js')
let port

ipcRenderer.on('loaded_newWindow', function (event, param) {
    console.log('Opening Port', param)
    if (param == '') {
        ipcRenderer.send("portOpenError", 0);
        return
    }
    head.innerText = 'Serial Monitor\t' + param
    port = new serialport(param, {
        baudRate: 9600,
        autoOpen: false
    });

    port.open(function (err) {
        if (err) {
            ipcRenderer.send("portOpenError", 0);
            console.log("Error Opening Serial Port");
        }
        else {
            // Pipe the data into another stream (like a parser or standard out)
            const lineStream = port.pipe(new Readline({ delimiter: '\r\n' }))
            lineStream.on('data', addText);


            function addText(event) {
                let string = event
                let allowed = false;
                if (filter_Strings.length != 0) {
                    for (i = 0; i < filter_Strings.length; i++) {
                        if (string.toLowerCase().indexOf(filter_Strings[i].toLowerCase()) != -1 && string.toLowerCase().indexOf(filter_Strings[i].toLowerCase()) < string.length) {
                            allowed = true;
                            break;
                        }
                    }
                }
                if (allowed == true) {
                    var currentTime = new Date();
                    var currentOffset = currentTime.getTimezoneOffset();
                    var ISTOffset = 330;   // IST offset UTC +5:30
                    var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
                    currentString = textArea.value;
                    currentString += '\n'
                    currentString += pad(ISTTime.getHours(), 2)
                        + ':' + pad(ISTTime.getMinutes(), 2)
                        + ':' + pad(ISTTime.getSeconds(), 2)
                        + '.' + pad_decimal(ISTTime.getMilliseconds(), 3)
                        + ' - '


                    currentString += event
                    textArea.value = currentString
                    if (autoscroll_check.checked == true)
                        textArea.scrollTop = textArea.scrollHeight
                }
                var currentTime = new Date();
                var currentOffset = currentTime.getTimezoneOffset();
                var ISTOffset = 330;   // IST offset UTC +5:30
                var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
                currentString = textAreaUnfiltered.value;
                currentString += '\n'
                currentString += pad(ISTTime.getHours(), 2)
                    + ':' + pad(ISTTime.getMinutes(), 2)
                    + ':' + pad(ISTTime.getSeconds(), 2)
                    + '.' + pad_decimal(ISTTime.getMilliseconds(), 3)
                    + ' - '
                currentString += event
                currentRaw = currentString;
                textAreaUnfiltered.value = currentString
                if (autoscroll_raw_check.checked == true)
                    textAreaUnfiltered.scrollTop = textAreaUnfiltered.scrollHeight
            }
        }
    });


});

filter_enter_btn.addEventListener('click', function () {
    filter_string = filter_string_txt.value
    filter_Strings = filter_string.split(',')
    let allLogs = currentRaw.split('\n')
    let loadFilter = ''
    for (j = 0; j < allLogs.length; j++) {
        let allowed = false;
        if (filter_Strings.length != 0) {
            for (i = 0; i < filter_Strings.length; i++) {
                if (allLogs[j].toLowerCase().indexOf(filter_Strings[i].toLowerCase()) != -1  && allLogs[j].toLowerCase().indexOf(filter_Strings[i].toLowerCase()) < allLogs[j].length) {
                    console.log(allLogs[j], filter_Strings[i], "Success")
                    allowed = true;
                    break;
                }
                else
                {
                    console.log(allLogs[j], filter_Strings[i], "Fail")
                }
            }
        }
        if (allowed == true) {
            loadFilter += allLogs[j]
            loadFilter += '\n'

        }
    }
    textArea.value = loadFilter;
});

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function pad_decimal(num, size) {
    num = num.toString();
    while (num.length < size) num = num + "0";
    return num;
}