import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import * as OBC from '@thatopen/components'
import { Potree } from 'potree-core'

function App() {
    const mountRef = useRef(null)

    useEffect(() => {
        const container = mountRef.current
        const components = new OBC.Components()
        const worlds = components.get(OBC.Worlds)

        const world = worlds.create()

        world.scene = new OBC.SimpleScene(components)
        world.renderer = new OBC.SimpleRenderer(components, container)
        world.camera = new OBC.SimpleCamera(components)

        world.camera.three.near = 0.001
        world.camera.three.far = 10000

        components.init()

        world.scene.setup()
        world.scene.three.background = new THREE.Color(0xffffff)

        function onWindowResize() {
            try {
                world.camera.three.aspect = container.offsetWidth / container.offsetHeight
                world.camera.three.updateProjectionMatrix()
                if (world.renderer) world.renderer.three.setSize(container.offsetWidth, container.offsetHeight)
            } catch (e) {}
        }
        window.addEventListener('resize', onWindowResize, false)
        onWindowResize()

        // Load a cube
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
        const material = new THREE.MeshStandardMaterial({ color: 0x0077ff })
        const cube = new THREE.Mesh(geometry, material)
        world.scene.three.add(cube)

        let baseUrl = 'https://cdn.rawgit.com/potree/potree/develop/pointclouds/lion_takanawa/'
        baseUrl = `${process.env.PUBLIC_URL}/Comsa/`
        baseUrl = `${process.env.PUBLIC_URL}/lion_takanawa/`
        baseUrl = `https://potree-tests.s3.eu-west-3.amazonaws.com/lion_takanawa/`
        baseUrl = `https://potree-tests.s3.eu-west-3.amazonaws.com/Comsa/`
        const potree = new Potree()
        const pointClouds = []

        potree
            .loadPointCloud('metadata.json', (url) => `${baseUrl}${url}`)
            .then(function (pco) {
                // center pco
                pco.position.set(0, 0, 0)
                pco.rotation.set((6.28318531 * 3) / 4, 0, 0)
                // reduce point size
                pco.material.size = 0.01
                console.log(pco)
                world.scene.three.add(pco)
                pointClouds.push(pco)
            })

        function loop() {
            potree.updatePointClouds(pointClouds, world.camera.three, world.renderer.three)
            requestAnimationFrame(loop)
        }
        loop()
    }, [])

    return (
        <div
            ref={mountRef}
            style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
        />
    )
}

export default App
