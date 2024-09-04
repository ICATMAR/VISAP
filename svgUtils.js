// Generate SVG path
const generateSVGPath = function (sizes, rangeSize, rangeNumInd) {
    let path = '';
    rangeSize = [...rangeSize]; // Copy
    rangeNumInd = [...rangeNumInd]; // Copy
    rangeSize[1] *= 1.1;
    rangeNumInd[1] *= 1.1;

    let sizesKeys = Object.keys(sizes);
    // If there is no data
    if (sizesKeys[1] == undefined) {
        let xPos = sizesKeys[0] / rangeSize[1];
        return 'M ' + (xPos - 0.01) + ' 0 L ' + xPos + ' ' + sizes[sizesKeys[0]].numInd / rangeNumInd[1] + ' L ' + (xPos + 0.01) + ' 0'; // One peak
    }
    // First two points
    let step = sizesKeys[0] - (sizesKeys[1] - sizesKeys[0]);
    if (isNaN(step / rangeSize[1])) { debugger; }
    path += 'M 0 0 L ' + step / rangeSize[1] + ' 0 ';
    // Data points
    for (const sKey of sizesKeys) {
        path += 'L ' + sKey / rangeSize[1] + ' ' + sizes[sKey].numInd / rangeNumInd[1] + ' ';
        if (sizes[sKey].numInd / rangeNumInd[1] > 1) { debugger }
    }
    // End point
    path += 'L 1 0';

    return path;
}





// Create HTML plot element
const createPlotHTMLEl = (specData, title, xlabel, ylabel, color) => {
    let plotEl = document.createElement('div');
    plotEl.classList.add('plot-container');
    // First row
    // ylabel-yaxis-plot
    let topRowEl = document.createElement('div');
    topRowEl.classList.add('ylabel-yaxis-plot-container');
    // Add elements
    // ylabel
    let ylabelEl = document.createElement('div');
    ylabelEl.classList.add('ylabel');
    let ylabelTextEl = document.createElement('div');
    ylabelTextEl.classList.add('ylabel-text');
    ylabelTextEl.innerText = ylabel;
    ylabelEl.appendChild(ylabelTextEl);
    // yaxis
    let yaxisEl = document.createElement('div');
    yaxisEl.classList.add('yaxis');
    let yTicksEls = createYAxisTicks(specData.rangeNumInd[1], 400);
    yaxisEl.append(...yTicksEls);
    // svg
    let svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.classList.add('plot');
    svgEl.setAttribute('viewBox', '0 0 1 1');
    svgEl.setAttribute('preserveAspectRatio', 'none');
    // path
    let pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', specData.svgPath);
    pathEl.setAttribute('stroke-linejoin', 'round');
    pathEl.setAttribute('vector-effect', 'non-scaling-stroke');
    pathEl.classList.add('path');
    pathEl.style.stroke = color;
    pathEl.style.fill = color.replace('0.85)', '0.4)');
    svgEl.appendChild(pathEl);
    topRowEl.append(ylabelEl, yaxisEl, svgEl);
    plotEl.appendChild(topRowEl);
    // Second row
    // xaxis-container
    let xaxisRowEl = document.createElement('div');
    xaxisRowEl.classList.add('xaxis-container');
    let fillerEl = document.createElement('div');
    fillerEl.classList.add('ylabel');
    let fillerEl2 = document.createElement('div');
    fillerEl2.classList.add('yaxis');
    xaxisRowEl.append(fillerEl, fillerEl2);
    // xaxis
    // xticks
    // Get x ticks
    // Find minimum step using sort
    let step = Infinity;
    Object.keys(specData.bySize).sort((a, b) => step = Math.min(step, Math.abs(a - b)));
    let xTipsEls = createXAxisTips(specData.rangeSize[1], 600, step);

    let xaxisEl = document.createElement('div');
    xaxisEl.classList.add('xaxis');
    xaxisEl.append(...xTipsEls);
    xaxisRowEl.append(xaxisEl);
    // right: 0, width: same as svg
    plotEl.appendChild(xaxisRowEl);
    // Third row
    // xlabel
    let xlabelEl = document.createElement('div');
    xlabelEl.classList.add('xlabel');
    xlabelEl.innerText = xlabel;
    plotEl.appendChild(xlabelEl);
    // right: 0, width: same as svg
    // Fourth row
    // title
    let titleEl = document.createElement('div');
    titleEl.classList.add('title')
    titleEl.innerText = title;
    plotEl.appendChild(titleEl);

    return plotEl;
}


