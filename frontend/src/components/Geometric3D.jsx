import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import * as THREE from 'three';

const Geometric3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Xóa tất cả canvas cũ nếu có
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      70, // Tăng FOV từ 50 lên 60 để thấy rộng hơn
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3,2,3); // Đẩy camera xa hơn
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Enable transparency
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Geometry: HÌNH 20 MẶT ĐỀU (Icosahedron) với texture cho mỗi mặt
    const radius = 2.5;
    const detail = 0;
    const geometry = new THREE.IcosahedronGeometry(radius, detail);

    // TextureLoader
    const textureLoader = new THREE.TextureLoader();

    // Danh sách URL hình ảnh (bạn có thể thay bằng đường dẫn hình trong project)
    const imageUrls = [
      '/anh-3.jpg',
      '/anh-4.jpg',
      '/anh-5.jpg',
      '/anh-6.jpg',
      '/anh-7.jpg',
      '/anh-8.jpg',
      '/anh-9.jpg',
      '/anh-10.jpg',
      '/anh-11.jpg',
      '/anh-12.jpg',
      '/anh-3.jpg',
      '/anh-4.jpg',
      '/anh-5.jpg',
      '/anh-6.jpg',
      '/anh-7.jpg',
      '/anh-8.jpg',
      '/anh-9.jpg',
      '/anh-10.jpg',
      '/biet-thu-nui.jpg',
      '/biet-thu-1.jpg',
    ];

    // Tạo mảng materials với texture khác nhau
    const materials = imageUrls.map((url) => {
      const texture = textureLoader.load(url);
      
      // Cấu hình texture trước khi load xong
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      
      return new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.2,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });
    });

    // Tạo UV mapping cho mỗi tam giác - mỗi mặt sẽ có UV từ 0-1 để hiển thị đầy đủ texture
    const positions = geometry.attributes.position;
    const uvs = [];
    
    // Thu nhỏ UV mapping để chỉ hiển thị phần giữa của texture (50%)
    const uvScale = 0.5; // Điều chỉnh từ 0.1 - 1.0 (0.5 = 50% kích thước)
    const uvOffset = (1 - uvScale) / 2; // Căn giữa
    
    // Với icosahedron, mỗi 3 vertices tạo thành 1 mặt tam giác
    // Gán UV cho mỗi mặt tam giác để hiển thị đầy đủ texture
    for (let i = 0; i < positions.count; i += 3) {
      // Mỗi tam giác sẽ có UV mapping thu nhỏ
      // Vertex 1: góc dưới trái
      uvs.push(uvOffset, uvOffset);
      // Vertex 2: góc dưới phải
      uvs.push(uvOffset + uvScale, uvOffset);
      // Vertex 3: góc trên giữa
      uvs.push(uvOffset + uvScale/2, uvOffset + uvScale);
    }
    
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    // Gán material groups cho mỗi mặt
    // Icosahedron có 20 mặt, mỗi mặt là 1 tam giác (3 vertices)
    const faceCount = geometry.index ? geometry.index.count / 3 : positions.count / 3;
    geometry.clearGroups();
    
    for (let i = 0; i < faceCount; i++) {
      geometry.addGroup(i * 3, 3, i % materials.length);
    }

    // Mesh với nhiều materials
    const icosahedron = new THREE.Mesh(geometry, materials);
    scene.add(icosahedron);

    // Ánh sáng
    const light1 = new THREE.DirectionalLight(0xffffff, 1.2);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-5, -5, -5);
    scene.add(light2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    // Animation
    function animate() {
      requestAnimationFrame(animate);

      icosahedron.rotation.x += 0.005;
      icosahedron.rotation.y += 0.008;

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      materials.forEach(mat => {
        if (mat.map) mat.map.dispose();
        mat.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      position="relative"
      width="120%"
      height="120%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    />
  );
};

export default Geometric3D;
