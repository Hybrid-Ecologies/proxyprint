// path_features.js

function derive(path){
	var x = mapPath(path, function(pt){
		return pt.x;
	});
	var y = mapPath(path, function(pt){
		return pt.y;
	});

	dx = _.map(x, function(el, i, arr){
		if(i + 1 < arr.length)
			return arr[i + 1] - el;
	});

	dy = _.map(y, function(el, i, arr){
		if(i + 1 < arr.length)
			return arr[i + 1] - el;
	});

	dxx = _.map(dx, function(el, i, arr){
		if(i + 1 < arr.length)
			return arr[i + 1] - el;
	});

	dyy = _.map(dy, function(el, i, arr){
		if(i + 1 < arr.length)
			return arr[i + 1] - el;
	});
	
	return {x: x, y: y, dx: dx, dy: dy, dxx: dxx, dyy: dyy};
}

//min/max filter

first_derivative = function(path, stats){
	pts = [];
	// min/max of first derivative
	// console.log(dx);
	var epsilon = 0.15;
	for(var i in stats.dx){
		if(Math.abs(stats.dx[i]) < epsilon ||  Math.abs(stats.dy[i]) < epsilon){
			var pt = new paper.Point(stats.x[i], stats.y[i]);
			
			var c = paper.Path.Circle(pt, 2);
			c.style = {
				fillColor: "blue"
			}
			c.bringToFront()
			pts.push({point: pt, idx: i, type: "x", dom: c});
		}
	}
	return pts;
}
second_derivative = function(path, stats){
	pts = [];
	// min/max of first derivative
	// console.log(dx);
	var epsilon = 0.001;
	for(var i in stats.dxx){
		if(Math.abs(stats.dxx[i]) < epsilon && Math.abs(stats.dyy[i]) < epsilon){
			var pt = new paper.Point(stats.x[i], stats.y[i]);
			
			var c = paper.Path.Circle(pt, 1);
			c.style = {
				fillColor: "yellow"
			}
			pts.push({point: pt, idx: i, type: "xx", dom: c});
		}
	}
	return pts;
}
find_clocks = function(path){
	var	pts = [];
	for(var i = 0; i < path.length; i += MountainPath.RESOLUTION){
		pts.push(path.getPointAt(i).clone());
	}

	prev_pt = pts[0];
	clockwise = _.map(pts, function(el, i, arr){
		if(i == 0 || i + 1 >= arr.length) return 0;
		
		var next_pt = arr[i+1];
		A = subPoints(next_pt, el);
		B = subPoints(el, prev_pt);
		
		var dist = A.cross(B) / (A.length * B.length);	
		// var c = new paper.Path.Circle(el.clone(), 3);
		
		var epsilon = 0.050;
		var sign = Math.sign(dist);
		// console.log(dist, sign);
		if(Math.abs(dist) < epsilon){
			return dist;
		}
		
		if(dist > 0){
			// c.fillColor = "yellow";
			prev_pt = el;
			return dist;
		}else{
			// c.fillColor = "purple";
			prev_pt = el;
			return dist;
		}
		
	});
	pts = [];
	curves = extract_curve_points(clockwise);
	for(var i in curves){
		var pt = path.getPointAt(curves[i]);
		var c = new paper.Path.Circle(pt.clone(), 3);
		c.fillColor = "blue";
		pts.push({point: pt, idx: curves[i], type: "curvature", dom: c});
	}
	return pts;

}

function avg_kernel(s){
	k = [];
	for(var i = 0; i < s; i++) k.push(1/s);
	return k;
}

function extract_curve_points(clockwise){
	result = conv(clockwise, avg_kernel(9));
	result = conv(clockwise, avg_kernel(3));
	cut = 0.01;
	result = _.map(result, function(el, i, arr){
		if(el > cut) return 1;
		if(el <= cut && el >= -cut) return 0;
		if(el < -cut) return -1;
	});	
	result = conv(result, [-1, 1]);
	result = _.map(result, function(el, i, arr){
		if(el != 0) return i - 2;
	})
	result = _.compact(result);	

	// console.log(JSON.stringify(result));
	return result;
	// console.log(pts);
}
function conv(vec1, vec2){
    var disp = 0; // displacement given after each vector multiplication by element of another vector
    var convVec = [];
    // for first multiplication
    for (j = 0; j < vec2.length ; j++){
        convVec.push(vec1[0] * vec2[j]);
    }
    disp = disp + 1;
    for (i = 1; i < vec1.length ; i++){
        for (j = 0; j < vec2.length ; j++){
            if ((disp + j) !== convVec.length){
                convVec[disp + j] = convVec[disp + j] + (vec1[i] * vec2[j])
            }
            else{
                convVec.push(vec1[i] * vec2[j]);
            }
        }
        disp = disp + 1;
    }
    return convVec;
}

