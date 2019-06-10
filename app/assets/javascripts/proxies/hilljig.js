// hilljig generator
var jigpath;   
                                                                                                
                           
function HillJig(container, svg){
	this.paper;
	this.container = container;
	this.svg = svg;
	this.gui = new dat.GUI();
	this.gauge = 14;
	this.product = "HillJig";
	this.controllers_defined = false;
	this.loadFromLocalStorage = true;
	this.loadedFromLocal = false;
	this.wirepaths = new Wires();
	// this.factor = 500 / Ruler.convert(config.size, "mm");
	this.init();
	var loadLSController = this.gui.add(this, "loadFromLocalStorage");
	var removeConnectors = this.gui.add(this, "hilljig_make");
	var removeConnectors = this.gui.add(this, "mandril_make");
	var removeConnectors = this.gui.add(this, "ring_make");
	var holdMaker = this.gui.add(this, "hold_make");
	productController = this.gui.add(this, "product", ["HillJig"]);

	this.gui.add(this.paper.view, "zoom", 0.2, 4).step(0.1);
	var gaugeController = this.gui.add(this, "gauge", 10, 30).step(1);
	var scope = this;
	productController.onChange(function(){ scope.update();});
	gaugeController.onChange(function(){ scope.update();});
	loadLSController.onChange(function(){ scope.loadingFromLocalStorage(); });
	$('.close-button').click();
	
}

