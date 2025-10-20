import { CADViewer } from 'https://cdn.jsdelivr.net/npm/@gkjohnson/three-cad-viewer@0.6.1/build/three-cad-viewer.min.js';

const container = document.getElementById('viewer');
const viewer = new CADViewer({ element: container });

viewer.setTheme('dark');
viewer.setGridVisibility(true);

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const ext = file.name.split('.').pop().toLowerCase();

  try {
    const model = await viewer.loadModel(buffer, file.name);
    viewer.fitView();

    // Wait until model is ready
    setTimeout(async () => {
      const meshes = viewer.modelGroup.children;
      let totalVolume = 0;

      meshes.forEach(mesh => {
        if (mesh.geometry) {
          mesh.geometry.computeBoundingBox();
          const geom = mesh.geometry;
          const positions = geom.attributes.position.array;

          // Basic volume estimation using signed tetrahedron method
          let volume = 0;
          for (let i = 0; i < positions.length; i += 9) {
            const ax = positions[i], ay = positions[i+1], az = positions[i+2];
            const bx = positions[i+3], by = positions[i+4], bz = positions[i+5];
            const cx = positions[i+6], cy = positions[i+7], cz = positions[i+8];
            volume += (ax*(by*cz - bz*cy) - ay*(bx*cz - bz*cx) + az*(bx*cy - by*cx)) / 6;
          }
          totalVolume += Math.abs(volume);
        }
      });

      const density = 1.1; // silicone g/cm³
      const weight = (totalVolume / 1000) * density;

      document.getElementById('volumeResult').innerText =
        `Volume: ${totalVolume.toFixed(2)} mm³ | Est. Weight: ${weight.toFixed(2)} g`;
    }, 1000);

  } catch (err) {
    console.error(err);
    alert('Error loading model. Check console for details.');
  }
});
