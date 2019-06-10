
//    d88b d888888b  d888b     .o88b.  .d88b.  d8b   db d888888b d8888b.  .d88b.  db      db      d88888b d8888b. 
//    `8P'   `88'   88' Y8b   d8P  Y8 .8P  Y8. 888o  88 `~~88~~' 88  `8D .8P  Y8. 88      88      88'     88  `8D 
//     88     88    88        8P      88    88 88V8o 88    88    88oobY' 88    88 88      88      88ooooo 88oobY' 
//     88     88    88  ooo   8b      88    88 88 V8o88    88    88`8b   88    88 88      88      88~~~~~ 88`8b   
// db. 88    .88.   88. ~8~   Y8b  d8 `8b  d8' 88  V888    88    88 `88. `8b  d8' 88booo. 88booo. 88.     88 `88. 
// Y8888P  Y888888P  Y888P     `Y88P'  `Y88P'  VP   V8P    YP    88   YD  `Y88P'  Y88888P Y88888P Y88888P 88   YD 



function Jig(){
	this.resolution = 20;
	this.hole_size = 2.5 / 2;
	this.height = 11.35; //mm
};

Jig.BASE_MATERIAL = new THREE.MeshPhongMaterial({
        specular: '#a9fcff',
        color: '#00abb1',
        ambient: new THREE.Color( 0xffffff ),
        // dark
        specular: new THREE.Color( 0x111111 ),
        emissive: new THREE.Color( 0x000000 ),
        side: THREE.DoubleSide,
        shininess: 30, 
        wireframe: false
      });             


function JigController(env, gui){
	var scope = this;
	this.jig = new Jig();
	this.peg_radius = 3.2 / 2;
	this.tolerance = 0.05;

	this.peg = new CylinderJigPeg(this.jig, this.peg_radius, this.tolerance);

	env.scene.add( this.peg.mesh);


	this.filename = "jigpeg.stl";
	gui.add(this, "filename");

	var radiusController = gui.add(this, "peg_radius", this.jig.hole_size, 15).step(0.1);
	var toleranceController = gui.add(this, "tolerance", -0.1, 0.1).step(0.01);
	radiusController.onChange(function(){ scope.update(); });
	toleranceController.onChange(function(){ scope.update(); });

	var resolutionController = gui.add(this.jig, "resolution", 4, 50).step(1);
	resolutionController.onChange(function(){ scope.update(); });


	var wireframe = gui.add(Jig.BASE_MATERIAL, "wireframe");
	gui.add(this, "export");
};

JigController.prototype = {
	update: function(){
		env.scene.remove(this.peg.mesh);
		this.peg = new CylinderJigPeg(this.jig, this.peg_radius, this.tolerance);
		env.scene.add( this.peg.mesh);
	}, 
	export: function(){
		var filename = this.filename;
		console.log("Saving", filename);		
		AsciiStlWriter.save(this.peg.mesh.geometry, filename);
	}
}
                                                                                                               
                                                                                                                




//    d88b d888888b  d888b    d8888b. d88888b  d888b  
//    `8P'   `88'   88' Y8b   88  `8D 88'     88' Y8b 
//     88     88    88        88oodD' 88ooooo 88      
//     88     88    88  ooo   88~~~   88~~~~~ 88  ooo 
// db. 88    .88.   88. ~8~   88      88.     88. ~8~ 
// Y8888P  Y888888P  Y888P    88      Y88888P  Y888P  


                                 

// Dependent on design

function JigTop(){};
JigTop.HEIGHT = 9.75; // mm

function CylinderJigTop(jig, r){
	this.geometry = new THREE.CylinderGeometry( r, r, JigTop.HEIGHT, jig.resolution, jig.resolution);
	this.geometry.dynamic = true;
	this.mesh = new THREE.Mesh(this.geometry, Jig.BASE_MATERIAL);
	this.mesh.position.y += JigTop.HEIGHT/2;
}

                                                   

// Dependent on Jig

function JigPeg(jig, tolerance){
	var r = jig.hole_size * (1 + tolerance);
	this.geometry = new THREE.CylinderGeometry(r , r , jig.height, jig.resolution, jig.resolution);
	this.geometry.dynamic = true;
	this.mesh = new THREE.Mesh(this.geometry, Jig.BASE_MATERIAL);
	this.mesh.position.y -= jig.height/2;
}


function CylinderJigPeg(jig, r, tolerance){
	this.top = new CylinderJigTop(jig, r);
	this.peg = new JigPeg(jig, tolerance);
	// this.mesh = this.top.mesh;
	this.mesh = Proxy.unionize([this.top.mesh, this.peg.mesh], Jig.BASE_MATERIAL);
}


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




