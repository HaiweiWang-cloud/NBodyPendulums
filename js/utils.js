function distance(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function getNearestPoint(loc, points, threshold = Number.MAX_SAFE_INTEGER) {
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null;
    for (const point of points) {
        const dist = distance(point, loc);
        if (dist < minDist && dist < threshold) {
            minDist = dist;
            nearest = point;
        }
    }
    
    return nearest;
}

function distanceToLine(point, segment) {
    // z-component of the cross product divided by length of the segment
    return Math.abs( (point.x - segment.p1.x) * (segment.p2.y - segment.p1.y) - (point.y - segment.p1.y) * (segment.p2.x - segment.p1.x) ) / segment.getLength();
}

function isWithinSegment(point, segment) {
    // if both dot product angles are acute, it is within the segment
    const dotProduct1 = (point.x - segment.p1.x) * (segment.p2.x - segment.p1.x) + (point.y - segment.p1.y) * (segment.p2.y - segment.p1.y);
    const dotProduct2 = (point.x - segment.p2.x) * (segment.p1.x - segment.p2.x) + (point.y - segment.p2.y) * (segment.p1.y - segment.p2.y);
    return dotProduct1 >= 0 && dotProduct2 >= 0;
}

function getNearestSegment(loc, segments, threshold = Number.MAX_SAFE_INTEGER) {
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null;
    for (const segment of segments) {
        const dist = distanceToLine(loc, segment)
        if (dist < Math.min(minDist, threshold) && isWithinSegment(loc, segment)) {
            minDist = dist;
            nearest = segment;
        }
    }
    return nearest;
}