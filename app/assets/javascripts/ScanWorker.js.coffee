# importScripts('/assets/three.js');
# depthWorker.addEventListener('message', function(e) {
#     var depthMap = e.data.map(function(el, i){
#       return new THREE.Vector3(el.x, el.y, el.z);
#     });
#     box.depth_map = depthMap;
#     storage.set(box.url, JSON.stringify(depthMap));
#       fn(box);
#   }, false);
# depthWorker.postMessage({'wp': wp}); 

extractDepthMap = (wp) ->
  if not wp then return
  console.log 'Extracting'
  console.log wp.pixels
  height = wp.pixels.height
  width = wp.pixels.width
  pixels = wp.pixels
  faces = wp.faces
  faceVertexUvs = wp.faceVertexUvs
  depthMap = []
  faces.forEach (face, i) ->
    uv1 = faceVertexUvs[0][i][0]
    pixel1 = getPixel(pixels, uv1, width, height)
    uv2 = faceVertexUvs[0][i][1]
    pixel2 = getPixel(pixels, uv2, width, height)
    uv3 = faceVertexUvs[0][i][2]
    pixel3 = getPixel(pixels, uv3, width, height)
    normal = face.normal
    a = 
      x: normal.x * pixel1
      y: normal.y * pixel1
      z: normal.z * pixel1
    b = 
      x: normal.x * pixel2
      y: normal.y * pixel2
      z: normal.z * pixel2
    c = 
      x: normal.x * pixel3
      y: normal.y * pixel3
      z: normal.z * pixel3
    depthMap[faces[i].a] = a
    depthMap[faces[i].b] = b
    depthMap[faces[i].c] = c
    return
  depthMap

getPixel = (pixels, uv, w, h) ->
  u = uv.y
  v = uv.x
  if u < 0 or u > 1 or v < 0 or v > 1
    err = new Error('Invalid UV coordinates (' + u + ', ' + v + ')')
    return err.stack
  x = h - 1 - Math.floor(u * 1.0 * h)
  y = w - 1 - Math.floor(v * 1.0 * w)
  row = x * w * 4
  col = y * 4
  index = row + col
  pixels.data[index]

self.addEventListener 'message', ((e) ->
  if not e.data.wp then return
  data = e.data
  wp = e.data.wp
  self.postMessage extractDepthMap(wp)
  return
), false

# ---
# generated by js2coffee 2.2.0