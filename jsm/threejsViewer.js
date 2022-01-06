import * as THREE from "../threejs/build/three.module.js";
import { MarchingCubes } from '../threejs/examples/jsm/objects/MarchingCubes.js'
import { OrbitControls } from '../threejs/examples/jsm/controls/OrbitControls.js'

class threejsViewer {
    constructor(domElement) {
        this.size = 0
        this.databuffer = null
        this.textureOption = 0
        this.threshold = 75
        this.enableLine = false

        let width = domElement.clientWidth;
        let height = domElement.clientHeight;

        let textures = [
            new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, color: 0x0000FF}),
            new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })
        ]

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0xE6E6FA, 1.0)
        domElement.appendChild(this.renderer.domElement);

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        let aspect = window.innerWidth / window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 50);
        this.camera.position.set(2, 1, 2)
        this.scene.add(this.camera)

        // Light
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        //directionalLight.position.set(2, 1, 2)
        this.camera.add(directionalLight)

        // Controller
        let controller = new OrbitControls(this.camera, this.renderer.domElement)
        controller.target.set(0, 0.5, 0)
        controller.update()
        
        //Axis Landmark
        const axesHelper = new THREE.AxesHelper(100)
        this.scene.add(axesHelper)

        // Ground
        const plane = new THREE.Mesh(
            new THREE.CircleGeometry(2, 30),
            new THREE.MeshPhongMaterial({ color: 0xbbddff, opacity:0.4, transparent: true })
        );
        plane.rotation.x = - Math.PI / 2;
        this.scene.add(plane);

        let scope = this
        this.renderScene = function () {
            requestAnimationFrame(scope.renderScene)
            scope.renderer.render(scope.scene, scope.camera);
        }

        //視窗變動時 ，更新畫布大小以及相機(投影矩陣)繪製的比例
        window.addEventListener('resize', () => {
            //update render canvas size
            let width = domElement.clientWidth
            let height = domElement.clientHeight
            this.renderer.setSize(width, height);

            //update camera project aspect
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix();
        })

        this.updateModel = function () {
            let model = this.scene.getObjectByName('model')

            if (model != null) {
                this.drawMesh()
                this.drawLine()
                return model
            }

            model = new THREE.Group()
            model.name = 'model'
            this.scene.add(model)

            model.add(this.drawMesh())
            model.add(this.drawLine())
           
            model.position.set(0, 0.5, 0)
            model.scale.set(1 / 2, 1 / 2, 1 / 2)

            return model
        }

        this.drawMesh = function () {
            let mesh = this.scene.getObjectByName('mesh')

            if (mesh == null) {
                mesh = new MarchingCubes(this.size)
                mesh.name = 'mesh'
            }

            if (mesh.size != this.size) {
                mesh.init(this.size)
            }

            mesh.material = textures[this.textureOption]
            mesh.isolation = this.threshold
            mesh.field = this.databuffer
            
            return mesh
        }

        this.drawLine = function () {
            let mesh = this.scene.getObjectByName('mesh')

            if (mesh == null) {
                return
            }

            let lineMesh = this.scene.getObjectByName('polyLine')

            if (lineMesh == null) {
                const geometry = mesh.generateBufferGeometry()
                const material = new THREE.MeshBasicMaterial()
                material.wireframe = true
                material.depthTest = false;
                material.transparent = true
                material.opacity = 0.2

                lineMesh = new THREE.Mesh(geometry, material)
                lineMesh.name = 'polyLine'
                lineMesh.visible = this.enableLine

                return lineMesh
            }

            lineMesh.visible = this.enableLine

            if (!this.enableLine) {
                return
            }
            else {
                const geometry = mesh.generateBufferGeometry()
                lineMesh.geometry = geometry
                return
            }
        }

        this.renderScene()
    }
}

export {
    threejsViewer
}