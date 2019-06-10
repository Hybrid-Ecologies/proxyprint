

var values = {
	paths: 5,
	minPoints: 5,
	maxPoints: 15,
	minRadius: 30,
	maxRadius: 90
};

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};

var selectionRectangleScale=null;
var selectionRectangleScaleNormalized=null;
var selectionRectangleRotation=null;

var segment, path, selectionRectangleSegment;
var movePath = false;


function MultiSelectTool(paper){
	this.paper = paper;

	this.copy_mode = false;

	this.selectedStroke = [];
	this.activeSelectionRectangle = null;

	this.tool = new paper.Tool();

	this.multiRect = null;

	var scope = this;

	this.tool.onMouseDown = function(event){
		// alert("multi");
		segment = path = null;
		var hitResult = paper.project.hitTest(event.point, hitOptions);
		scope.multiOrig = event.point.clone();
		scope.multiRect = new paper.Path.Rectangle({
			point: event.point.clone(),
			size: [10, 10],
			strokeColor: "black"
		});


		if (!hitResult){
			scope.clear();
			return;
		}
		
		if (hitResult) {
			console.log("MD", hitResult.type, hitResult.item.name);
			path = hitResult.item;

			if(!_.isNull(scope.activeSelectionRectangle) && scope.activeSelectionRectangle.id != path.id && scope.selectedStroke.id != path.id){
				scope.activeSelectionRectangle.remove();
				scope.activeSelectionRectangle = null;	
			}	


			if(_.isNull(scope.activeSelectionRectangle)){

			}
			if((hitResult.type == "stroke" || hitResult.type == "segment") && path.name != "selection rectangle"){ //&& {
				
			}

			if (hitResult.type == 'segment') {
				if(scope.activeSelectionRectangle != null && path.name == "selection rectangle")
				{
	                console.log('selectionRectangle');
	                if(hitResult.segment.index >= 2 && hitResult.segment.index <= 4)
	                {
	                    selectionRectangleRotation = 0;
	                }
	                else{
						selectionRectangleScale =  0;
	                }
				}
	            else
	                segment = hitResult.segment;
			} 
		}
	
	}

	// this.tool.onMouseMove = function(event){
	// 	paper.project.activeLayer.selected = false;
	// 	if (event.item)
	// 	{
	// 		event.item.selected = true;
	// 	}
	//     if(scope.activeSelectionRectangle)
	//         scope.activeSelectionRectangle.selected = true;
	// }

	this.tool.onMouseUp = function(event){
		if(scope.multiRect != null){

			var wires = _.map(factory.wirepaths.wires, function(el, i, arr){
				return el.path;
			});
		
			var intersects = _.reduce(wires, function(memo, el, i, arr){
				memo.push(el.getIntersections(scope.multiRect));
				return memo;
			}, []);

			intersects = _.flatten(intersects);

			intersects = _.map(intersects, function(el, i, arr){
				return el.getPath();
			});

			var insides = _.reduce(wires, function(memo, el, i, arr){
				console.log(el.isInside(scope.multiRect.bounds));
				if(el.isInside(scope.multiRect.bounds))
					memo.push(el);
				return memo;
			}, []);
			var all = _.flatten([intersects, insides]);

			intersects = _.each(all, function(el, i, arr){
				el.selected = true;
			});
			console.log("all", all);
			scope.multiRect.remove();
		}
    	scope.update();		
	}

	this.tool.onMouseDrag = function(event){
		if(scope.multiRect != null){
			var b = scope.multiRect.bounds;
			var s = subPoints(event.point, scope.multiOrig);
			scope.multiRect.remove();
			scope.multiRect = new paper.Path.Rectangle({
				point: scope.multiOrig,
				size: [s.x,s.y],
				strokeColor: "black"
			});
		}
		if (selectionRectangleScale!=null)
		{	
			var path_bounds = scope.activeSelectionRectangle.ppath.bounds.clone();//.expand(10);         
			var diag = event.point.subtract(path_bounds.center.clone()).length;
			var init_diag =  scope.activeSelectionRectangle.wire.init_size;
			
			var ratio = diag/init_diag;
			// var ref_x = scope.activeSelectionRectangle.wire.ref_x ? -1 : 1;
			// var ref_y = scope.activeSelectionRectangle.wire.ref_y ? -1 : 1;
			// console.log("xref", ref_x, "yref", ref_y);


			var rect_ratio = ratio;
			rect_ratio /= scope.activeSelectionRectangle.prevScale.x;
			
		

	        scaling = new paper.Point(ratio, ratio );
	        rect_scaling = new paper.Point(rect_ratio, rect_ratio);

	        scope.activeSelectionRectangle.scaling = rect_scaling;
	        scope.activeSelectionRectangle.ppath.scaling = scaling;
	        return;
		}
		else if(selectionRectangleRotation!=null)
		{
	        rotation = event.point.subtract(selectionRectangle.pivot).angle + 90;
	        scope.activeSelectionRectangle.ppath.rotation = rotation;
	        scope.activeSelectionRectangle.rotation = rotation - scope.activeSelectionRectangle.prevRot ;
	        return;
		}


		if(!_.isNull(scope.activeSelectionRectangle)){
		  scope.activeSelectionRectangle.position.x += event.delta.x;
		  scope.activeSelectionRectangle.position.y += event.delta.y;
		}
		if(!_.isNull(scope.selectedStroke)){
		  scope.selectedStroke.position.x += event.delta.x;
		  scope.selectedStroke.position.y += event.delta.y;
		}
		scope.update();
	}		
}


MultiSelectTool.prototype = {
	update: function(){
		this.paper.view.update();
	}, 
	clear: function(){
		console.log("clearing");
		if(!_.isNull(this.activeSelectionRectangle)){
        	this.activeSelectionRectangle.remove();
        	this.activeSelectionRectangle = null;
        	// this.selectAll(false);
			this.selectedStroke = null;
        }
		this.selectedStroke = null;
	},
	selectAll: function(flag){
		this.paper.project.activeLayer.selected = flag;
	}, 
	setSVG: function(svg){
		this.svg = svg;
	}
}