function weightedChoice(weights: number[]): number {
    const total = weights.reduce((a, b) => a + b, 0);
    const threshold = Math.random() * total;

    let running = 0;
    for (let i = 0; i < weights.length; i++) {
        running += weights[i] || 0;
        if (running >= threshold) return i;
    }
    // Fallback: return last index if nothing was selected
    return weights.length - 1;
}

function randomNormal(mean: number, sd: number) {
    // Box-Muller transform
    let u = 1 - Math.random();
    let v = 1 - Math.random();
    return mean + sd * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(x: number, min: number, max: number) {
    return Math.max(min, Math.min(max, x));
}

function chooseDifficulty(rating: number) {
    const SD = 50;
    const raw = randomNormal(rating, SD);

    // ratings are 200–800
    return clamp(Math.round(raw), 200, 800);
}

export { weightedChoice, chooseDifficulty };