function lengthen_path(path){
	// EXTEND CURVATURE
	var curve_extend = 10;
	var curve_jump = 3;
	// for(var l = 0; l < curve_extend; l += curve_jump){
	// 	var start = path.getPointAt(0);
	// 	var tan = path.getTangentAt(0);

	// 	tan.length = curve_jump;
	// 	var tail = subPoints(start, tan);
	// 	tail.angle = tail.angle + 0.75;
	// 	// tail.length = 1;
	// 	path.insert(0, tail);
	// }

	for(var l = 0; l < curve_extend; l+= curve_jump){
		var start = path.getPointAt(path.length);
		var tan = path.getTangentAt(path.length);
		tan.length = curve_jump;
		var tail = addPoints(start, tan);
		tail.angle = tail.angle + 0.35;
		path.add(tail);
	}

	// // // EXTEND END
	var tail_extend = 10;
	var tail_jump = 1;

	// for(var l = 0; l < 2; l += tail_jump){
	// 	var start = path.getPointAt(0);
	// 	var tan = path.getTangentAt(0);

	// 	tan.length = tail_jump;
	// 	var tail = subPoints(start, tan);
	// 	// tail.angle = tail.angle - 0.35;
		
	// 	path.insert(0, tail);

	// }

	for(var l = 0; l < tail_extend; l+= tail_jump){
		var start = path.getPointAt(path.length);
		var tan = path.getTangentAt(path.length);
		tan.length = tail_jump;
		var tail = addPoints(start, tan);
		path.add(tail);
	}
}
HillJig.prototype = {
	mandril_make: function(){
		var scope = this;
		this.connectors = _.filter(this.wirepaths.wires, function(el){
			return el.is_connector && !el.is_gem;
		});
		this.gems = _.filter(this.wirepaths.wires, function(el){
			return el.is_gem && !el.is_connector;
		});
		this.paths = _.filter(this.wirepaths.wires, function(el){
			return !el.is_connector && !el.is_gem;
		});

		_.each(this.connectors, function(el){
			el.path.remove();
		});

		_.each(this.gems, function(el){
			el.path.remove();
		});

		_.each(this.paths, function(el, i){
			el.path.remove();			
		});
		var	max_size = 16;
		var max_bounds;
		var step_size = 4;
		var sizes = [];

		var n = 23 - 4;
		var j = 0;

		var group = new paper.Group();
		for(var i = 4; i <= 23; i++){
			// console.log(i);
			var pos = paper.view.center.clone();

			var s = 3 - (j % 4);
			
			// j*4 is column id
			// j/4 is row id

			console.log(i, i + s);
			pos.x += (j % 4) * (i + s) * 1.5;
			pos.y += 4 - (Math.floor(j / 4)) * 30 ;//; (i + s) ;
			console.log(pos);
			var c = new paper.Path.Circle({
				position: pos, 
				radius: i/ 2.0,
				fillColor: new paper.Color(1.0), 
				strokeColor: new paper.Color(0.0)
			});

			var text = new paper.PointText({
		    point: c.bounds.expand(5).topCenter,
		    content: i,
		    fillColor: new paper.Color(0.05),
		    fontFamily: 'Helvetica',
		    fontWeight: 'bold',
		    justification: 'center',
		    fontSize: 10
		});
		while(text.bounds.width > c.bounds.expand(10).width){
			text.fontSize -= 1;
		}
		text.bringToFront();


			sizes.push(i);
			j++;
			group.addChild(c);
			group.addChild(text);
		}
		group.bounds.center = paper.view.center;
		// var text = new paper.PointText({
		//     point: max_bounds.expand(5).bottomCenter,
		//     content: 'Ring mandril: ' + sizes.join(', '),
		//     fillColor: new paper.Color(0.05),
		//     fontFamily: 'Helvetica',
		//     fontWeight: 'bold',
		//     justification: 'center',
		//     fontSize: 3
		// });
		// console.log(sizes.join(', '));
		// while(text.bounds.width > max_bounds.expand(10).width){
		// 	text.fontSize -= 1;
		// }
		// text.bringToFront();

		max_bounds = group.bounds.expand(10);
		bg = MountainPath.addBackground(max_bounds);
		bg.sendToBack();


		var ps = paper.view.size;
		var zoomx = ps.width / max_bounds.width;
		var zoomy = ps.height / max_bounds.height;
		var zoom = zoomx > zoomy ? zoomy : zoomx;
		paper.view.zoom *= zoom;
		scope.paper.project.view.update();

		dim.set(bg.bounds.height, bg.bounds.width, 0);

	}, 
	ring_make: function(){
		var scope = this;
		this.connectors = _.filter(this.wirepaths.wires, function(el){
			return el.is_connector && !el.is_gem;
		});
		this.gems = _.filter(this.wirepaths.wires, function(el){
			return el.is_gem && !el.is_connector;
		});
		this.paths = _.filter(this.wirepaths.wires, function(el){
			return !el.is_connector && !el.is_gem;
		});

		_.each(this.connectors, function(el){
			el.path.remove();
		});

		_.each(this.gems, function(el){
			el.path.remove();
		});

		_.each(this.paths, function(el, i){
			el.path.remove();			
		});
		var	max_size = 16;
		var max_bounds;
		var step_size = 4;
		var sizes = [];
		for(var i = max_size; i >= 0; i -= step_size){
			var c = new paper.Path.Circle({
				position: paper.view.center.clone(), 
				radius: Ruler.mm2pts(Ruler.ringsize2mm(i)) / 2.0,
				fillColor: new paper.Color(1.0 - (i/max_size))
			});
			if(i == max_size) max_bounds = c.bounds;
			sizes.push(i);
		}
		// i = 0;
		// var c = new paper.Path.Circle({
		// 		position: paper.view.center.clone(), 
		// 		radius: Ruler.ringsize2mm(i) / 2.0,
		// 		fillColor: new paper.Color(1.0 - (i/max_size))
		// 	});
		// 	if(i == max_size) max_bounds = c.bounds;
		// 	sizes.push(i);

		var text = new paper.PointText({
		    point: max_bounds.expand(5).bottomCenter,
		    content: 'Ring mandril: ' + sizes.join(', '),
		    fillColor: new paper.Color(0.05),
		    fontFamily: 'Helvetica',
		    fontWeight: 'bold',
		    justification: 'center',
		    fontSize: 3
		});
		console.log(sizes.join(', '));
		while(text.bounds.width > max_bounds.expand(10).width){
			text.fontSize -= 1;
		}
		text.bringToFront();

		max_bounds = max_bounds.expand(10);
		bg = MountainPath.addBackground(max_bounds);
		bg.sendToBack();


		var ps = paper.view.size;
		var zoomx = ps.width / max_bounds.width;
		var zoomy = ps.height / max_bounds.height;
		var zoom = zoomx > zoomy ? zoomy : zoomx;
		paper.view.zoom *= zoom;
		scope.paper.project.view.update();

		dim.set(bg.bounds.height, bg.bounds.width, 0);

	}, 
	hilljig_make: function(){
		var scope = this;
		this.connectors = _.filter(this.wirepaths.wires, function(el){
			return el.is_connector && !el.is_gem;
		});
		this.gems = _.filter(this.wirepaths.wires, function(el){
			return el.is_gem && !el.is_connector;
		});


		this.paths = _.filter(this.wirepaths.wires, function(el){
			return !el.is_connector && !el.is_gem;
		});

		_.each(this.connectors, function(el){
			el.path.remove();
		});

		_.each(this.gems, function(el){
			el.path.remove();
		});

		console.log("N paths to jigify", this.paths.length)
		// this.paths[1].path.remove();
		// _.each([this.paths[0]], function(el){
		var start = 0; 
		var step = 0.6 / this.paths.length;
		var end = start + step;
		_.each(this.paths, function(el, i){
			el.path.selected = false;
			testPath = el.path;
			lengthen_path(testPath);
			console.log(i, start, end);
			MountainPath.wall_make(el.path, 0, 0.6);
			MountainPath.wire_path(el.path, 0, 0.6);
			MountainPath.add_holey_ends(el.path, 0, 0.6);
			el.path.remove();
			start += step;
			end += step;
		});
		bg = MountainPath.addBackground(factory.wirepaths.bounds().bounds);
		bg.sendToBack();
		
		scope.paper.project.view.update();
	},

	hold_make: function(){
		ConnectorJig.make(this);
	},
	update: function(){
		if(typeof this.paper == "undefined") return;

		if(!this.loadFromLocalStorage){
			console.log("TODO: Importing from file", this.svg);
		
		} else{
			
			if(this.product == "HillJig"){
				if(!this.loadedFromLocal){
					console.log("Loading from local")
					this.paper.project.clear();
					this.loadingFromLocalStorage();
					this.loadedFromLocal = true;
				}
			}
		};

		paper.view.update();
	},
	importSVG: function(callback){
		var scope = this;
		this.paper.project.importSVG(this.svg, {
	    	onLoad: function(item) { 
		    	
		    	scope.svgSym = item;
		        svg = paper.project.activeLayer.removeChildren();
				pathSVG = svg[0].children[0].children;

				for(var i in pathSVG){
		        	var child = pathSVG[i];
		        	child.applyMatrix = true;
		        	child.position = paper.view.center;
		        	paper.project.activeLayer.addChild(child);
		        }

		        jigpath = new JigPath(paper.project.activeLayer.children[0]);
	    		callback();
	    }});
	},
	init: function(){
		var c = this.container;
		this.canvas = DOM.tag("canvas")
				.prop('resize', true)
				.height(c.height())
				.width(c.width());

		c.append(this.canvas);	

		this.paper = new paper.PaperScope();
		this.paper.setup(this.canvas[0]);
		this.height = this.paper.view.size.height;
		this.width = this.paper.view.size.width;
		this.paper.view.zoom = 1;	
		var scope = this; 
		this.update();
		
		return this;
	},
	loadingFromLocalStorage: function(){
		// this.clear();

		save_events = $.map(storage.keys(), function(el, i){
			flag = el.split('_')[0];
			time = parseInt(el.split('_')[1]);
			if(flag == "saveevent")
				return time;
		});	

		if(_.isEmpty(save_events)){
			console.log("No save events to revert to...");
			return;
		}

		console.log("save events", save_events);
		last_event =  _.max(save_events);

		console.log("loading json", last_event);

		this.loadJSON(storage.get('saveevent_' + last_event));
		

	},

	loadJSON: function(json, callback){
		this.art_layer = new paper.Group();


		var scope = this;
		var item = this.paper.project.importJSON(json); 
		
		var layer = item[0];

		for(var i = 0; i < layer.children.length; i ++){
			var group = layer.children[i];

			_.each(Utility.unpackChildren(group, []), function(value, key, arr){
				
				var path = value;
				var mat = Material.detectMaterial(path);
				var w  = new WirePath(scope.paper, value);
				scope.wirepaths.add(w.id, w);
				w.material = mat;
				w.update();
				
			});

	  	}
		scope.art_layer.addChild(layer);
		var b = scope.art_layer.bounds;
		scope.art_layer.position = new paper.Point(0 + b.width/2 + 20, 0 + b.height/2 + 20);
		
		scope.paper.view.zoom = 3;
		
		scope.paper.view.center = new paper.Point(0 + b.width/2 + 20, 0 + b.height/2 + 20);
		scope.paper.view.update();
		b = scope.wirepaths.bounds();
		paper.view.zoom *= b.zoomFactor;
	}
}




