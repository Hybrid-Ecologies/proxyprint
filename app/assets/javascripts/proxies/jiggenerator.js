function TextureGenerator(container, config){
	this.container = container;
	this.init();
	this.load(config);
}

TextureGenerator.prototype = {
	load: function(config){
		this.config = config;
		this.factor = 500 / Ruler.convert(config.size, "mm");

		this.feature_size =  Ruler.convert(config.feature_size, "mm") * this.factor;
		this.feature_gap = Ruler.convert(config.feature_gap, "mm") * this.factor;
		this.feature = TextureGenerator.BumpFeature;
		this.texture = this.grid(this.feature.make, this.feature_size, 3, TextureGenerator.INTERLEAVED);
	},
	reload: function(config){
		this.texture.remove();
		return this.load(config);
	},
	init: function(){
		var c = this.container;
		// this.adjust();
		console.log('Creating texture');
		console.log(c);
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



		// TEMPLATE BOLT
		// var myCircle = new paper.Path.Circle(new paper.Point(100, 70), 50);
		// myCircle.style = TextureGenerator.CUT_STYLE("#00A8E1");
		return this;
	},
	grid: function(feature, feature_size, feature_gap, interleaved){
		if(feature_gap < 0 || feature_size <= 0){
			console.log("Feature size and gap must be greater than zero!");
			return;
		}

		var group = new this.paper.Group();		
		var template = feature(new paper.Point(100, 100), feature_size);
		// group.addChild(template);
		if(interleaved == TextureGenerator.GRID){
			for(var j = template.bounds.height/2; j < this.height; j += template.bounds.height + this.feature_gap){
				for(var i = template.bounds.width/2; i < this.width; i += template.bounds.width + this.feature_gap){
					group.addChild(feature(new paper.Point(i, j), feature_size));
				}
			}
		} else if(interleaved == TextureGenerator.INTERLEAVED){
			var x_pos; 
			var row = 0;
			var squeeze = 2 * feature_size/2 - Math.sqrt(3) * feature_size/2;
			for(var j = -template.bounds.height * 1.5; j < this.height + template.bounds.height; j += template.bounds.height + this.feature_gap - squeeze){
				for(var i = -template.bounds.width * 1.5; i < this.width + template.bounds.width; i += template.bounds.width + this.feature_gap){
					x_pos = i;
					if(row % 2 == 1){
						x_pos += template.bounds.width / 2 + this.feature_gap/2;
					}

					group.addChild(feature(new paper.Point(x_pos, j), feature_size));
					
				}
				row ++;
			}
		}
		template.remove();
		this.paper.view.update();
		return group;
	},
	density: function(){
		return factory.texture.children.length * this.feature.area(this.feature_size) / factory.texture.bounds.area;
	},
	export: function(mode){
		var prev = this.paper.view.zoom;
		this.paper.view.zoom = 1;
		// if(this.config.mode == "LaserCut-Ready")
			// $.each(factory.paper.project.activeLayer.children, function(i, v){ console.log(v.style.strokeWidth); v.style.strokeWidth=0.001;});
		
		if(mode == TextureGenerator.SVG)
			exp = this.paper.project.exportSVG({asString: true});
		else if(mode == TextureGenerator.PNG)
			exp = this.canvas[0].toDataURL("image/png");
		else 
			exp = "No mode was specified";
		
		this.paper.view.zoom = prev;

		return exp;
	},
}



TextureGenerator.SVG = 1;
TextureGenerator.PNG = 2;


TextureGenerator.BUMP_STYLE = function(position, destination){
	return {
			    fillColor: {
			    	gradient: {
        				stops: [['white', 0], ['black', 1]],
        				radial: true
    				},
   					origin: position,
    				destination: destination
    			},
			    closed: true
	}
}

TextureGenerator.BumpFeature = {
	make: function(position, feature_size){
		var template = new paper.Path.Circle(position, feature_size/2);
		template.style = TextureGenerator.BUMP_STYLE(position.clone(), template.bounds.rightCenter);
		return template;
	}, 
	area: function(feature_size){
		return Math.PI * feature_size/2 * feature_size/2;
	}
};
TextureGenerator.SquareFeature = function(feature_size){

};
TextureGenerator.SpikeFeature = function(feature_size){

};
TextureGenerator.SVGFeature = function(feature_size){

};


TextureGenerator.INTERLEAVED = 1;
TextureGenerator.GRID = 2;
