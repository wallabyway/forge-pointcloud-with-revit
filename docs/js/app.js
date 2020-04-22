
class demoViewer {

	constructor(div, extensions, viewStates) {
		this.viewStates = viewStates;
		this.options = {
		    env: 'AutodeskProduction',
		    accessToken: _adsk.token.access_token,
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

	async addPointcloud(url) {
		const potreeExtension = this.viewer.getExtension('PotreeExtension');
		let position = new THREE.Vector3(0, 0, -25);
		let scale = new THREE.Vector3(5, 5, 5);
		const pointcloud = await potreeExtension.loadPointCloud("pc1", url, position, scale);
		const bbox = pointcloud.boundingBox.clone().expandByVector(scale);
	}

	async loadModel(urn, url) {
        Autodesk.Viewing.Document.load(`urn:${urn}`, (doc) => {
            var viewables = doc.getRoot().getDefaultGeometry();
            this.viewer.loadDocumentNode(doc, viewables).then(model => {
	            this.addPointcloud(url);
	            this.view = 0;
            });
        });
	}

	set view(i) {
		this.viewer.restoreState(this.viewStates[i]);
	}

	get view() {
		return this.viewer.getState({ viewport : true });
	}

}


