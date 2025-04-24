


export function GenerateRandomPk(prefixValue: number = 290000) {
    return prefixValue + Math.floor(1000 + Math.random() * 9000)
} 