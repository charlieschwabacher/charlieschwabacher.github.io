var size = 90,
lightHeight = 6,
cameraWaveHeight = 0.03,
cameraWaveSpeed = 0.4,
vertexWaveHeight = 1.1,
vertexWaveSpeed = 0.8,
rippleWaveHeight = 0.3,
rippleWaveSize = 2.2,
rippleWaveSpeed = 0.6,
updateCallbacks = [],
renderer  = new THREE.WebGLRenderer(),
scene = new THREE.Scene(),
camera  = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 5000 );

var cameraheight;

document.body.appendChild( renderer.domElement );

window.onresize = function() {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  cameraHeight = Math.min(camera.aspect, 1 / camera.aspect) * size / 2 / Math.tan(Math.PI / 180 * camera.fov / 2) * (1 - cameraWaveHeight) - rippleWaveHeight - vertexWaveHeight;
  camera.updateProjectionMatrix();
}
window.onresize();

// add a light source
var light = new THREE.PointLight( 0xffffff );
light.position.set( 0, 0, lightHeight );
scene.add( light );

// add an object and make it move
var geometry  = new THREE.Geometry();
geometry.dyanmic = true;

// create vertices and updaters
for (var i = 0, len = size*size; i < len; i++) {
  var ix = i % size,
      iy = Math.floor(i / size);
      x = -(size-1)/2 + ix,
      y = -(size-1)/2 + iy;
      
  // create vector, vertex, and udpate callback
  (function(vertexOffset) {
    var vector = new THREE.Vector3(x, y, Math.sin(vertexOffset))

    var distance = Math.sqrt(x * x + y * y) * rippleWaveSize;
    var radius = (size - 1) / 2
    var rippleOffset = distance / radius * 2 * Math.PI

    updateCallbacks.push(function(delta, now){
      vector.z = Math.sin(now * vertexWaveSpeed + vertexOffset) * vertexWaveHeight +
                 Math.sin(now * rippleWaveSpeed + rippleOffset) * rippleWaveHeight;
    });

    geometry.vertices.push(vector);
  })(Math.random() * 2 * Math.PI);

  // add faces for triangles w/ right angle at their top left
  if (ix < size - 1 && iy < size - 1) {
    geometry.faces.push(new THREE.Face3(i, i + 1, i + size));
  }

  // add faces for triangles w/ right angle at their bottom right
  if (ix > 0 && iy > 0) {
    geometry.faces.push(new THREE.Face3(i, i - 1, i - size));
  }
}

// add update callback to compute mesh normals after each update
updateCallbacks.push(function() {
  geometry.verticesNeedUpdate = true;
  //geometry.normalsNeedUpdate = true;

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
});

// create material and mesh, add to scene
var material  = new THREE.MeshPhongMaterial({color: 0xffffff});
//material.shading = THREE.FlatShading;
var mesh  = new THREE.Mesh(geometry, material);
scene.add(mesh);

// camera controls
updateCallbacks.push(function(delta, now){
  camera.position.z = cameraHeight + cameraHeight * cameraWaveHeight * Math.sin(now * cameraWaveSpeed);
  camera.lookAt( scene.position )
})

// render the scene
updateCallbacks.push(function(){
  renderer.render(scene, camera);   
});

// update loop
var lastTimeMsec = null
var animate = function (nowMsec) {
  requestAnimationFrame(animate);
  
  // measure time
  lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
  var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
  lastTimeMsec  = nowMsec

  // call each update function
  updateCallbacks.forEach(function(callback){
    callback(deltaMsec/1000, nowMsec/1000)
  });
};


// start loop
requestAnimationFrame(animate);
