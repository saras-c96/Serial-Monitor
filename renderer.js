// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const electron = require('electron')
const serialport = require('serialport')
const tableify = require('tableify')
const ipcRenderer = require('electron').ipcRenderer;

async function listSerialPorts() {
  await serialport.list().then((ports, err) => {
    if (err) {
      document.getElementById('error').textContent = err.message
      return
    } else {
      document.getElementById('error').textContent = ''
    }
    // console.log('ports', ports);

    if (ports.length === 0) {
      document.getElementById('error').textContent = 'No ports discovered'
    }

    tableHTML = tableify(ports)
    document.getElementById('ports').innerHTML = tableHTML
  })
}

console.log('Renderer')

// Set a timeout that will check for new serialPorts every 2 seconds.
// This timeout reschedules itself.
setTimeout(function listPorts() {
  console.log('Serial Timeout');
  listSerialPorts();
  setTimeout(listPorts, 2000);
}, 2000);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
let startBtn = document.getElementById('enterbtn');
// let loggerWindow;
startBtn.addEventListener('click', function () {
  console.log('click');
  //send the info to main process . we can pass any arguments as second param.
  arg = document.getElementById("input_port").value
  ipcRenderer.send("startBtnClick", arg); // ipcRender.send will pass the information to main process
});