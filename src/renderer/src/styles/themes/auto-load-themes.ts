// Auto-load every theme stylesheet from the packs directory.
// Add a new .css file there and it will be included automatically.
import.meta.glob("./packs/*.css", { eager: true });
