function Materials(dom){
	this.dom = dom;
	this.materials = _.map(this.dom.children(), function(value, key, arr){
		var gauge = parseInt($(value).attr('data-gauge'));
		var color = $(value).attr('data-color');
		
		$(value).attr('value', key);
		var mat = new Material(gauge, color);
		return mat;
	});
}
Materials.prototype = {
	at: function(i){
		return this.materials[i];
	}, 
	find: function(other){
		for(var i in this.materials){
			if(this.materials[i].equals(other))
				return i;
		}
		return -1;
	}
}

function Material(gauge, color){
	this.gauge = gauge;
	this.diameter = Ruler.gauge2mm(gauge);
	this.color = new paper.Color(color);
}
Material.prototype = {
	getStyle: function(){
		return {
			strokeColor: this.color,
			strokeWidth: Ruler.mm2pts(this.diameter), 
			shadowColor: new paper.Color(0.2, 0.2, 0.2), 
			shadowBlur: Ruler.mm2pts(this.diameter) * 1, 
			shadowOffset: new paper.Point(Ruler.mm2pts(this.diameter)/2, Ruler.mm2pts(this.diameter)/2)
		};
	}, 
	equals: function(m){
		return m.gauge == this.gauge && m.color.toCanvasStyle() == (this.color.toCanvasStyle());
	}
}

Material.detectMaterial =  function(path){
	var s = path.style;
	var gauge = Ruler.pts2gauge(parseFloat(s.strokeWidth));
	var color = s.strokeColor;
	return new Material(gauge, color);
}