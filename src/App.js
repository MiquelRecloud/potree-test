import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Potree } from 'potree-core'

function App() {
    const mountRef = useRef(null)

    useEffect(() => {
        // Scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xdddddd)

        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.set(5, 5, 5)

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        mountRef.current.appendChild(renderer.domElement)

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.addEventListener('change', () => {
            renderer.render(scene, camera)
        })

        // Light
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5)
        scene.add(ambientLight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 5, 5).normalize()
        scene.add(directionalLight)

        // Load a cube
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
        const material = new THREE.MeshStandardMaterial({ color: 0x0077ff })
        const cube = new THREE.Mesh(geometry, material)
        scene.add(cube)

        const baseUrl = 'https://cdn.rawgit.com/potree/potree/develop/pointclouds/lion_takanawa/'
        const potree = new Potree()
        const pointClouds = []

        potree
            .loadPointCloud('cloud.js', (url) => `${baseUrl}${url}`)
            .then(function (pco) {
                // center pco
                pco.position.set(-1, -1, 2)
                pco.rotation.set((6.28318531 * 3) / 4, 0, 0)
                // reduce point size
                pco.material.size = 0.01
                console.log(pco)
                scene.add(pco)
                pointClouds.push(pco)
            })

        function loop() {
            potree.updatePointClouds(pointClouds, camera, renderer)

            controls.update()
            renderer.render(scene, camera)

            requestAnimationFrame(loop)
        }
        loop()

        renderer.render(scene, camera)
    }, [])

    return (
        <div
            ref={mountRef}
            style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
        />
    )
}

export default App
