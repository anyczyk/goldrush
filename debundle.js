const fs = require('fs');
const path = require('path');

// Folder, w którym znajdują się bundle i mapa
const debundleDir = path.join(__dirname, 'debundle');
const mapPath = path.join(debundleDir, 'bundle.js.map');

// Sprawdzenie, czy plik mapy istnieje
if (!fs.existsSync(mapPath)) {
    console.error(`Nie znaleziono pliku mapy: ${mapPath}`);
    process.exit(1);
}

// Wczytanie mapy
let mapData;
try {
    mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
} catch (error) {
    console.error('Błąd podczas wczytywania pliku mapy:', error);
    process.exit(1);
}

if (!mapData.sourcesContent) {
    console.error("Mapa źródłowa nie zawiera klucza 'sourcesContent'");
    process.exit(1);
}

// Funkcja do oczyszczenia ścieżki z niepożądanych prefiksów i parametrów zapytania
function sanitizeSourcePath(sourcePath) {
    // Usuń część po '?' (query string), jeśli istnieje
    if (sourcePath.includes('?')) {
        sourcePath = sourcePath.split('?')[0];
    }
    // Usuń prefix "webpack:" jeśli występuje
    if (sourcePath.startsWith('webpack:')) {
        sourcePath = sourcePath.substring('webpack:'.length).replace(/^[/\\]+/, '');
    }
    return sourcePath;
}

// Ekstrakcja plików
mapData.sources.forEach((sourcePath, i) => {
    const content = mapData.sourcesContent[i];
    if (content) {
        // Wyczyszczenie ścieżki
        const cleanSourcePath = sanitizeSourcePath(sourcePath);
        // Ścieżka docelowa: zachowujemy strukturę oryginalnych plików w obrębie folderu debundle
        const targetPath = path.join(debundleDir, cleanSourcePath);
        const targetDir = path.dirname(targetPath);

        // Tworzenie katalogu docelowego, jeśli nie istnieje
        fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(targetPath, content, 'utf8');
        console.log(`Zapisano: ${targetPath}`);
    } else {
        console.warn(`Brak zawartości dla: ${sourcePath}`);
    }
});