// LOGIC for wall creation
entering_loop = false;
function segment_path(path, clean_pts, startGray, endGray){

	var start = 0; 
	var count = 0;
	var end, el;
	for(var i in clean_pts){
		el = clean_pts[i];	
		// console.log(path.name, el.type);

		if(el.type == "intersection" && !entering_loop){
			entering_loop = true;
			// console.log("entering");
		}
		else if(el.type == "intersection" && entering_loop){
			entering_loop = false;
			// console.log("exiting");
		}
		// count == 4 || 
		if(el.type == "intersection" || (entering_loop == false && el.type =="curvature")){
			end = el.idx;
			// console.log("PT ID:", i, el.idx, el.type);
			MountainPath.interior_wall_path(path, parseInt(start), parseInt(end), startGray, endGray);
			
			count = 0;
			start = el.idx;
		}
		count++;
	};
	
	MountainPath.interior_wall_path(path, parseInt(start), parseInt(el.idx), startGray, endGray);

}


find_self_intersections = function(path, sensitivity){
	var pts = [];
	for(var i = 0; i < path.length; i++){
		var pt = path.getPointAt(i);
		
		var c = paper.Path.Circle(pt.clone(), sensitivity);
		// c.strokeColor = "black";
		var intersections = c.getIntersections(path);
		if(intersections.length == 4){
			c.fillColor = "magenta";
			pts.push({point: pt, idx: i, type: "intersection", dom: c});
		}
	}
	return pts;
}




ends = function(path){
	var pts = [];
	var pt = path.getPointAt(0)
	var c = paper.Path.Circle(pt, 4);
	c.style = {
		fillColor: "green"
	}
	pts.push({point: pt.clone(), idx: 0, type: "start", dom: c}); 

	var pt = path.getPointAt(path.length);
	var c = paper.Path.Circle(pt, 3);
	c.style = {
		fillColor: "red"
	}
	c.bringToFront(0);
	pts.push({point: pt.clone(), idx: path.length, type: "end", dom: c}); 
	return pts;
}


function distance_threshold(path, pts, threshold){
	var el0 = pts[0];
	var p0 = el0.point;

	pts = _.filter(pts, function(el, i, arr){
		
		var pt = el.point;
		var dist = pt.getDistance(p0, 2);
		
		
		var far_away = dist > threshold || el.type == "start";
		if(!far_away) { 
			el.dom.fillColor = "purple"; 
			// console.log("dist", el.type);
			el.dom.remove();
		} else{
			p0 = pt;
		}
		
		return far_away;
	});
	
	return pts;

}


function angle_threshold(path, pts, threshold){
	var el0 = pts[0];
	var angle0 = path.getTangentAt(el0.idx).angle;
	pts = _.filter(pts, function(el, i, arr){
		// console.log("ang", el.type)
		var angle = path.getTangentAt(el.idx).angle;
		var diff = Math.abs(angle - angle0);
		if(el.type == "start") el.dom.selected = true;
		// console.log(diff, path.name, el.type);
		// console.log(diff > threshold || i == 0 || i == arr.length - 1, angle - angle0);
		
		
		var curved =  diff > threshold || el.type == "intersection" || el.type == "start";
		// var curved = (i == 0 || diff > threshold);
		// || i == arr.length - 1 
		if(!curved){
			// el.dom.fillColor = "orange"; 
			// console.log("removed");
			el.dom.remove();
			// el.dom.fillColor = "white";
		} else{
			angle0 = angle;
		}
		return curved;
	});
	// console.log("ang thres", pts.length);
	
	return pts;

}


// UTILITY
function mapPath(path, fn){
	pts = [];
	for(var i = 0; i < path.length; i += MountainPath.RESOLUTION){
		pts.push(fn(path.getPointAt(i)));
	}
	return pts;
}

// clockwise = _.reduce(pts, function(memo, el, i, arr){
	// 	if(i == 0 || i + 1 >= arr.length) return memo;
		
	// 	var next_pt = arr[i+1];
	// 	A = subPoints(next_pt, el);
	// 	B = subPoints(el, prev_pt);
		
	// 	var dist = A.cross(B) / (A.length * B.length);	
	// 	console.log(dist);
	// 	prev_pt = el;
	// 	return memo + dist;
	// }, 0);

	// console.log("N", n0, n1, clockwise, clockwise > 0);

