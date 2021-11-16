
class demoViewer {

	// create a single Forge Viewer
	constructor(div, extensions, viewStates) {
		this.viewStates = viewStates;
		this.options = {
		    env: 'AutodeskProduction',
		    accessToken: _access_token,
		};
		Autodesk.Viewing.Initializer( this.options, () => {
	        let viewer = new Autodesk.Viewing.Private.GuiViewer3D(div, { extensions: extensions });
	        this.viewer = viewer;
	        viewer.start();
	        viewer.setTheme("light-theme"); // set to light theme
	        viewer.autocam.shotParams.destinationPercent = 3;
			viewer.autocam.shotParams.duration = 3; // slow down camera transitions
 			app.viewer.disableHighlight(true); // highlighting looks bad through point-cloud, disabled
	    })
	}

	// adds a map as the ground-plane
	addMapBox() {
		//let imageUrl = `http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/export?bbox=-41.8929093,12.4888119,41.8894933,12.4894844&bboxSR=4326&layers=&layerDefs=&size=1274%2C796&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&f=image`;
		let imageUrl = `map.jpg`;
		var geom = new THREE.PlaneBufferGeometry( 2200 * 0.6, 1500 * 0.6 );	
		var material = new THREE.MeshPhongMaterial({ opacity:1 ,transparent:false, map:THREE.ImageUtils.loadTexture(imageUrl) });
		var mesh = new THREE.Mesh(geom, material);
		mesh.position.set(60, -11.5, -25);
		mesh.rotateZ(3.08);
		this.viewer.overlays.addScene('map-scene');	
		this.viewer.overlays.addMesh(mesh, 'map-scene');
	}


	// example load point cloud, must point to a cloud.js file (v1.7)
	async addPointcloud(url) {
		const potreeExtension = this.viewer.getExtension('PotreeExtension');
		let position = new THREE.Vector3(68,109,-29.5);
		const metersToFeet = 3.281;
		let scale = new THREE.Vector3(metersToFeet,metersToFeet,metersToFeet);
		const pointcloud = await potreeExtension.loadPointCloud("pc1", url, position, scale);
		const bbox = pointcloud.boundingBox.clone().expandByVector(scale);
	}


	// async load URN and point-cloud
	async loadModel(urn, url) {
        Autodesk.Viewing.Document.load(`urn:${urn}`, (doc) => {
            var viewables = doc.getRoot().getDefaultGeometry();
            doc.downloadAecModelData();
            this.viewer.loadDocumentNode(doc, viewables).then(model => {
            	this.addMapBox();
	            this.addPointcloud(url);
	            
	            this.view = 0;
	            setTimeout(()=>{
	            	this.viewer.hide([4575, 4576, 4577]);
	            	//this.addLabels();
	            },2000);
            });
        });
	}

	// Camera transistions
	set view(i) {
		this.viewer.restoreState(this.viewStates[i]);
		this.viewer.impl.skipAOWhenMoving=true; //force 'smooth navigation setting'
		this.viewer.setGhosting(false); //for much faster rendering performance, turn this feature off

		const ext = this.viewer.getExtension("Autodesk.BimWalk");
		if (!ext) return;
		if (this.viewStates[i].isWalk) {
			this.viewer.setBimWalkToolPopup(false);
			ext.activate();
		} else
			ext.deactivate();

	}

	get view() {
		return this.viewer.getState({ objectSet: true, viewport: true });
	}

}


