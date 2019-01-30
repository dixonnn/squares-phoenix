// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

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
let basesContainer = document.querySelector("#bases")
let table = document.querySelector("#table")

// document.getElementById("compute").style.visibility = "hidden"

// Global variables
var data, t0, t1;
var timeLabels = [];
var workerLabels = [];
var chart = ""; 

// Compute handler - send one request to channel with [N, k]
computeButton.addEventListener("click", event => {
  channel.push("execute", {N: amount.value, k: length.value})
})

// Listen for return from channel
channel.on("return", payload => {
  console.log(payload)

  // Data should be two arrays: Times[], Results[]
  // print results[]
  // Chart times[] vs. array Workers[] = [1..times.length]

  // Display Results before chart
  var bases = payload.bases
  var squares = payload.squares
  
  // var th1 = document.createElement('th')
  // var th2 = document.createElement('th')
  // th1.innerText = "Bases"
  // th2.innerText = "Squares"

  // table.appendChild(th1)
  // table.appendChild(th2)
  // table.style.border = "thin solid"
  // table.style.border-collapse
  // for (var l = 0; l < bases.length; l++) {
  //   var tr = document.createElement('tr')
  //   var td1 = document.createElement('td');
  //   var td2 = document.createElement('td');

  //   var text1 = document.createTextNode(bases[l]);
  //   var text2 = document.createTextNode(squares[l]);

  //   td1.appendChild(text1);
  //   td1.style.border = "medium solid"
  //   td2.appendChild(text2);
  //   td2.style.border = "medium solid"
  //   tr.appendChild(td1);
  //   tr.appendChild(td2);

  //   table.appendChild(tr);
  // }

  // squaresContainer.appendChild(table)

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
        label: "Workers vs. Time for [N,K]",
        borderColor: '#2662ed',
        backgroundColor: '#65a6f0',
        data: payload.times,
      }]
    },
  
    // Configuration options go here
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{
          ticks: {
            autoSkip: true,
            maxTicksLimit: 50
          }
        }]
      }
    }
  })
}) 

// Split up problem and create workers in backend
// createButton.addEventListener("click", event => {
//   console.log(document.getElementById("returns").children)
//   for(let j = 0; j < document.getElementById("returns").children.length; j++) {
//     document.getElementById("returns").removeChild(document.getElementById("returns").children[j])
//   }
//   channel.push("split", {workers: workers.value, n: amount.value, k: length.value})
// })

// computeButton.addEventListener("click", event => {
//   t0 = performance.now()
//   for(let i = 0; i < data.problems.length; i++) {
//     channel.push("compute", {problems: data.problems[i], worker: data.workers[i]})
//   }
//   document.getElementById("chart").style.visibility = "visible"
// })

// chartButton.addEventListener("click", event => {

//   // This must be pushed at correct index in order
//   // Use binary search

//   workerLabels.push(workers.value)
//   timeLabels.push(t1)
//   let ctx = document.getElementById('square-chart').getContext('2d')
//   if(chart != "") {
//     chart.destroy()
//   }
//   chart = new Chart(ctx, {
//     // The type of chart we want to create
//     type: 'bar',
//     responsive: true,
//     maintainAspectRatio: false,
  
//     // The data for our dataset rgb(42, 170, 247) 
//     data: {
//       labels: workerLabels,
//       datasets: [{
//         fill: true,
//         label: "Workers vs. Time for [N,K]",
//         borderColor: '#2662ed',
//         backgroundColor: '#65a6f0',
//         data: timeLabels,
//       }]
//     },
  
//     // Configuration options go here
//     options: {
//       scales: {
//         yAxes: [{
//           ticks: {
//             beginAtZero: true
//           }
//         }]
//       }
//     }
//   })
// })

// Reload page for different variables
// reloadButton.addEventListener("click", event => {
//   location.reload()
// })

// Receive split problems with pids for Workers
// channel.on("problems", payload => {
//   console.log(payload)
//   data = payload
//   document.getElementById("compute").style.visibility = "visible"
// })

// Receive results from computation, send to chart
// channel.on("results", payload => {
//   t1 = performance.now() - t0

//   let returnItem = document.createElement("li")
//   returnItem.innerText = `${payload.perfect_squares}`
//   returnContainer.appendChild(returnItem)

//   console.log(payload.perfect_squares)
//   console.log("Time: " + t1 + "ms")
// })

channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })

export default socket
