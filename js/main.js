var typeSet = {
  edges: ['array', 'uint32', 288650]
}
var edges = 288650;
var oReq = new XMLHttpRequest();
oReq.open("GET", "/blob/edges.bin", true);
oReq.responseType = "arraybuffer";

oReq.onload = function(oEvent) {
  var arrayBuffer = oReq.response; // Note: not oReq.responseText
  if (arrayBuffer) {
    var byteArray = new Uint32Array(arrayBuffer);
    var target = document.getElementById('main');
    for (var i = 0; i < 1000; i += 2) {
      //target.textContent += byteArray[i] + ', ' + byteArray[i + 1] + '\n';
    }
    var graph = Viva.Graph.graph();
    console.log(byteArray.byteLength);
    for (var i = 0; i < 288650; i += 2) {
      graph.addLink(byteArray[i], byteArray[i + 1]);
    }


    var graphics = Viva.Graph.View.webglGraphics();

    var layout = Viva.Graph.Layout.forceDirected(graph, {
      springLength: 10,
      springCoeff: 0.0005,
      dragCoeff: 0.02,
      gravity: -1.2
    });


    var renderer = Viva.Graph.View.renderer(graph, {
      graphics: graphics,
      layout: layout,
      container: document.getElementById("main")
    });
    renderer.run();
  }
};
oReq.send(null);
