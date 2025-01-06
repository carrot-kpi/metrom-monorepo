export function priceToTick(price: number) {
    return Math.round(Math.log(price) / Math.log(1.0001));
}

export function tickToPrice(tick: number) {
    return Math.pow(1.0001, tick);
}