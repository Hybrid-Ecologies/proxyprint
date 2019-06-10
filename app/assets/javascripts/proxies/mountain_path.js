var MountainPath = {};

MountainPath.RESOLUTION = JigClipper.RESOLUTION;
MountainPath.WALL_HEIGHT = 10; //mm                                            
 
MountainPath.SCALE = 100;
MountainPath.TOLERANCE = 0.001; //0.1
MountainPath.WALL_THICKNESS = Ruler.mm2pts(10);//mm
MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO = 0.6;
MountainPath.PT_TOLERANCE = 1;



MountainPath.viz_turns = function(path, turns){
	console.log(turns);
	for(var i in turns){
		var segment = turns[i];
		var mini_start = path.getPointAt(segment.start);
		var mini_end = path.getPointAt(segment.end - 1);

		var q = new paper.Path.Circle(mini_start, 0.5);
			    	q.fillColor = 'green';
			    	q.visible = true;
			    	q.bringToFront();
		var q = new paper.Path.Circle(mini_end ,0.5);
			    	q.fillColor = 'blue';
			    	q.visible = true;
			    	q.bringToFront();

	}
	
}

MountainPath.wall_make = function(path, start, end){ 
	// stats = derive(path);
	// fd = first_derivative(path, stats);
	// sd = second_derivative(path, stats);
	clocks = find_clocks(path);
	intersects = find_self_intersections(path, 1.5);
	e = ends(path);

	var pts = _.flatten([intersects, clocks, e]);


	pts = _.sortBy(pts, function(el, i, arr){ return parseInt(el.idx);});
	pts = distance_threshold(path, pts, MountainPath.PT_TOLERANCE);
	// console.log(pts);
	pts = angle_threshold(path, pts, 10.0);
	
	// DEBUG POINTS
	_.each(pts, function(el, i, arr){ el.dom.remove(); });
	// _.each(pts, function(el, i, arr){ console.log("#" + (i + 1), el.type, el.idx) });

	segment_path(path, pts, start, end);
}
var mini;

MountainPath.add_holey_ends = function(path, start, end){
	
	var hole_at_start = paper.Path.Circle({
		position: path.getPointAt(path.length), 
		radius: path.style.strokeWidth * 1.1, 
		fillColor: new paper.Color(0), 
		strokeColor: new paper.Color(start + 0.05), 
		strokeWidth: 3});
	
	var base_at_end = paper.Path.Circle({
		position: path.getPointAt(0), 
		radius: path.style.strokeWidth * 1.1, 
		fillColor: new paper.Color(end), 
		strokeColor: new paper.Color(end + 0.05), 
		strokeWidth: 1
	});
	base_at_end.bringToFront();

}
MountainPath.interior_wall_path = function(path, n0, n1, start, end){
	console.log("wall", start, end);
	if(_.isNaN(n1)) throw "N1 is isUndefined";
	if(n1 - n0 < 5) return; 

	var n = path.length;
	
	var norm_n0 = n0/n;
	var norm_n1 = n1/n;
	if(norm_n1 > 1) return;
	var max_height = norm_n1 * MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO;

	var pts = [];
	for(var i = n0; i < n1; i += MountainPath.RESOLUTION){
		pts.push(path.getPointAt(i).clone());
	}




	prev_pt = pts[0];
		


	mini = new paper.Path(pts);
	// mini.closed = false;
	// mini.style.strokeWidth = path.style.strokeWidth;
	mini.visible = true;
	mini.strokeColor = "yellow";

	MountainPath.mountain_make(mini, (1 - max_height) * 1.5);
	paper.view.update();
	return mini;
}

	
	
var make_id = 0;
// This method construct a wall from a given path, raised by gray [0, 1]
MountainPath.mountain_make = function(path, gray){
	console.log("Gray", gray);
	// console.log("mm", path);
	path_width = path.style.strokeWidth;
	

	// e is the inner, b is the outer
	
	var paths_outer = JigClipper.offset(path, (-path_width/2) - path_width * MountainPath.TOLERANCE);
	var paths_inner = JigClipper.offset(path, (-path_width/2) - MountainPath.WALL_THICKNESS);


	var original_start = path.firstSegment.point;
	var original_end = path.segments[path.segments.length - 1].point;
	
	
	_.each(paths_outer, function(el, i, arr){
		// el.style = MountainPath.construction_style(make_id/5);
		MountainPath.path_reorder(el, original_end);
		el.closed = false;
		el.style.strokeColor = "white";
		// el.strokeWidth = 1;
		el.style = MountainPath.heightmap_style(gray);
		// el.bringToFront();
	});

	_.each(paths_inner, function(el, i, arr){
		el.style = MountainPath.construction_style(make_id/5);
		MountainPath.path_reorder(el, original_start, true);
		el.closed = false;
		el.bringToFront();


			el.removeSegments(0, el.firstSegment.index + 5);
			el.reverse();
			var outer = paths_outer[0];
			if(outer){
				outer.removeSegments(0, outer.firstSegment.index + 5);
				outer.addSegments(el.removeSegments());
				outer.closePath();
				outer.sendToBack();
				outer.style = MountainPath.heightmap_style(gray);
			}
			else{
				console.log("NO OUTER", el, i);
			}
	});
	
	make_id ++;
}


MountainPath.wire_path = function(path, start, end){ 
	var n = path.length;
	console.log("making mountain path", n);
	var range = end - start;
	var group = new paper.Group();
	for(var i = 0; i < n; i += MountainPath.RESOLUTION){
			var normalizedPosition = 1 - i/n;

			var point = path.getPointAt(i);
			var normal = path.getNormalAt(i);
		
			var width = path.style.strokeWidth;
			normal.length = width/2 + width * MountainPath.TOLERANCE;

			//mountain path
			var result = addPoints(point, normal);
			normal.length = normal.length * 2 ;
			var result2 = subPoints(point, normal);
			
			var line = new paper.Path({
		        segments: [result2, result],
		        strokeWidth: width,
		        strokeColor: new paper.Color(normalizedPosition * range + start)
		    });
			group.addChild(line);
		    line.bringToFront();

		  
	}
	// group.bringToFront();
}


MountainPath.path_reorder = function(path, ref_pt){

	var orig = path.getNearestPoint(ref_pt);
	curve = path.getLocationOf(orig);
	
  	wrap_around = path.removeSegments(0, curve.segment.index - 1);
  	path.addSegments(wrap_around);
  	return path;
}


MountainPath.construction_style = function(val){ 
	if(_.isUndefined(val)) val = "#666";
	else val = new paper.Color(val);

	return {
		strokeWidth: 1, 
		strokeColor: val
	}
}

MountainPath.heightmap_style = function(gray){ 
	var color = new paper.Color(gray)
	// color.hue = gray * 520;
	// color.saturation = 1.0;
	// color.brightness = 1;
	return {
		strokeWidth: 0, 
		fillColor: color, 
	}
}


MountainPath.addBackground = function(rectangle){
		var bg = new paper.Path.Rectangle(rectangle);
		bg.fillColor = new paper.Color(0);
		bg.sendToBack();	
		return bg;
}