export function zoom<T>(
    chartData: T[],
    activeIndex: number,
    zoomLevel: number,
    baseZoomFactor: number,
) {
    if (zoomLevel === 0) return chartData;

    const zoomFactor = Math.max(baseZoomFactor / zoomLevel, 1);

    const sliceStart = Math.max(activeIndex - Math.floor(zoomFactor), 0);
    const sliceEnd = Math.min(
        activeIndex + Math.ceil(zoomFactor),
        chartData.length,
    );

    return chartData.slice(sliceStart, sliceEnd);
}
