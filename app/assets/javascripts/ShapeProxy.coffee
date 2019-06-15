###
Given a set of paths describing a design, this process will
generate a shape proxy. 
A shape proxy:
  * Terminating wire extensions
  * Anchoring holes
  * Create a continuously rising geometry
  * Bending walls on inner curves
### 

class window.ShapeProxy
  @WIRE_ELONGATION: 30
  @TOLERANCE: 1.1
  @WALL_WIDTH: 8
  @BASE_PADDING: 15
  @BASE_HEIGHT: Ruler.mm2pts(2)

  constructor: (path)->
    # CLONE PATH
    x = path.clone()
    x.copyAttributes(path, false)
    path.visible = false
    path.selected = false
    path.remove()
    p = x
    p.applyMatrix = true
    p.shadowBlur = 0
    # CREATE PARENT GROUP
    @g = new paper.Group
      name: "shape_proxy"
    p.set
      parent: @g
      strokeColor: "orange"

    # SET HYPERPARAMETERS
    @id = p.id
    @max_height = null
    @wall_addition = null
    @wall_threshold = 0.04
    
    # LEVELS CALCULATION
    @gauge = p.strokeWidth # Wire diameter
    ShapeProxy.WALL_HEIGHT = @gauge * 1.5 # Pts taller than wrapping wire
    
    # BIND TO DAT.GUI
    @gui()

    # ROUTINE
    @wire_extender()
    # @levels = @compute_levels()

    # @generate_walls()
    # @hill_climb()
    # @anchor_holes()
    # @scale_walls()
    
    
    # @add_bg()
    
    # @normalize_heights()
    
    # @_p().remove()
    # @update_dimensions()

  # Resolves path
  _p: ()-> return paper.project.getItem {id: @id}

  # Resolves class of paths
  _get: (name)->
    paper.project.getItems
      name: name
      data: 
        path_id: @id
  _max_h: ()->
    elements = paper.project.getItems {}
    data = _.pluck elements, "data"
    heights = _.pluck data, "height"
    return _.max(heights)
  # Bind to the dat.gui handler for parametric tweaks
  gui: ()->
    scope = this
    # PARAMETER TWEAK ON CURVATURE
    f = gui.addFolder(this.id)
    f.open()
    s_controller = f.add(this, 'wall_threshold').min(0).max(0.1).step(0.005)
    s_controller.onChange (value)->
      scope.update_walls(value)
    f.add(this, 'generate_stl')
    f.add(this, 'make_stl')

  update_walls: (value)->
    curves = @_get("curvature_marker")
    _.each curves, (c)->
      c.visible = c.data.curvature > value

  # Computes the mm dimensions of the proxy
  update_dimensions: ()->
    if(dim)
      r = @_get("bg")
      if r.length == 0 then return
      b = r[0].strokeBounds
      dim.set(Ruler.pts2mm(b.height), Ruler.pts2mm(b.width), Ruler.pts2mm(@_max_h()))
    this.height = Ruler.pts2mm(b.height)
    this.width = Ruler.pts2mm(b.width)
    this.depth = Ruler.pts2mm(@_max_h())
  # Extends ends of a wire path by WIRE_ELONGATION amount.
  wire_extender: ()->
    p = @_p()
    # Wire extender
    if p.length < 30
      p.fullySelected = true
      alertify.error "A fully selected path geometry is too short. Please revise."
    else
      start_norm = p.getPointAt(5).subtract(p.getPointAt(0))
      start_norm.length = ShapeProxy.WIRE_ELONGATION
      start_extension = p.getPointAt(0).subtract(start_norm)
      p.insert(0, start_extension)

      end_norm = p.getPointAt(p.length).subtract(p.getPointAt(p.length - 5))
      end_norm.length = ShapeProxy.WIRE_ELONGATION
      end_extension = p.getPointAt(p.length).add(end_norm)
      p.add(end_extension)
  
  # Adds a black background base
  add_bg: ()->
    r = new paper.Path.Rectangle
      parent: @g
      name: "bg"
      data: 
        path_id: this.id 
        height: 0
      rectangle: @g.bounds.clone().expand(ShapeProxy.BASE_PADDING)
      fillColor: "#00A8E1"
    r.sendToBack()

    # ADD BASE HEIGHT TO CALCULATIONS
    elements = paper.project.getItems {}
    _.each elements, (e)->
      if e.data and not (_.isNull e.data.height)
        e.data.height = e.data.height + ShapeProxy.BASE_HEIGHT
  # Create winding hill
  hill_climb: ()->
    scope = this
    levels = this.levels
    p = @_p()
    _.each levels.reverse(), (l)->
      console.log l
      _.each _.range(l.to, l.from, -1), (offset)->
        z = l.get_height(offset)
        pt = p.getPointAt(offset)
        c = new paper.Color "red"
        c.hue = z%360
        r = new paper.Path.Rectangle
          parent: scope.g
          name: "hillpath"
          size: [p.strokeWidth, 3]
          position: pt
          fillColor: c
          data:
            path_id: p.id
            height: z
        r.rotation = p.getNormalAt(offset).angle
        r.bringToFront()

  # NORMALIZE HILLPATH TO PARAM BRIGHTNESS
  normalize_heights: ()->
    elements = paper.project.getItems {}
    max = @_max_h()
    _.each elements, (e)-> e.fillColor = new paper.Color e.data.height/max 
  
  # Generates possible wall locations based on curvature
  generate_walls: ()->
    scope = this
    p = @_p()
    curves = _.map _.range(0, p.length, 1), (q)-> return Math.abs(p.getCurvatureAt(q))
    c_max = _.max(curves)
    c_min = _.min(curves)
    c_range = c_max - c_min

    curves = _.each _.range(0, p.length, 1), (q)->
      curvature = p.getCurvatureAt(q)
      normal = p.getNormalAt(q)
      normal.length = (p.strokeWidth / 2.0) + ShapeProxy.WALL_WIDTH / 2.0
      pt = p.getPointAt(q)
      
      inner = "yellow"
      outer = "blue"

      c = new paper.Path.Circle
        parent: scope.g
        name: "curvature_marker"
        fillColor: if curvature > 0 then inner else outer
        position: if curvature > 0 then pt.subtract(normal) else pt.add(normal)
        radius: ShapeProxy.WALL_WIDTH / 2.0
        data:
          path_id: p.id 
          curvature: Math.abs(curvature)/c_max
          type: if curvature > 0 then "inner" else "outer"
      c.sendToBack()
    @update_walls(@wall_threshold)

  anchor_holes: ()->
    p = @_p()
    # ANCHORING HOLES
    c = new paper.Path.Circle
      parent: this.g
      name: "anchor"
      position: p.getPointAt(0)
      fillColor: "black"
      radius: p.strokeWidth * ShapeProxy.TOLERANCE
    c = new paper.Path.RegularPolygon
      parent: this.g
      name: "anchor"
      position: p.getPointAt(p.length)
      sides: 3
      fillColor: "white"
      data: 
        height: @_max_h()
      # _.max(zs)/max
      radius: p.strokeWidth * ShapeProxy.TOLERANCE
    c.rotation = p.getNormalAt(p.length).angle
    c.sendToBack()
  scale_walls: ()->
    scope = this
    path = @_p()
    hillpaths = @_get("hillpath")
    curves = @_get("curvature_marker")
    _.each curves, (c)->
      hill = scope.closest_hill(c, hillpaths)
      c.data.height = hill.data.height + ShapeProxy.WALL_HEIGHT
      
  closest_hill: (curve, hillpaths)->
    hillpath = _.min hillpaths, (h)-> h.position.subtract(curve.position).length
  compute_levels:  (sensitivity = 1.5)->
    path = @_p()
    gauge = @gauge
    # DETECT INTERSECTIONS
    ixts =   _.map _.range(0, path.length, 1), (i)-> 
      pt = path.getPointAt(i)
      c = paper.Path.Circle(pt.clone(), sensitivity)
      intersections = c.getIntersections(path)
      
      if intersections.length == 4
        c.fillColor = "magenta"
        ixt =  
          point: pt
          idx: i
          dom: c
        return ixt
      else
        # c.fillColor = "green"
        c.remove()
        return null
    # RESOLVE COMMON INTERSECTIONS
    ixts =  _.compact ixts
    x = new paper.CompoundPath _.pluck ixts, "dom"
    ixts = x.unite(x)


    # COMPUTE LEVEL BOUNDS
    from = 0
    levels = _.map ixts.children, (ixt, i)->
      pts = path.getIntersections(ixt)
      offsets = _.pluck pts, "offset"
      to = _.max offsets
      l = {level: i, from: from, to: to}
      from = to
      return l
    levels.push {level: levels.length, from: from, to: path.length}

    x.remove()
    ixts.remove()
    
    # ADD HELPER FUNCTIONS
    _.each levels, (l)->
      l.min_height = (l.level) * gauge
      l.max_height = (l.level + 1) * gauge
      l.range_height = l.max_height - l.min_height
      l.inbounds = (offset) -> return if offset >= from and offset < to
      l.get_height = (offset)->
        param = (offset - l.from) / (l.to - l.from) #0 to 1 on subpath
        return l.min_height + (param * l.range_height)

