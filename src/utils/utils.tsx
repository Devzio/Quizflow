


export function GenerateRandomPk(prefixNumber: number = 29) {
    return prefixNumber * 10000 + Math.floor(1000 + Math.random() * 9000)
} 


export function SaveJsonFile(filename :string, jsonString: string) {
    const data = JSON.stringify(JSON.parse(jsonString), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Use the provided name for the downloaded file
    a.download = `${filename}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}