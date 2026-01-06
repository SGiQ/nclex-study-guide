import fs from 'fs';
import path from 'path';

let cachedBookText: string | null = null;
const BOOKS_DIR = path.join(process.cwd(), 'public', 'uploads', 'Book');

export async function getBookContext(): Promise<string> {
    if (cachedBookText) {
        return cachedBookText;
    }

    try {
        console.log(`[PDF Loader] Scanning directory: ${BOOKS_DIR}`);

        // Lazy load pdf-parse to avoid top-level ESM/CommonJS issues
        let pdf: any;
        try {
            console.log("[PDF Loader] Importing pdf-parse...");
            pdf = require('pdf-parse');
            console.log("[PDF Loader] pdf-parse imported successfully.");
        } catch (importError) {
            console.error("[PDF Loader] FAILED to import pdf-parse:", importError);
            return "Error: Could not load PDF parser.";
        }

        if (!fs.existsSync(BOOKS_DIR)) {
            console.error(`[PDF Loader] Directory not found: ${BOOKS_DIR}`);
            return "Error: Book directory not found.";
        }

        const files = fs.readdirSync(BOOKS_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));

        // Sort files numerically based on the first number in the filename (e.g., "1-20" vs "21-52")
        files.sort((a, b) => {
            const numA = parseInt(a.split('-')[0]) || 0;
            const numB = parseInt(b.split('-')[0]) || 0;
            return numA - numB;
        });

        console.log(`[PDF Loader] Found ${files.length} PDF files. Processing...`);

        let fullText = "";

        for (const file of files) {
            const filePath = path.join(BOOKS_DIR, file);
            console.log(`[PDF Loader] Parsing: ${file}`);

            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);

            // Add clear section headers for the AI
            fullText += `\n\n--- SECTION: ${file} ---\n\n`;
            fullText += data.text;
        }

        cachedBookText = fullText;
        console.log(`[PDF Loader] specific successfully. Total length: ${fullText.length} characters.`);
        return fullText;

    } catch (error) {
        console.error("[PDF Loader] Error processing PDFs:", error);
        return "Error loading book context.";
    }
}