###
Given a heightmap, will generate a new canvas with group scene
and apply it to a high resolution mesh as a texture map.
###
window.debug = null
class window.ShapeProxySTL extends ShapeProxy
  @HEIGHTMAP_RESOLUTION: 1.0
  
  generate_stl: ()->
    scope = this

    # FILL SCREEN AND MOVE TO THE TOP RIGHT CORNER
    paper.view.zoom = 1
    paper.view.update()
    this.g.fitBounds paper.view.bounds
    paper.view.update()
    this.g.pivot = this.g.bounds.topLeft.clone()
    this.g.position = paper.view.bounds.topLeft.clone()
    copy = ()->
      # COPY TO NEW CANVAS
      b = scope.g.bounds
      $('canvas.heightmap').remove()
      hm = $('<canvas>')
        .attr("height", b.height * ShapeProxySTL.HEIGHTMAP_RESOLUTION)
        .attr("width", b.width * ShapeProxySTL.HEIGHTMAP_RESOLUTION)
        .css("stroke", "1px solid black")
        .addClass("heightmap")
        .click ()-> $(this).hide()
        .appendTo $('body')


      src_canvas = $('#main-canvas')[0]
      src_ctx = src_canvas.getContext("2d")

      dst_canvas = hm[0]
      dst_ctx = dst_canvas.getContext("2d")


      console.log "PAPER", src_canvas.width, "x", src_canvas.height
      console.log "DST", dst_canvas.width, "x", dst_canvas.height
      console.log "B", b.width, "x", b.height

      dst_ctx.drawImage src_canvas, 0, 0, b.width, b.height, 0, 0, dst_canvas.width, dst_canvas.height
      window.hm = new Heightmap().fromCanvas($(dst_canvas)) 
      
    _.delay copy, 1000

  make_stl: ()->
  	scope = this
  	window.model = new HeightmapSTL(hm, env, scope.width, scope.height, 0.5, scope.depth, 300)
  
  save_png: ()->
    hm = $('canvas.heightmap')[0]
    hm.toBlob (blob)->
      name = [factory.name.toLowerCase().replace(/ /g, '_'), scope.width.toFixed(1), scope.height.toFixed(1), scope.depth.toFixed(1)].join("_")
      saveAs(blob, name + ".png");
    return