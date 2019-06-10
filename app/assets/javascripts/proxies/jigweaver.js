
//  .o88b.  .d88b.  d8b   db d888888b d8888b.  .d88b.  db      db      d88888b d8888b. 
// d8P  Y8 .8P  Y8. 888o  88 `~~88~~' 88  `8D .8P  Y8. 88      88      88'     88  `8D 
// 8P      88    88 88V8o 88    88    88oobY' 88    88 88      88      88ooooo 88oobY' 
// 8b      88    88 88 V8o88    88    88`8b   88    88 88      88      88~~~~~ 88`8b   
// Y8b  d8 `8b  d8' 88  V888    88    88 `88. `8b  d8' 88booo. 88booo. 88.     88 `88. 
//  `Y88P'  `Y88P'  VP   V8P    YP    88   YD  `Y88P'  Y88888P Y88888P Y88888P 88   YD 
                                                                                    
                                                                                    
function Jig(){
	this.resolution = 20;
	this.hole_size = 2.5 / 2;
	this.height = 11.35; //mm
};

Jig.BASE_MATERIAL = new THREE.MeshLambertMaterial({color: 0x7777ff});
Jig.METAL_MATERIAL = new THREE.MeshPhongMaterial({color: 0xC0C0C0,
		emissive: 0x111111, 
		shininess: 20,
		specular: '#a9fcff',
     	ambient: new THREE.Color( 0xffffff ),
        specular: new THREE.Color( 0x111111 ),
        emissive: new THREE.Color( 0x000000 ),
        side: THREE.DoubleSide,
        shininess: 100, 
        wireframe: false
	});

// new THREE.MeshPhongMaterial({
//         specular: '#a9fcff',
//         color: '#00abb1',
//         ambient: new THREE.Color( 0xffffff ),
//         // dark
//         specular: new THREE.Color( 0x111111 ),
//         emissive: new THREE.Color( 0x000000 ),
//         side: THREE.DoubleSide,
//         shininess: 30, 
//         wireframe: false
//       });             


function WeaveController(env, gui){
	var scope = this;
	this.jig = new Jig();
	this.frame_gauge = 24;
	this.weaving_gauge = 18;
	this.frame_num = 3;
	this.tolerance = 0.05;

	// this.peg = new CylinderJigPeg(this.jig, this.peg_radius, this.tolerance);
	this.peg = new WeaveModule(this.frame_num, this.frame_gauge, this.frame_gauge + 2);

	env.scene.add( this.peg.mesh);


	this.filename = "jigpeg.stl";
	gui.add(this, "filename");

	var radiusController = gui.add(this, "frame_gauge", 10,  30).step(1);
	var weaveRadiusController = gui.add(this, "weaving_gauge", 10,  30).step(1);
	var frameNumController = gui.add(this, "frame_num", 2,  9).step(1);
	frameNumController.onChange(function(){ scope.update(); });


	var toleranceController = gui.add(this, "tolerance", -0.1, 0.1).step(0.01);
	

	radiusController.onChange(function(){ scope.update(); });
	weaveRadiusController.onChange(function(){ scope.update(); });
	toleranceController.onChange(function(){ scope.update(); });

	var resolutionController = gui.add(this.jig, "resolution", 4, 50).step(1);
	resolutionController.onChange(function(){ scope.update(); });


	var wireframe = gui.add(Jig.BASE_MATERIAL, "wireframe");
	gui.add(this, "export");
};

WeaveController.prototype = {
	update: function(){
		env.scene.remove(this.peg.mesh);
		this.peg = new WeaveModule(this.frame_num, this.frame_gauge, this.weaving_gauge);
		env.scene.add( this.peg.mesh);
	}, 
	export: function(){
		var filename = this.filename;
		console.log("Saving", filename);		
		AsciiStlWriter.save(this.peg.mesh.children[0].geometry, filename);
	}
}
                                                                                                               
                                                                                                                





