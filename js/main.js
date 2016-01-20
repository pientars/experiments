var typeSet = {
  edges: ['array', 'uint32', 288650]
}
var edges = 288650;

var films_url = "blob/edges.bin";
var db_url = "blob/sqlite_rotten_tomatoes.db";
var colors = [
  0x1f77b4ff, 0xaec7e8ff,
  0xff7f0eff, 0xffbb78ff,
  0x2ca02cff, 0x98df8aff,
  0xd62728ff, 0xff9896ff,
  0x9467bdff, 0xc5b0d5ff,
  0x8c564bff, 0xc49c94ff,
  0xe377c2ff, 0xf7b6d2ff,
  0x7f7f7fff, 0xc7c7c7ff,
  0xbcbd22ff, 0xdbdb8dff,
  0x17becfff, 0x9edae5ff
];

var classColor = {
  "d": 0xf44336cf,
  "m": 0x7c4dffcf,
  "a": 0x4caf50cf
}

function loadBinary(url, callback) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", url, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function(oEvent) {
    var arrayBuffer = oReq.response;
    if (arrayBuffer) {
      var byteArray = new Uint32Array(arrayBuffer);
      callback(byteArray);
    }
  }
  oReq.send(null);
}

var graph = Viva.Graph.graph();
var layout = Viva.Graph.Layout.forceDirected(graph, {
  springLength: 10,
  springCoeff: 0.0005,
  dragCoeff: 0.05,
  gravity: -1.2
});
var graphics = Viva.Graph.View.webglGraphics();
var nnnode;
graphics.node(function(node) {
  var color = classColor[node.id[0]];
  return Viva.Graph.View.webglSquare(10, color);
})
var renderer = Viva.Graph.View.renderer(graph, {
  graphics: graphics,
  layout: layout,
  renderLinks: false,
  container: document.getElementById("main")
});

function nukeLoadingOverlay(input) {
  var fadePromise = new Promise(function(resolve, reject) {
    $('#loading').fadeOut(function() {
      resolve(input);
    });
  });
  fadePromise.then(function(input) {
    $('#loading').remove();
    return input;
  });
}

function run(config) {
  /*
  graph.clear();
  layout.dispose();
  try {
    renderer.dispose();
  } catch (e) {
    console.log(e);
  }
  */
  fetch(db_url)
    .then(r => r.arrayBuffer())
    .then(b => new Uint8Array(b))
    .then(a => new SQL.Database(a))
    .then(db => {
      var related = db.exec("select x, y from related where x<>'' and y <>'';");
      related[0].values.map(arr => {
        graph.addLink("m" + arr[0], "m" + arr[1]);
      });
      var cast = db.exec("select id, cast_0, cast_1, cast_2, cast_3 from movies \n" +
        "where id in (select distinct x from related where x<>'');"
      );
      cast[0].values.map(casts => {
        for (var i = 1; i <= 4; i++) {
          if (casts[i] !== null) {
            graph.addLink("m" + casts[0], "a" + casts[i]);
          }
        }
      });
      var director = db.exec("select id, director_0 from movies \n" +
        "where id in (select distinct x from related where x<>'');"
      );
      director[0].values.map(directors => {
        //for (var i = 1; i <= 2; i++) {
        //if (casts[i] !== null) {
        graph.addLink("m" + directors[0], "d" + directors[1]);
        //}
        //}
      });
      console.log("here");
    })
    .then(() => {
      renderer.run()
    })
    .then(nukeLoadingOverlay);
  /*
  fetch(films_url)
    .then(r => r.arrayBuffer())
    .then(b => new Uint32Array(b))
    .then(function(array) {
      for (var i = 0; i < array.length; i += 2) {
        graph.addLink("m" + array[i], "m" + array[i + 1]);
      }
    })
    .then(() => renderer.run());
  */
  /*
  fetch(films_url)
    .then(response => response.text())
    .then(text => text.split(/\r?\n/)) // split by line
    .then(lines => lines.map(l => {
      var edge = l.split();
      graph.addLink("m" + edge[0], "m" + edge[1]);
    }))
    .then(() => renderer.run());
    */
}

run();
