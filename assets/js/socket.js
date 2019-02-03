// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/web/endpoint.ex":
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})
socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("squares:lobby", {})

// User Input
let amount = document.querySelector("#amount")
let length = document.querySelector("#length")
let computeButton = document.querySelector("#compute")
let returnTable = document.querySelector("#table")
var spinner = document.getElementById("spinner-box")
spinner.style.visibility = "hidden"

// document.getElementById("compute").style.visibility = "hidden"

// Global variables
var data, t0, t1;
var timeLabels = [];
var workerLabels = [];
var chart = ""; 

// Compute handler - send one request to channel with [N, k]
computeButton.addEventListener("click", event => {
  // Check that input is right
  if (amount.value > 0 && amount.value < 1001 && length.value > 0 && length.value < 1001) {
    channel.push("execute", {N: amount.value, k: length.value})
    spinner.style.visibility = "visible"
  
    let count = returnTable.childElementCount
    // Also, clear old return values
    if (count > 0) {
      for (let i = 0; i < count + 1; i++) {
        returnTable.removeChild(returnTable.lastElementChild)
      }
    }
  } else {
    alert("Input values must be between 1 and 1000.")
  }
  
})

// Listen for return from channel
channel.on("return", payload => {
  // console.log(payload)
  spinner.style.visibility = "hidden"

  // Display Results before chart (if any are returned)
  var bases = payload.bases
  var squares = payload.squares
  
  var th1 = document.createElement('th')
  var th2 = document.createElement('th')
  if (bases.length > 0) {
    th1.innerText = "Bases"
    th2.innerText = "Squares"

    returnTable.appendChild(th1)
    returnTable.appendChild(th2)
    document.getElementById("bases").innerText = ""

    for (var l = 0; l < bases.length; l++) {
      var tr = document.createElement('tr')
      var td1 = document.createElement('td');
      var td2 = document.createElement('td');

      var text1 = document.createTextNode(bases[l]);
      var text2 = document.createTextNode(squares[l]);

      td1.appendChild(text1);
      td2.appendChild(text2);
      tr.appendChild(td1);
      tr.appendChild(td2);

      table.appendChild(tr);
    }
  } else {
    document.getElementById("bases").innerText = "No perfect squares found."
  }

  // Create labels based on number of worker nodes returned
  var labels = Array.apply(null, {length: payload.times.length}).map(Function.call, Number)

  let ctx = document.getElementById('square-chart').getContext('2d')
  if(chart != "") {
    chart.destroy()
  }
  chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    responsive: true,
    maintainAspectRatio: false,
  
    // The data for our dataset rgb(42, 170, 247) 
    data: {
      labels: labels,
      datasets: [{
        fill: false,
        label: `Workers vs. Time for [${amount.value},${length.value}]`,
        borderColor: '#026b7b',
        backgroundColor: '#048b9a',
        data: payload.times,
      }]
    },
  
    // Configuration options go here
    options: {
      scales: {
        yAxes: [{
          ticks: {
            major: {
              fontStyle: 'bold'
            },
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: "Elapsed Time (ms)"
          }
        }],
        xAxes: [{
          ticks: {
            major: {
              fontStyle: 'bold'
            },
            autoSkip: true,
            maxTicksLimit: 50
          },
          scaleLabel: {
            display: true,
            labelString: "Number of Worker Nodes"
          }
        }]
      }
    }
  })
}) 

channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

export default socket