const createMultiplePlotHTMLEl = (specData, keyClassName, title, xlabel, ylabel, color) => {
    let plotEl = document.createElement('div');
    plotEl.classList.add('plot-container');
    // First row
    // ylabel-yaxis-plot
    let topRowEl = document.createElement('div');
    topRowEl.classList.add('ylabel-yaxis-plot-container');
    // Add elements
    // ylabel
    let ylabelEl = document.createElement('div');
    ylabelEl.classList.add('ylabel');
    let ylabelTextEl = document.createElement('div');
    ylabelTextEl.classList.add('ylabel-text');
    ylabelTextEl.innerText = ylabel;
    ylabelEl.appendChild(ylabelTextEl);
    // yaxis
    let yaxisEl = document.createElement('div');
    yaxisEl.classList.add('yaxis');


    // svg
    let svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.classList.add('plot');
    svgEl.setAttribute('viewBox', '0 0 1 1');
    svgEl.setAttribute('preserveAspectRatio', 'none');

    let numSubPlots = Object.keys(specData[keyClassName]).length;
    Object.keys(specData[keyClassName]).forEach((key, index) => {
        // Create g to wrap the paths
        let gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        // path
        let pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', specData[keyClassName][key].svgPath);
        pathEl.setAttribute('stroke-linejoin', 'round');
        pathEl.setAttribute('vector-effect', 'non-scaling-stroke');
        pathEl.classList.add('path');
        pathEl.style.stroke = color;
        pathEl.style.fill = color.replace('0.85)', '0.4)');
        gEl.appendChild(pathEl);

        gEl.setAttribute('transform', 'translate(0, -' + index / (numSubPlots + 2) + ')');
        svgEl.appendChild(gEl);
    });

    topRowEl.append(ylabelEl, yaxisEl, svgEl);
    plotEl.appendChild(topRowEl);



    // Second row
    // xaxis-container
    let xaxisRowEl = document.createElement('div');
    xaxisRowEl.classList.add('xaxis-container');
    let fillerEl = document.createElement('div');
    fillerEl.classList.add('ylabel');
    let fillerEl2 = document.createElement('div');
    fillerEl2.classList.add('yaxis');
    xaxisRowEl.append(fillerEl, fillerEl2);
    // xaxis
    // xticks
    // Get x ticks
    // Find minimum step using sort
    let step = Infinity;
    Object.keys(specData.bySize).sort((a, b) => step = Math.min(step, Math.abs(a - b)));
    let xTipsEls = createXAxisTips(specData.rangeSize[1], 600, step);

    let xaxisEl = document.createElement('div');
    xaxisEl.classList.add('xaxis');
    xaxisEl.append(...xTipsEls);
    xaxisRowEl.append(xaxisEl);
    // right: 0, width: same as svg
    plotEl.appendChild(xaxisRowEl);
    // Third row
    // xlabel
    let xlabelEl = document.createElement('div');
    xlabelEl.classList.add('xlabel');
    xlabelEl.innerText = xlabel;
    plotEl.appendChild(xlabelEl);
    // right: 0, width: same as svg
    // Fourth row
    // title
    let titleEl = document.createElement('div');
    titleEl.classList.add('title')
    titleEl.innerText = title;
    plotEl.appendChild(titleEl);

    return plotEl;
}


// Create x axis tips
const createXAxisTips = (maxValue, width, step) => {
    // Pixel separation between ticks
    let pixelSeparation = 100;
    // Number of ticks
    let maxNumTicks = (width / pixelSeparation);
    // Number of possible steps
    let maxNumSteps = (maxValue / step);
    // Skip step when iterating steps
    let skipStep = Math.ceil(maxNumSteps / maxNumTicks);

    // Create g to wrap the xticks
    let elements = [];
    for (let i = 0; i < Math.floor(maxNumSteps); i += skipStep) {
        let normX = i / maxNumSteps;
        // tick
        let divEl = document.createElement('div');
        divEl.classList.add('xtick');
        divEl.style.left = 100 * normX + '%';
        elements.push(divEl);
        // text
        let textEl = document.createElement('div');
        textEl.classList.add('xtickText');
        textEl.style.left = 100 * normX + '%';
        textEl.style.top = '10px';
        textEl.innerText = step * i;
        elements.push(textEl);

    }
    return elements;
}


// Create y axis tips
const createYAxisTicks = (maxValue, height) => {
    // Pixel separation between ticks
    let pixelSeparation = 50;
    // Number of ticks
    let maxNumTicks = (height / pixelSeparation);

    let step = maxValue / maxNumTicks;
    // Find round step
    let exp = Math.floor(Math.log10(step));
    let noFloatsStep = Math.round(step / Math.pow(10, exp)) * Math.pow(10, exp);
    // Num ticks
    let numTicks = Math.floor(maxValue / noFloatsStep);

    // Create g to wrap the xticks
    let elements = [];
    for (let i = 0; i < numTicks; i ++) {
        let normY = i / numTicks;
        // tick
        let divEl = document.createElement('div');
        divEl.classList.add('ytick');
        divEl.style.bottom = 100 * normY + '%';
        elements.push(divEl);
        // text
        let textEl = document.createElement('div');
        textEl.classList.add('ytickText');
        textEl.style.bottom = 100 * normY + '%';
        textEl.innerText = noFloatsStep * i;
        elements.push(textEl);

    }
    return elements;
} 