// db   d8b   db d88888b  .d8b.  db    db d88888b 
// 88   I8I   88 88'     d8' `8b 88    88 88'     
// 88   I8I   88 88ooooo 88ooo88 Y8    8P 88ooooo 
// Y8   I8I   88 88~~~~~ 88~~~88 `8b  d8' 88~~~~~ 
// `8b d8'8b d8' 88.     88   88  `8bd8'  88.     
//  `8b8' `8d8'  Y88888P YP   YP    YP    Y88888P 
var weave_wires;     
var vise;             
function WeaveModule(num_wires, frame_gauge, weave_gauge){
	console.log("Frame:", frame_gauge, "Weave:", weave_gauge);
	var weave_diameter = Ruler.gauge2mm(weave_gauge);
	var frame_diameter = Ruler.gauge2mm(frame_gauge);

	var spacing = frame_diameter + weave_diameter;
	
	var wire = new Wire(frame_gauge);

	this.wires = [];

	var offset = (num_wires -1)  * (frame_diameter  + weave_diameter);

	// wire.mesh.position.z -= offset/2;
	for(var i = 0; i < num_wires; i++){
		var wireMesh = new Wire(frame_gauge).mesh;
		
		wireMesh.position.z += spacing * i
		this.wires.push(wireMesh);
	}
	for(var i in this.wires)
		this.wires[i].position.z -= offset/2;

	this.jig = new THREE.Object3D();
	for(var i in this.wires)
		this.jig.add(this.wires[i]);


	var vise_height = 5;
	var vise_girth = frame_diameter * 2;

	vise = new WeaveVise(offset + frame_diameter * 4, vise_height, vise_girth)
	var vise = vise.holify(this.wires);

	var pattern = new WirePattern(50, frame_gauge, weave_gauge);
	pattern.setPattern(WirePattern.THREE_CASCADE);
	var patternMesh = pattern.generateMesh(vise_height, vise_girth / 2);
	var bsp_pattern = new ThreeBSP(patternMesh.geometry);
	var bsp_vise = new ThreeBSP(vise.geometry);
	var result = bsp_vise.union(bsp_pattern);

	this.jig.add(result.toMesh(Jig.BASE_MATERIAL));
	this.mesh = this.jig;
}              

WeaveModule.prototype = {

}

// db   d8b   db d88888b  .d8b.  db    db d88888b   db    db d888888b .d8888. d88888b 
// 88   I8I   88 88'     d8' `8b 88    88 88'       88    88   `88'   88'  YP 88'     
// 88   I8I   88 88ooooo 88ooo88 Y8    8P 88ooooo   Y8    8P    88    `8bo.   88ooooo 
// Y8   I8I   88 88~~~~~ 88~~~88 `8b  d8' 88~~~~~   `8b  d8'    88      `Y8b. 88~~~~~ 
// `8b d8'8b d8' 88.     88   88  `8bd8'  88.        `8bd8'    .88.   db   8D 88.     
//  `8b8' `8d8'  Y88888P YP   YP    YP    Y88888P      YP    Y888888P `8888Y' Y88888P 
                                                                                   
function WeaveVise(w, h, d){
	// dimenions are total
	this.vise = new THREE.BoxGeometry(w, h, d);
	this.mesh = new THREE.Mesh(this.vise, Jig.BASE_MATERIAL);
	this.mesh.rotation.y += Math.PI/2; 
}                                

WeaveVise.prototype = {
	holify: function(wires){
		var baked_vise = Proxy.bake(this.mesh);
		var bsp_vise = new ThreeBSP(baked_vise.geometry);

		var holes = Proxy.unionize(wires, Jig.BASE_MATERIAL)
		var bsp_holes = new ThreeBSP(holes.geometry);
		
		var result = bsp_vise.subtract(bsp_holes);
		return result.toMesh(Jig.BASE_MATERIAL);
	}
}


// d8888b.  .d8b.  d888888b d888888b d88888b d8888b. d8b   db 
// 88  `8D d8' `8b `~~88~~' `~~88~~' 88'     88  `8D 888o  88 
// 88oodD' 88ooo88    88       88    88ooooo 88oobY' 88V8o 88 
// 88~~~   88~~~88    88       88    88~~~~~ 88`8b   88 V8o88 
// 88      88   88    88       88    88.     88 `88. 88  V888 
// 88      YP   YP    YP       YP    Y88888P 88   YD VP   V8P 

