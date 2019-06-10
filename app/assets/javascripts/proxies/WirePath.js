WirePath.termination = {
	NONE: 0, 
	EXTEND: 1,
	SPIRAL: 2, 
	COIL_LOOP: 3,
	SIMPLE_LOOP: 4
}
WirePath.weight_profile = {
	NONE: 0,
	UNIFORM: 1, 
	TAPERED: 2,
	UNITAPERED: 3
}

WirePath.baseMaterial = new Material(17, '#999');


function WirePath(paper, path){
	this.id = path.id;
	this.path = path;
	this.path.applyMatrix = true;
	if(!_.isUndefined(this.path.parent)){
		this.path.parent.applyMatrix = true;
	}
	this.path.wire = this;
	this.is_connector = path.name.indexOf('connector') > -1 || path.name.indexOf('three') > -1;
	this.is_gem = path.name.indexOf('bead') > -1;
	this.paper = paper;
	this.terminationA = WirePath.termination.NONE;
	this.terminationB = WirePath.termination.NONE;
	this.material = WirePath.baseMaterial;
	this.weight_profile = WirePath.weight_profile.UNIFORM;
	this.init_bounds = path.bounds.clone().expand(10, 10);
	
	this.selection_rectangle = this.initSelectionRectangle(); 
	this.selection_rectangle.applyMatrix = true;
	this.update();
	this.initDOM();
	this.ref_x = false;
	this.ref_y = false;
}
WirePath.COIL_LOOP_WIDTH = 2;
WirePath.prototype = {
	duplicate: function(){
		var p = this.path.clone();
		var wp = new WirePath(paper, p);
		wp.material = this.material;
		wp.reflect_x = this.reflect_x;
		wp.reflect_y = this.reflect_y;
		wp.path.id = 47;
		wp.path.position.x +=5;
		wp.update();
		return wp;
	},
	reflect_x: function(){
		this.ref_x != this.ref_x;
		this.path.scaling.x *= -1;
		this.paper.view.update();
	},
	reflect_y: function(){
		this.ref_y != this.ref_y;
		this.path.scaling.y *= -1;
		this.paper.view.update();
	},
	remove: function(){
		this.path.remove();
		this.selection_rectangle.remove();
	},
	update: function(){
		var style = this.material.getStyle();
		this.path.style = style;
		

		if(this.terminationB == WirePath.termination.SIMPLE_LOOP){
			var start = this.path.localToGlobal(this.path.getPointAt(0));
			var tangent2f = this.path.getTangentAt(0);
			var loopWidth = Ruler.mm2pts(WirePath.COIL_LOOP_WIDTH)/2 + Ruler.mm2pts(this.material.diameter)/2;
			tangent2f.length = loopWidth;

			var path = new paper.Path.Circle({
			    center: [start.x - tangent2f.x, start.y - tangent2f.y],
			    radius: Ruler.mm2pts(WirePath.COIL_LOOP_WIDTH)
			});
			
			path.style = this.material.getStyle();
		}
		if(this.terminationA == WirePath.termination.SIMPLE_LOOP){
			var start = this.path.localToGlobal(this.path.getPointAt(this.path.length));
			var tangent2f = this.path.getTangentAt(this.path.length);
			var loopWidth = Ruler.mm2pts(WirePath.COIL_LOOP_WIDTH)/2 + Ruler.mm2pts(this.material.diameter)/2;
			tangent2f.length = loopWidth;

			var path = new paper.Path.Circle({
			    center: [start.x + tangent2f.x, start.y + tangent2f.y],
			    radius: Ruler.mm2pts(WirePath.COIL_LOOP_WIDTH),
			    strokeColor: this.material.color,
			    strokeWidth: Ruler.mm2pts(this.material.diameter)
			});
		}

		this.paper.view.update();
		return this;
	},
	initDOM: function(){
		this.dom = {
			materials : WirePath.DOM.find("#materials"),
			terminationA : WirePath.DOM.find("#termination-a"),
			terminationB : WirePath.DOM.find("#termination-b"),
			weight_profile : WirePath.DOM.find("#weight-profile")
		}
	},
	updateDOM: function(){
		var mat_idx = materials.find(this.material);
		this.dom.materials.val(mat_idx);
		this.dom.terminationA.val(this.terminationA);
		this.dom.terminationB.val(this.terminationB);
		this.dom.weight_profile.val(this.weight_profile);
		return this;
	}, 

	initSelectionRectangle: function() {
	    var b = this.path.bounds.clone().expand(10, 10);
	    selectionRectangle = new paper.Path.Rectangle(b);
	    
	   	selectionRectangle.position = b.center.clone();
	 
	    selectionRectangle.pivot = selectionRectangle.position;
	    selectionRectangle.insert(2, new paper.Point(b.center.x, b.top));
	    selectionRectangle.insert(2, new paper.Point(b.center.x, b.top-25));
	    selectionRectangle.insert(2, new paper.Point(b.center.x, b.top));
	    selectionRectangle.strokeWidth = 1;
	    selectionRectangle.strokeColor = '#00A8E1';
	    selectionRectangle.name = "selection rectangle";
	    selectionRectangle.selected = true;
	    selectionRectangle.ppath = this.path;
	    selectionRectangle.wire = this;
	    selectionRectangle.ppath.pivot = selectionRectangle.pivot;
	   	selectionRectangle.remove();


		selectionRectangle.position = this.path.bounds.center.clone();
				
        this.init_size = new paper.Point(b.left, b.bottom).subtract(b.center).length;
	    return selectionRectangle;
	}, 
	updateHandles: function(){
		// var b = this.path.bounds.clone(0).expand(10);
		this.selection_rectangle.remove()
		this.selection_rectangle = this.initSelectionRectangle();
	}
}







