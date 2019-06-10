# var point_manip = null;
#    d88b d888888b  d888b  d8888b. d88888b .d8888. d888888b  d888b  d8b   db d88888b d8888b. 
#    `8P'   `88'   88' Y8b 88  `8D 88'     88'  YP   `88'   88' Y8b 888o  88 88'     88  `8D 
#     88     88    88      88   88 88ooooo `8bo.      88    88      88V8o 88 88ooooo 88oobY' 
#     88     88    88  ooo 88   88 88~~~~~   `Y8b.    88    88  ooo 88 V8o88 88~~~~~ 88`8b   
# db. 88    .88.   88. ~8~ 88  .8D 88.     db   8D   .88.   88. ~8~ 88  V888 88.     88 `88. 
# Y8888P  Y888888P  Y888P  Y8888D' Y88888P `8888Y' Y888888P  Y888P  VP   V8P Y88888P 88   YD 
class HistoryTool
  constructor: (ops)->
    console.log "✓ History Functionality"
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     latest_event = _.max(save_events)
#     @current_save = latest_event
#     return

#   save: ->
#     @toolbox.clearTool()
#     s = Math.floor(Date.now() / 1000)
#     timestamp_key = 'saveevent_' + s
#     console.log 'Timestamp', timestamp_key
#     storage.set timestamp_key, JigExporter.export(@paper, @canvas, JigExporter.JSON, false)
#     @current_save = s
#     return
#   redo: ->
#     @toolbox.clearTool()
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     scope = this
#     rel_events = _.filter(save_events, (t) ->
#       t > scope.current_save
#     )
#     if _.isEmpty(rel_events)
#       console.log 'Can\'t redo...'
#       return
#     @clear()
#     rel_event = _.min(rel_events)
#     console.log 'redoing', rel_event
#     @loadJSON storage.get('saveevent_' + rel_event)
#     @current_save = rel_event
#     return
#   undo: ->
#     @toolbox.clearTool()
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     scope = this
#     rel_events = _.filter(save_events, (t) ->
#       t < scope.current_save
#     )
#     if _.isEmpty(rel_events)
#       console.log 'Can\'t undo...'
#       return
#     @clear()
#     rel_event = _.max(rel_events)
#     @loadJSON storage.get('saveevent_' + rel_event)
#     @current_save = rel_event
#     return
#   revert: ->
#     @toolbox.clearTool()
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     if _.isEmpty(save_events)
#       console.log 'No save events to revert to...'
#       return
#     console.log 'save events', save_events
#     last_event = _.min(save_events)
#     @clear()
#     console.log 'loading json', last_event
#     @loadJSON storage.get('saveevent_' + last_event)
#     @current_save = last_event
#     return
#   clear_history: ->
#     @toolbox.clearTool()
#     storage.clear()
#     @clear()
#     @save()
#     return
#   fast_forward: ->
#     @toolbox.clearTool()
#     save_events = $.map(window.storage.keys(), (el, i) ->
#       flag = el.split('_')[0]
#       time = parseInt(el.split('_')[1])
#       if flag == 'saveevent'
#         return time
#       return
#     )
#     if _.isEmpty(save_events)
#       console.log 'No save events to revert to...'
#       return
#     console.log 'save events', save_events
#     last_event = _.max(save_events)
#     @clear()
#     console.log 'loading json', last_event
#     @loadJSON storage.get('saveevent_' + last_event)
#     @current_save = last_event
#     return

class window.PaperDesignTool extends HistoryTool
  constructor: (ops)->
    super ops
    console.log "✓ Paperjs Functionality"
    @setup(ops)
  setup: (ops)->
    canvas = ops.canvas[0]
    console.log $('#sandbox').height()
    $(canvas)
      .attr('width', $("#sandbox").width())
      .attr('height', $("#sandbox").height())
    window.paper = new paper.PaperScope
    paper.setup canvas
    paper.view.zoom = 2.5
    paper.tool = new paper.Tool
      name: "default_tool"
    $(canvas)
      .attr('width', $("#sandbox").width())
      .attr('height', $("#sandbox").height())
    @toolEvents()
  toolEvents: ()-> return
  ungroup: (g)->
    _.each g.children, (child)->
      paper.project.activeLayer.appendTop(child)
  @saveAs: (filename)->
    prev = paper.view.zoom;
    console.log("Exporting file as SVG");
    zoom = 1;
    paper.view.update();
    exp = paper.project.exportSVG
      asString: true,
      precision: 5
    saveAs(new Blob([exp], {type:"application/svg+xml"}), filename + ".svg")
    paper.view.zoom = prev
  clear: ->
    paper.project.clear()

