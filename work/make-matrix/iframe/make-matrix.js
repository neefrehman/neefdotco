function makeMatrix(dimensions, initialValues) {
    if (initialValues === void 0) {
        initialValues = null;
    }
    var currentDimensionWidth;
    var remainingDimensions;
    var needsRecursion;
    if (typeof dimensions === "number") {
        currentDimensionWidth = dimensions;
        remainingDimensions = dimensions - 1;
        needsRecursion = remainingDimensions > 0;
    } else {
        currentDimensionWidth = dimensions[0];
        remainingDimensions = dimensions.slice(1);
        needsRecursion = remainingDimensions.length > 0;
    }
    var currentMatrix = Array(currentDimensionWidth).fill(initialValues);
    var finalMatrix = needsRecursion
        ? currentMatrix.map(function () {
              return makeMatrix(remainingDimensions, initialValues);
          })
        : currentMatrix;
    return finalMatrix;
}