WirePattern.THREE_CASCADE = [
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1],
	[0, 1, 1],
	[1, 1, 0],
];

function WirePattern(l,  frame_gauge, weave_gauge){
	this.frame_diameter = Ruler.gauge2mm(frame_gauge);
	this.weave_diameter = Ruler.gauge2mm(weave_gauge);
	var human_error = weave_gauge * 0.95;
	this.rows = parseInt(l / (this.weave_diameter + human_error));
	this.pattern = [];
}
WirePattern.prototype = {
	setPattern: function(arr){
		this.pattern = arr;
	}, 
	generateMesh: function(h, offset_girth){
		var geom = [];
		var depth = 0.5;

		var spacing = this.weave_diameter;
		var width = this.frame_diameter;
		var y_spacing = 0.1;

		// var spacing = h * 0.04
		var spacing_y_total = y_spacing * (this.pattern.length + 2);

		var height = (h - spacing_y_total) / this.pattern.length;
		
		var y = (this.pattern.length - 3) * (height + y_spacing) ;
		// var y = spacing + h/2;
		for(var i = 0; i < this.pattern.length; i++){
			var row = this.pattern[i];
			var z = (row.length - 2) * (spacing + width ); 
			
			for(var j in row){
				if(row[j]){
					console.log(i, j, width, depth, height, y, z);
					var mesh = new THREE.Mesh(new THREE.BoxGeometry(depth, height, width), Jig.BASE_MATERIAL);
					mesh.position.z = z;
					mesh.position.y = y;
					mesh.position.x = offset_girth;
					// console.log("ADDED",i, rowObj.children.length);
					geom.push(mesh);
				}
				z -= width + spacing;
				
			}
			y -= height + y_spacing;
		}
		return Proxy.unionize(geom, Jig.BASE_MATERIAL);
	}
}


// db   d8b   db d888888b d8888b. d88888b 
// 88   I8I   88   `88'   88  `8D 88'     
// 88   I8I   88    88    88oobY' 88ooooo 
// Y8   I8I   88    88    88`8b   88~~~~~ 
// `8b d8'8b d8'   .88.   88 `88. 88.     
//  `8b8' `8d8'  Y888888P 88   YD Y88888P 



function Wire(gauge){
	var CustomSinCurve = THREE.Curve.create(
	    function ( scale ) { //custom curve constructor
	        this.scale = (scale === undefined) ? 1 : scale;
	    },
	    
	    function ( t ) { //getPoint: t is between 0-1
	        var tx = 0,
	            ty = 3 * t - 2,
	            tz = 0;
	        
	        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
	    }
	);

this.path = new CustomSinCurve( 10 );
	this.radius = Ruler.gauge2mm(gauge) / 2;
	this.geometry = new THREE.TubeGeometry(
	    this.path,  //path
	    20,    //segments
	    this.radius,     //radius
	    8,     //radiusSegments
	    false  //closed
	);
	this.mesh = new THREE.Mesh(this.geometry, Jig.METAL_MATERIAL);
}




// db    db d888888b d888888b db      d888888b d888888b db    db 
// 88    88 `~~88~~'   `88'   88        `88'   `~~88~~' `8b  d8' 
// 88    88    88       88    88         88       88     `8bd8'  
// 88    88    88       88    88         88       88       88    
// 88b  d88    88      .88.   88booo.   .88.      88       88    
// ~Y8888P'    YP    Y888888P Y88888P Y888888P    YP       YP    
                                                              
                                                             

// namespace for utility functions
function Proxy(){}
Proxy.unionize = function(componentGeom, material){	
	var totalGeom = new THREE.Geometry()

	componentGeom.forEach(function(el, i, arr){
		el.updateMatrix();
		totalGeom.merge(el.geometry, el.matrix);
	});
	return new THREE.Mesh(totalGeom, material);
}

Proxy.bake = function(mesh){
	mesh.updateMatrix(); 
	mesh.geometry.applyMatrix( mesh.matrix );
	mesh.matrix.identity();

	mesh.geometry.verticesNeedUpdate = true;

	mesh.position.set( 0, 0, 0 );
	mesh.rotation.set( 0, 0, 0 );
	mesh.scale.set( 1, 1, 1 );

	return mesh;
}