class window.WireWrapTool extends PaperDesignTool
  @ROTATE_STEP: 15
  @TRANSLATE_STEP: 10
  
  ### 
  To inherit parent class functionality, super ops must be the first line.
  This class hosts the logic for taking SVG Paths and interpreting them as wires.
  ###
  constructor: (ops)->
    super ops
    console.log "✓ WireWrap Functionality"
    @test_addSVG()
  ###
  Binds hotkeys to wire operations. 
  Overrides default tool events from PaperDesignTool.
  ###
  toolEvents: ()->
    scope = this
    hitOptions = 
      class: paper.Path
      stroke: true
      tolerance: 15
    
    paper.tool.set 
      onKeyDown: (event) ->
        paths = paper.project.selectedItems

        # DELETE ACTIONS
        if event.key == 'g'
          _.each paths, (p)->
            new ShapeProxySTL(p)
        if event.key == '-' or event.key == 'backspace'
          _.each paths, (p)->
            p.remove()
        # DUPLICATION & REFLECTION
        if event.key == 'd'
          _.each paths, (p)->
            dp = p.clone_wire()
            dp.translate new paper.Point WireWrapTool.TRANSLATE_STEP, -WireWrapTool.TRANSLATE_STEP
            p.selected = false
        if event.key == 'r'
          if not event.modifiers.meta 
            _.each paths, (p)->
              p.reflect_x()
        if event.key == 'y'
          _.each paths, (p)->
            p.reflect_y()
        # ROTATION & SCALING ACTIONS
        if event.modifiers.shift
          if event.key == "left"
            _.each paths, (p)->
              p.rotate(-WireWrapTool.ROTATE_STEP)
          if event.key == "right"
            _.each paths, (p)->
              p.rotate(WireWrapTool.ROTATE_STEP)
          if event.key == "up"
            _.each paths, (p)->
              p.scale(1.1)
          if event.key == "down"
            _.each paths, (p)->
              p.scale(1/1.1)
        # TRANSLATION ACTIONS
        else
          if event.key == "up"
            paths = paper.project.selectedItems
            _.each paths, (p)->
              p.translate(0, -WireWrapTool.TRANSLATE_STEP)
          if event.key == "down"
            paths = paper.project.selectedItems
            _.each paths, (p)->
              p.translate(0, WireWrapTool.TRANSLATE_STEP)
          if event.key == "right"
            paths = paper.project.selectedItems
            _.each paths, (p)->
              p.translate(WireWrapTool.TRANSLATE_STEP, 0)
          if event.key == "left"
            paths = paper.project.selectedItems
            _.each paths, (p)->
              p.translate(-WireWrapTool.TRANSLATE_STEP, 0)


      onMouseDown: (event)->
        hitResults = paper.project.hitTest event.point, hitOptions
        if not hitResults
          paper.project.deselectAll()

  ###
  Handles all wire related interactions.
  ###
  wirefy: (p)->
    scope = this
    p.set
      name: "WirePath"
      setMaterial: (material)->
        this.style = material.getStyle()
      onMouseDown: (e)->
        this.touched = true
        return
      onMouseDrag: (e)->
        if this.touched
          this.dragged = true
          this.selected = true
          this.position = this.position.add(e.delta)
      onMouseUp: (e)->
        this.touched = false
        if not this.dragged
          this.selected = not this.selected
        this.dragged = false
        return
      reflect_x: ()->
        this.scaling.x *= -1
      reflect_y: ()->
        this.scaling.y *= -1
      clone_wire: ()->
        return scope.wirefy(this.clone())
    return p

  ###
  Given an SVG asset url, the extracts all Path objects to the topmost
  level of the SVG graph. Other groups are removed. 
  ops = 
    url: url of the SVG asset (string, required)
    position: where to place paths (paper.Point, default: paper.view.center)
  ###
  addSVG: (ops)->
    scope = this

    # POSITION HANDLING
    if not ops.position
      ops.position = paper.view.center
    ops.position = ops.position.clone()

    paper.project.importSVG ops.url, 
      expandShapes: true
      insert: false
      onError: (item)->
        alertify.error "Could not load", ops.url
      onLoad: (item) ->  
        # Extract Path Elements
        paths = item.getItems {className: "Path"}
        # Attach to Temporary Group and Release
        g = new paper.Group
          name: "temp"
        _.each paths, (p)-> p.parent = g
        g.set {position: ops.position}
        scope.ungroup(g)
        # Stylize on Active Material

        # Add Interactivity
        _.each paths, (p)-> scope.wirefy(p)

  ###
  Test: Places SVG asset on canvas with full wire interactivity.
  ###
  test_addSVG: ()->
    scope = this
    @addSVG
      # url: "/primitives/primitives_open_scroll.svg"
      url: "/primitives/primitives_elegant_elle-1.svg"
      position: paper.view.center
      #   mat = Material.detectMaterial(path)
      #   w = new WirePath(scope.paper, value)

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
    path.visible = false
    path.selected = false
    path.remove()
    p = x
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
    @levels = @compute_levels()

    @generate_walls()
    @hill_climb()
    @anchor_holes()
    @scale_walls()
    
    
    @add_bg()
    
    @normalize_heights()
    
    @_p().remove()
    @update_dimensions()

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
      window.model = new HeightmapSTL(window.hm, env, scope.width, scope.height, 0.5, scope.depth, 300)
      $('.threejs-container').show()
    _.delay copy, 1000
  
  save_png: ()->
    hm = $('canvas.heightmap')[0]
    hm.toBlob (blob)->
      name = [design.name.toLowerCase().replace(/ /g, '_'), scope.width.toFixed(1), scope.height.toFixed(1), scope.depth.toFixed(1)].join("_")
      saveAs(blob, name + ".png");
    return


    



  
