


export function GenerateRandomPk(prefixValue: number = 290000) {
    return prefixValue + Math.floor(1000 + Math.random() * 9000)
} 


export function SaveJsonFile(filename :string, jsonString: string) {
    const data = JSON.stringify(JSON.parse(jsonString), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Use the provided name for the downloaded file
    const safeFileName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeFileName}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}