function Wires(){
	this.wires = {}
}

Wires.prototype = {
	bounds: function(){
		var b = _.reduce(this.wires, function(memo, val, key, arr){
			return memo.unite(val.path.bounds.clone().expand(10));
		}, new paper.Rectangle(paper.view.center, new paper.Size(0, 0)));	
		b = b.expand(20);
		var r = new paper.Path.Rectangle(b);
		// r.strokeColor = "black";
		
		b = r.strokeBounds;
		r.remove();
		paper.view.update();

		var ps = paper.view.size;
		var zoomx = ps.width / b.width;
		var zoomy = ps.height / b.height;
		var zoom = zoomx > zoomy ? zoomy : zoomx;


		if(dim)
			dim.set(Ruler.pts2mm(b.height), Ruler.pts2mm(b.width), 8);

		return {bounds: b, zoomFactor: zoom}
	},
	clear: function(){
		this.wires = {};
	},
	add: function(key, val){
		this.wires[key] = val;
	}, 
	remove: function(key){
		console.log("Deleting wire at", key, this.at(key));

		if(key in this.wires){
			this.at(key).remove();
			delete this.wires[key];
		}
	},
	at: function(key){
		return this.wires[key];
	}, 
	totalLength: function(){
		var sum = 0;
		_.each(this.wires, function(v){ sum += v.path.length });
		return sum;
	}, 
	length: function(){
		return Object.size(this.wires);
	}
}