
import * as fs from 'fs';
import * as path from 'path';

const R2_PUBLIC_URL = 'https://pub-2b82d106a2e24d02864c89dc4b308d5c.r2.dev';

function updateJsonFiles() {
  const dataDir = path.join(process.cwd(), 'app', 'data');

  // 1. Update mindmaps.json
  const mindmapsPath = path.join(dataDir, 'mindmaps.json');
  if (fs.existsSync(mindmapsPath)) {
    const mindmaps = JSON.parse(fs.readFileSync(mindmapsPath, 'utf8'));
    const updatedMindmaps = mindmaps.map((mm: any) => ({
      ...mm,
      url: `${R2_PUBLIC_URL}/uploads/mindmaps/${encodeURIComponent(mm.fileName)}`
    }));
    fs.writeFileSync(mindmapsPath, JSON.stringify(updatedMindmaps, null, 4));
    console.log('Updated mindmaps.json with R2 URLs');
  }

  // 2. Update slides.json
  const slidesPath = path.join(dataDir, 'slides.json');
  if (fs.existsSync(slidesPath)) {
    const slides = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));
    const updatedSlides = slides.map((s: any) => ({
      ...s,
      url: `${R2_PUBLIC_URL}/uploads/slides/${encodeURIComponent(s.fileName)}`
    }));
    fs.writeFileSync(slidesPath, JSON.stringify(updatedSlides, null, 4));
    console.log('Updated slides.json with R2 URLs');
  }

  // 3. Update infographics.json
  // Note: Infographics in the DB don't have a fileName in the episodes.json structure yet,
  // but they do in the infographics table and the newly created infographics.json.
  const infographicsPath = path.join(dataDir, 'infographics.json');
  if (fs.existsSync(infographicsPath)) {
    const infographics = JSON.parse(fs.readFileSync(infographicsPath, 'utf8'));
    const updatedInfographics = infographics.map((info: any) => {
        // If it's a new info item we just added, it has an icon but maybe not a fileName yet in the prompt.
        // Actually, the export_db_assets script used info.file_name.
        // Let's assume the fileName reflects the title or we use what's in the DB.
        const fileName = info.fileName || `${info.title}.png`; 
        return {
            ...info,
            url: `${R2_PUBLIC_URL}/uploads/infographics/${encodeURIComponent(fileName)}`
        };
    });
    fs.writeFileSync(infographicsPath, JSON.stringify(updatedInfographics, null, 4));
    console.log('Updated infographics.json with R2 URLs');
  }
}

updateJsonFiles();
