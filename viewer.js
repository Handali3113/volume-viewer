import { CADViewer } from 'https://cdn.jsdelivr.net/npm/@gkjohnson/three-cad-viewer@0.7.3/build/three-cad-viewer.min.js';

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
    const volume = await viewer.computeModelVolume();

    const density = 1.1; // g/cm³ for silicone
    const weight = (volume / 1000) * density; // mm³ to cm³ → grams

    document.getElementById('volumeResult').innerText =
      `Volume: ${volume.toFixed(2)} mm³ | Weight: ${weight.toFixed(2)} g`;
  } catch (err) {
    console.error(err);
    alert('Error loading file.');
  }
});
