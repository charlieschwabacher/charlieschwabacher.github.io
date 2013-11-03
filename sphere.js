var size = 80,
lightHeight = 55,
cameraWaveHeight = 0.03,
cameraWaveSpeed = 0.3,
vertexWaveHeight = 2.5,
vertexWaveSpeed = 0.8,
xRippleWaveHeight = 0.16,
xRippleWaveSize = 4.2,
xRippleWaveSpeed = 0.29,
yRippleWaveHeight = 0.3,
yRippleWaveSize = 3.0,
yRippleWaveSpeed = 0.69,
zRippleWaveHeight = -0.2,
zRippleWaveSize = 2.0,
zRippleWaveSpeed = 0.8,
updateCallbacks = [],
renderer  = new THREE.WebGLRenderer(),
scene = new THREE.Scene(),
camera  = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 5000 );

var cameraheight;

document.body.appendChild( renderer.domElement );

window.onresize = function() {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  cameraHeight = size / 2 + size / 2 / Math.tan(Math.PI / 180 * camera.fov / 2) * (1 - cameraWaveHeight) * 0.34;
  camera.updateProjectionMatrix();
}
window.onresize();

// add a light source
var light = new THREE.PointLight( 0xffffff );
light.position.set( 0, 0, lightHeight + size / 2 );
scene.add( light );

// add planet object
var geometry = new THREE.SphereGeometry(size / 2, size, size, 0.0 * Math.PI, 1 * Math.PI, 0.0 * Math.PI, 1 * Math.PI);
geometry.dyanmic = true;

// vertex updaters
for (var i = 0, len = geometry.vertices.length; i < len; i++) {
  (function(vertex) {
    var vertexOffset = Math.random() * 2 * Math.PI,
        xRippleOffset = 2 * vertex.x * xRippleWaveSize / size * 2 * Math.PI,
        yRippleOffset = 2 * vertex.y * yRippleWaveSize / size * 2 * Math.PI,
        zRippleOffset = 2 * vertex.z * zRippleWaveSize / size * 2 * Math.PI,
        original = vertex.clone(),
        direction = vertex.clone().normalize();

    updateCallbacks.push(function(delta, now){
      scale = Math.sin(now * vertexWaveSpeed + vertexOffset) * vertexWaveHeight +
              Math.sin(now * xRippleWaveSpeed + xRippleOffset) * xRippleWaveHeight +
              Math.sin(now * yRippleWaveSpeed + yRippleOffset) * yRippleWaveHeight +
              Math.sin(now * zRippleWaveSpeed + zRippleOffset) * zRippleWaveHeight;

      vertex.set(
        original.x + scale * direction.x,
        original.y + scale * direction.y,
        original.z + scale * direction.z
      );
    });
  })(geometry.vertices[i]);
}

// create material and mesh, add to scene
var material  = new THREE.MeshLambertMaterial({color: 0xCCCCCC}),
    mesh  = new THREE.Mesh(geometry, material);

//material.shading = THREE.FlatShading;

scene.add(mesh);

  
// add update callback to compute mesh normals after each update
updateCallbacks.push(function() {
  geometry.verticesNeedUpdate = true;
  geometry.normalsNeedUpdate = true;
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
});


// camera controls
updateCallbacks.push(function(delta, now){
  camera.position.z = cameraHeight + cameraHeight * cameraWaveHeight * Math.sin(now * cameraWaveSpeed);
  camera.lookAt( scene.position );
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
