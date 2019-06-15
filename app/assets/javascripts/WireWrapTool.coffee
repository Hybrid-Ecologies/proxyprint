class window.PaperDesignTool
  constructor: (ops)->
    # super ops
    console.log "✓ Paperjs Functionality"
    this.name = "Proxy"
    gui.add this, "name"
    gui.add this, "clear"
    gui.add this, "save_svg"
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
  save_svg: ()->
    prev = paper.view.zoom;
    console.log("Exporting file as SVG");
    zoom = 1;
    paper.view.update();
    exp = paper.project.exportSVG
      asString: true,
      precision: 5
    saveAs(new Blob([exp], {type:"application/svg+xml"}), @name + ".svg")
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
      url: "/primitives/primitives_open_scroll.svg"
      # url: "/primitives/primitives_elegant_elle-1.svg"
      # url: "/primitives/primitives_elegant_elle-1.svg"
      position: paper.view.center
      #   mat = Material.detectMaterial(path)
      #   w = new WirePath(scope.paper, value)




    



  
