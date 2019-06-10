function ConnectorJig(){};
ConnectorJig.RAISE_RATIO = 0.5; 
ConnectorJig.WALL_THICKNESS = Ruler.mm2pts(2);
ConnectorJig.TOLERANCE = -0.05;
ConnectorJig.BASE_RATIO = 0.2;

var intersectsT; var intersectsB;
ConnectorJig.make = function(factory){
		var scope = factory;
		scope.connectors = _.filter(scope.wirepaths.wires, function(el){
			return el.is_connector && !el.is_gem;
		});
		console.log(this.connectors);
		scope.gems = _.filter(scope.wirepaths.wires, function(el){
			return el.is_gem && !el.is_connector;
		});


		scope.paths = _.filter(scope.wirepaths.wires, function(el){
			return !el.is_connector && !el.is_gem;
		});
		
		_.each(scope.gems, function(el){
			el.path.remove();
		});

		
		_.each(scope.connectors, function(el){
			console.log(el)
			el.path.remove();

		});
		_.each(scope.paths, function(el){
			console.log("mm make");
			ConnectorJig.mountain_make(el.path, 1.0, true);
			ConnectorJig.mountain_make(el.path, 1.0, false);
			el.path.style.shadowBlur = 0;
			el.path.remove();
		});
		ConnectorJig.pressfit(scope.connectors, scope.paths);
		
		ConnectorJig.make_base();
		scope.paper.project.view.update();
}
ConnectorJig.make_base = function(){
	bg = MountainPath.addBackground(factory.wirepaths.bounds().bounds);
	bg.style = {
		fillColor: new paper.Color(ConnectorJig.BASE_RATIO)
	}
	bg.sendToBack();
}
ConnectorJig.mountain_make = function(path, gray, inner_1_outer_0){
	path_width = path.style.strokeWidth;
	
	var paths_orig = JigClipper.offset(path, 0);
	paths_orig = paths_orig[0];
	// e is the inner, b is the outer
	if(inner_1_outer_0){
		var paths_outer = JigClipper.offset(paths_orig, (-path_width/2) - path_width * ConnectorJig.TOLERANCE);
		var paths_inner = JigClipper.offset(paths_orig, (-path_width/2) - ConnectorJig.WALL_THICKNESS);
	}else{
		var paths_inner = JigClipper.offset(paths_orig, (path_width/2) + path_width * ConnectorJig.TOLERANCE);
		var paths_outer = JigClipper.offset(paths_orig, (path_width/2) + ConnectorJig.WALL_THICKNESS);
	}

	var original_start = path.firstSegment.point;
	var original_end = path.segments[path.segments.length - 1].point;
	
	
	_.each(paths_outer, function(el, i, arr){
		MountainPath.path_reorder(el, original_end);
		el.bringToFront();
	});

	_.each(paths_inner, function(el, i, arr){
		el.style = MountainPath.construction_style(make_id/5);
		MountainPath.path_reorder(el, original_start, true);
		el.bringToFront();
	});
	var cp_children = [paths_outer[0], paths_inner[0]];
		
	var cp = new paper.CompoundPath({
		children: cp_children, 
		fillColor: new paper.Color(1.0)
	});
	cp.sendToBack();
		
	paths_orig.remove();
	make_id ++;
}

ConnectorJig.RESOLUTION = 1;
ConnectorJig.pressfit = function(connectors, paths){
	_.each(connectors, function(el, i){
			var b = el.path.bounds;
			var r = Math.max(b.height, b.width)/2;
			var c = this.paper.Path.Circle(el.path.position, r * 1.8);
			c.style = {
				fillColor: new paper.Color(0), 
				strokeColor: "black"
			};
			c.bringToFront();


			el.path.remove();
			var intersects = ConnectorJig.getAllIntersections(c, paths);
			
		
			intersects = _.map(intersects, function(el, i, arr){
				var path_id = el.path.id;
				var idx = el.offset;
				return {path_id: path_id, idx: idx};
			});
			
			intersects = _.groupBy(intersects, function(el, i, arr){
				return el.path_id;
			});
			intersects = _.each(intersects, function(el, i, arr){
				var e = _.map(el, function(el2, i, arr){
					return el2.idx;
				});
				arr[i] = _.sortBy(e, function(v){return v;});
			});

			

			_.each(intersects, function(el, i, arr){
				var path = factory.wirepaths.at(i).path;
			});
		});
}
ConnectorJig.make_sub_path = function(path, n0, n1){
	// console.log(n0.toFixed(2), n1.toFixed(2));
	if(_.isNaN(n1)) throw "N1 is isUndefined";
	if(n1 == n0) return; 
	var path = path.clone();
	// var n = path.length;

	// var pts = [];
	// for(var i = n0; i < n1; i += ConnectorJig.RESOLUTION){
	// 	pts.push(path.getPointAt(i).clone());
	// }

	// prev_pt = pts[0];
	path.style.shadowColor = null;
	path.style.shadowOffset = 0;
	path.style.shadowBlur = 0;
	var path2 = path.split(n0);
	path2.style.strokeColor = new paper.Color(ConnectorJig.RAISE_RATIO);
	var n05 = n1 - n0;

	var path3 = path2.split(n05);
	// console.log(path3);
	if(path3){
		path3.style.strokeColor = "green"; //new paper.Color(0.1);
		path3.sendToBack();
		path3.remove();
	} else{
		path2.selected = true;
	}
	
	path.style.strokeColor = "blue"; //new paper.Color(0.1);
	path.sendToBack();
	path.remove()
	// // mini = new paper.Path(pts);
	// // // mini.closed = false;
	// // // mini.style.strokeWidth = path.style.strokeWidth;
	// // mini.visible = true;
	// mini.strokeColor = "yellow";

	// MountainPath.mountain_make(mini, (1.0 - max_height) + (1.0 - MountainPath.MAX_MOUNTAIN_PATH_HEIGHT_RATIO));
	paper.view.update();
	// return mini;
}

ConnectorJig.getAllIntersections = function(path, wires){
	intersections = _.reduce(wires, function(memo, el){
		var a = el.path.getIntersections(path);
		if(a.length > 0)
			memo.push(a);
		return memo;
	}, []);
	return _.flatten(intersections);
}





