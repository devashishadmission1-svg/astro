// Three.js Implementation for Jyotish Website

const container = document.getElementById('canvas-container');
let scene, camera, renderer, bhaChakra, kundali;
let mouseX = 0, mouseY = 0;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xD4AF37, 2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    createBhaChakra();
    createKundali();

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);

    animate();
}

function createBhaChakra() {
    // Minimalistic Horoscope Circle
    const group = new THREE.Group();

    // Outer Circle
    const outerGeo = new THREE.RingGeometry(3.5, 3.52, 100);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const outer = new THREE.Mesh(outerGeo, lineMat);
    group.add(outer);

    // Inner Divisions (12 Rashis)
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x1 = Math.cos(angle) * 3;
        const y1 = Math.sin(angle) * 3;
        const x2 = Math.cos(angle) * 3.5;
        const y2 = Math.sin(angle) * 3.5;

        const linePoints = [new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
    }

    // Add 12 Rashi Symbols in a clean way
    const rashiSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    // (Note: Text in Three.js requires loaders, so we use refined spheres as placeholders 
    // or just leave the geometric grid for extreme minimalism)

    bhaChakra = group;
    bhaChakra.rotation.x = Math.PI / 2.5;
    scene.add(bhaChakra);
}


function createKundali() {
    // A Janam Kundali is typically a square with diagonals
    const group = new THREE.Group();

    const material = new THREE.LineBasicMaterial({ color: 0xD4AF37, transparent: true, opacity: 0.4 });

    // Outer square
    const points = [];
    points.push(new THREE.Vector3(-1, -1, 0));
    points.push(new THREE.Vector3(1, -1, 0));
    points.push(new THREE.Vector3(1, 1, 0));
    points.push(new THREE.Vector3(-1, 1, 0));
    points.push(new THREE.Vector3(-1, -1, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const square = new THREE.Line(geometry, material);
    group.add(square);

    // Diagonals
    const diag1Points = [new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, 1, 0)];
    const diag2Points = [new THREE.Vector3(1, -1, 0), new THREE.Vector3(-1, 1, 0)];

    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(diag1Points), material));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(diag2Points), material));

    // Diamond center
    const diamondPoints = [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0)
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(diamondPoints), material));

    kundali = group;
    kundali.position.z = 2; // Closer to camera
    scene.add(kundali);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / 100;
    mouseY = (event.clientY - window.innerHeight / 2) / 100;
}

function animate() {
    requestAnimationFrame(animate);

    if (bhaChakra) {
        bhaChakra.rotation.z += 0.001; // Slower, more majestic rotation
        // Smoother lerping for rotation
        bhaChakra.rotation.x += (mouseY * 0.05 + Math.PI / 3 - bhaChakra.rotation.x) * 0.02;
        bhaChakra.rotation.y += (mouseX * 0.05 - bhaChakra.rotation.y) * 0.02;
    }

    if (kundali) {
        kundali.rotation.y += 0.003;
        kundali.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
    }

    renderer.render(scene, camera);
}

function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-content > *", {
        y: 50,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power4.out"
    });

    gsap.from(".rashi-item", {
        scrollTrigger: {
            trigger: ".rashi-grid",
            start: "top 80%"
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "back.out(1.7)"
    });

    gsap.from(".glass-card", {
        scrollTrigger: {
            trigger: ".expert-cards",
            start: "top 80%"
        },
        x: (i) => i === 0 ? -100 : 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
    });
}

// Update init to include new visual logic
const originalInit = init;
init = function () {
    originalInit();
    initSmoothScroll();
    initGSAP();
};

init();

