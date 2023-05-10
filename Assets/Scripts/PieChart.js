/*globals palette*/
//import {SizeChart} from './SizeChart.js';
// Based on D3 example: https://observablehq.com/@d3/zoomable-sunburst
// d3 label center: https://observablehq.com/@kerryrodden/sequences-sunburst
// data variable is loaded from data.json (header)

// Optional todo: https://stackoverflow.com/questions/29978957/transitions-in-d3-on-load
// Basically create the graph with empty values and then fill with transition

class PieChart {
	constructor(originalData){
		this.currentData = null;
		this.originalData = originalData;

		this.sizeChart = undefined;//new SizeChart();
	}

	// Create the pie chart
	runApp(htmlContainer,data,d3, title, measure, unit){
		var that = this;

		this.currentData = data;

		const root = partition(data);
		var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
		var format = d3.format(",d");
		var width = 600;
		var radius = width / 6;

		var arc = d3.arc()
		    .startAngle(d => d.x0)
		    .endAngle(d => d.x1)
		    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
		    .padRadius(radius * 1.5)
		    .innerRadius(d => d.y0 * radius)
		    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

	  root.each(d => d.current = d);

	  const svg = d3.create("svg")
	      .attr("viewBox", [0, 0, width, width])
	      .style("font", "15px sans-serif");


		// Center label
		const centerLabel = svg
	    .append("text")
	    .attr("text-anchor", "middle")
	    .attr("fill", "#888")
	    //.style("visibility", "hidden");

	    // Title
			centerLabel
				.append("tspan")
				.attr("x", width/2)
				.attr("y", width/2)
				.attr("dy", "-2.2em")
				.text(title || "Pesca per ports");
	    // Breadcrumb
	    centerLabel
	      .append("tspan")
	      .attr("x", width/2)
	      .attr("y", width/2)
	      .attr("dy", "-1.2em")
	      .attr("font-size", "0.8em")
	      .attr("fill", "black")
	      .attr("class", "breadcrumb")
	      .text("");
	    // Selected
	    centerLabel
				.append("tspan")
				.attr("x", width/2)
				.attr("y", width/2)
	      .attr("dy", "0.3em")
	      .attr("font-size", "0.9em")
	      .attr("fill", "black")
	      .attr("class", "centerText")
				.text("");
	    // Measure
			centerLabel
		    .append("tspan")
		    .attr("x", width/2)
		    .attr("y", width/2)
		    .attr("dy", "2.2em")
				.attr("font-size", "0.8em")
		    .text(measure || "Biomassa");
	    // Units
		  centerLabel
		    .append("tspan")
		    .attr("x", width/2)
		    .attr("y", width/2)
		    .attr("dy", "3.5em")
				.attr("font-size", "0.8em")
				.attr("class", "biomassText")
		    .text(format(root.value) + " " + (unit||"kg / km2"));






		// Pie chart
	  const g = svg.append("g")
	      .attr("transform", `translate(${width / 2},${width / 2})`);

	  const path = g.append("g")
	    .selectAll("path")
	    .data(root.descendants().slice(1))
	    .join("path")
	      //.attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
				.attr("fill", d => {return palette[d.data.species] === undefined ? 'rgb(50, 50, 50)' : "rgb(" + palette[d.data.species].color + ")"})// returns 'rgb(1,1,1)'
	      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0.1)//0) // Here if you want to show other levels
	      .attr("d", d => arc(d.current));

	  path//.filter(d => d.children)
	      .style("cursor", "pointer")
	      .on("click", clicked);

	  path.on("mouseenter", mouseOnPath)
	      .on("mouseleave", mouseOffPath);

	  path.append("title")
	      .text(d => `${d.ancestors().map(d => d.data.species).reverse().join("/")}\n${format(d.value)}` + " kg/km2"); // TODO show label, modify label https://chartio.com/resources/tutorials/how-to-show-data-on-mouseover-in-d3js/#creating-a-tooltip-using-the-title-tag

	  const label = g.append("g")
	      .attr("pointer-events", "none")
	      .attr("text-anchor", "middle")
	      .style("user-select", "none")
	    .selectAll("text")
	    .data(root.descendants().slice(1))
	    .join("text")
	      .attr("dy", "0.35em")
	      .attr("fill-opacity", d => +labelVisible(d.current))
				.style("font", d => (d.x1 - d.x0) < 0.01 ?  (d.x1-d.x0)*100 * 15 +"px sans-serif" : "15px sans-serif")//(d.y1 - d.y0) * (d.x1 - d.x0) > 0.03 ? "15px sans-serif" : "8px sans-serif")
	      .attr("transform", d => labelTransform(d.current, d.target))
	      .text(d => d.data.translation || d.data.name);

	  const parent = g.append("circle")
	      .datum(root)
	      .attr("r", radius)
	      .attr("fill", "none")
	      .attr("pointer-events", "all")
	      .on("click", clicked);

	  function clicked(event, p) {

			// Create pop-up with length frequency for specie
			// if (p.children === undefined){
			// 	if (p.depth < 3) // No depth (only commercial/rebuig/restes)
			// 		that.sizeChart.createGraphInterface(p.data.species, p.parent.parent.data.name, undefined, event); // Port or Season, Zona or Year
			// 	else
			// 		that.sizeChart.createGraphInterface(p.data.species, p.parent.parent.data.name, p.parent.parent.parent.data.name, event); // Port or Season, Zona or Year
			// 	return;
			// }

			parent.datum(p.parent || root);

	    root.each(d => d.target = {
	      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
	      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
	      y0: Math.max(0, d.y0 - p.depth),
	      y1: Math.max(0, d.y1 - p.depth)
	    });


			// Show biomass
			centerLabel
				.select(".biomassText")
				.style("visibility", null)
				.text(format(p.value) +  " kg / km2");

	    // Hide center mouse hover label
	    centerLabel
	      .select(".centerText")
	      .style("visibility", "hidden")
	      .text("")


	    // Breadcrumb
	    let bcrumbstr = "";
	    p.ancestors().reverse().forEach((item,i) => bcrumbstr += (i == 0 || i == p.ancestors().length-1 || i > 2) ? "" : (item.data.translation || item.data.name) + " > ");
	    centerLabel
	      .select(".breadcrumb")
	      .text(bcrumbstr)


	    const t = g.transition().duration(750);

	    // Transition the data on all arcs, even the ones that aren’t visible,
	    // so that if this transition is interrupted, entering arcs will start
	    // the next transition from the desired position.
	    path.transition(t)
	        .tween("data", d => {
	          const i = d3.interpolate(d.current, d.target);
	          return t => d.current = i(t);
	        })
	      .filter(function(d) {
	        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
	      })
	        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0.1)//0) // Here if you want to show other levels
	        .attrTween("d", d => () => arc(d.current));

	    label.filter(function(d) {
	        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
	      }).transition(t)
	        .attr("fill-opacity", d => +labelVisible(d.target))
					.style("font", d => { // Modify font for small portions
						let percentage = 100*(d.target.x1 - d.target.x0)/(2*Math.PI);
						 return percentage < 2 ? Math.max(15*percentage/2,9)+"px sans-serif" : "15px sans-serif";
					})
	        .attrTween("transform", d => () => labelTransform(d.current, d.target));
	  }







	  // Show information about the path when mouse hover
	  function mouseOnPath(event, p){
	    if (p.current.y0 % 1 != 0) // During transition
	      return;
		// Visible text (dirty fix for using species in higher categories (port, season, etc.))
		let visibleText = ''
		if (p.data.children)
			visibleText = p.data.translation || p.data.name || p.data.species;
		else
			visibleText = p.data.species || p.data.translation || p.data.name;
	    // Show biomass
		centerLabel
			.select(".biomassText")
			.style("visibility", null)
			.text(format(p.value) +  " kg / km2");
	    centerLabel
	      .select(".centerText")
	      .style("visibility", null)
	      .text(visibleText)

	    // Get the ancestors of the current segment, minus the root
	    const sequence = [];
	    let pCenter = p;
	    for (let i = 0; i<Math.floor(p.current.y0); i++){
	      sequence.push(pCenter);
	      pCenter = pCenter.parent;
	    }
	    // Highlight ancestors
	    path.attr("fill-opacity", d =>
	        sequence.indexOf(d) >= 0 ? 0.8 : arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0.1
	      );
	    // Hide center label node
	    label.attr("fill-opacity", d =>
	      (pCenter == d ) ? 0 : +labelVisible(d.current)
	    );
	  }

	  function mouseOffPath(event, p){
	    if (p.current.y0 % 1 != 0) // During transition
	      return;
	    let pCenter = p;
	    const sequence = [];
	    // Find element on center
	    for (let i = 0; i<Math.ceil(p.current.y0); i++){
	      sequence.push(pCenter);
	      pCenter = pCenter.parent;
	    }
	    // Unhighlight ancestors
	    path.attr("fill-opacity", d =>
	      sequence.indexOf(d) >= 0 ? 0.6 : arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0.1
	    );
	    // Show center label node
	    label.attr("fill-opacity", d =>
	      pCenter == d ? 1 : +labelVisible(d.current)
	    );
	    // Show center label biomass
			centerLabel
				.select(".biomassText")
				.style("visibility", null)
				.text(format(pCenter.value) +  " kg / km2");
	    centerLabel
	      .select(".centerText")
	      .style("visibility", "hidden")
	      .text("")
	  }




	  function arcVisible(d) {
	    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
	  }

	  function labelVisible(d) {
	    return d.y1 <= 3 && d.y0 >= 0 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03; // Make the base label appear
	    //return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
	  }

	  function labelTransform(d, target) {

	    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
	    const y = (d.y0 + d.y1) / 2 * radius;
	    // Make the base label go to center

			if (target === undefined)
				return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`; // Default
	    else if (d.y0 < 1 && target.y0 <= 1) // Rotate base label to be horizontal
				return "rotate("+ (x - 90*d.y0) +") translate("+y*d.y0+",0) rotate("+(x < 180 ? 0 : 180)+")";
			else
				return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`; // Default
	  }



	  function partition(data){
	    const root = d3.hierarchy(data)
	        .sum(d => d.value) // Assing a value to each partition, based on the value of the smallest items
	        .sort((a, b) => b.value - a.value) // Organize partitions (here from big to small)
	  			.sort((a, b) => b.data.name == "Others" ? -1 : 1)
	    return d3.partition()
	        .size([2 * Math.PI, root.height + 1])
	      (root);
	  }

	  //return svg.node();
	  // Remove loader class
	  //htmlContainer.className = "my-4 w-100 mx-auto";
	  htmlContainer.appendChild(svg.node());
	}




	// Processes a basic sample with maximum categories being Comercial/Resta/Rebuig
	processSample(inData){
		const outData = {};
		outData.children = [];

		// Iterate over all rows
		for (let i = 0; i<inData.length; i++){
			let item = inData[i];
			let nomEspecie = item.ScientificName;
			let nomComu = item.EnglishName || item.ScientificName;
			let classCaptura = item.Classification;
			let biomass = item.Biomass_Kg_Km2;

			if (biomass < 0.01) // Do not display items with little biomass
				continue;


			// Create ClassificacioCaptura level if it does not exist
			if (outData.children.find(child => child.name === classCaptura) === undefined)
				outData.children.push({"name": classCaptura, "children": [], "species": classCaptura});

			let classIndex = outData.children.findIndex(child => child.name === classCaptura)
			// Assign biomass value
			outData.children[classIndex].children.push({"name": nomComu, "value": biomass, "species": nomEspecie});
		}

		this.originalData = outData;
		return outData;
	}


	// Processes biomass data for a specific port
	processPortBiomass(inData, portName){
		const outData = {};
		outData.children = [];

		// Iterate over all rows
		for (let i = 0; i<inData.length; i++){
			let item = inData[i];
			let nomEspecie = item.NomEspecie;
			let nomComu = item.NomCatala || item.NomComu || item.NomEspecie;
			let classCaptura = item.ClassificacioCaptura;
			let biomass = item.Biomassa_Kg_Km2 || item.Biomassa;

			if (biomass < 0.01) // Do not display items with little biomass
				continue;

			if (portName != item.NomPort)
				continue;

			// Create ClassificacioCaptura level if it does not exist
			if (outData.children.find(child => child.name === classCaptura) === undefined)
				outData.children.push({"name": classCaptura, "children": [], "species": classCaptura});

			let classIndex = outData.children.findIndex(child => child.name === classCaptura)
			// Assign biomass value
			outData.children[classIndex].children.push({"name": nomComu, "value": biomass, "species": nomEspecie});
		}

		this.originalData = outData;
		return outData;
	}











	// Prepare the data from the server-database
  	static prepDataPortBiomass(inData){

		const outData = {};
		outData.children = [];

		// Iterate over all rows
		for (let i = 0; i<inData.length; i++){
			let item = inData[i];
			let portArea = item.PortArea;
			let portName = item.PortName;
			let scientificName = item.ScientificName;
			let catalanName = item.CatalanName || item.ScientificName;
			let classification = item.Classification;
			let biomass = item.Biomass_Kg_Km2;

			if (biomass < 1) // Do not display items with little biomass
				continue;

			// Create ZonaPort level if it does not exist
			if (outData.children.find(child => child.name === portArea) === undefined)
				outData.children.push({"name": portArea, "children": [], "species": portArea});

			let portAreaIndex = outData.children.findIndex(child => child.name === portArea)
			// Create Port level if it does not exist
			let areaChilds = outData.children[portAreaIndex].children;
			if (areaChilds.find(child => child.name === portName) === undefined)
				outData.children[portAreaIndex].children.push({"name": portName, "children": [], "species": portName});

			let portIndex = outData.children[portAreaIndex].children.findIndex(child => child.name === portName)
			// Create category level (Landed, Discarded, Restes)
			let portChilds = outData.children[portAreaIndex].children[portIndex].children;
			if (portChilds.find(child => child.name === classification) === undefined)
				outData.children[portAreaIndex].children[portIndex].children.push({"name": classification, "children": [], "species": classification});

			let classIndex =  outData.children[portAreaIndex].children[portIndex].children.findIndex(child => child.name === classification)
			// If biomass is very small, put to others
			if ((biomass < 9 && classification == "Landed") || (biomass < 5 && classification == "Discarded")){
				let otherIndex =  outData.children[portAreaIndex].children[portIndex].children[classIndex].children.findIndex(child => child.name === "Other");
				// Define Other group
				if (otherIndex == -1) {
					outData.children[portAreaIndex].children[portIndex].children[classIndex].children.push({"name": "Other", "children": [], "species": "Other"});
					otherIndex = outData.children[portAreaIndex].children[portIndex].children[classIndex].children.length - 1;
				}
				// Assign to Other
				outData.children[portAreaIndex].children[portIndex].children[classIndex].children[otherIndex].children.push({"name": catalanName, "value": biomass, "species": scientificName});
			}
			// Biomass is bigger
			else {
				// Assign biomass value
				outData.children[portAreaIndex].children[portIndex].children[classIndex].children.push({"name": catalanName, "value": biomass, "species": scientificName});
			}
		}

		return outData;
	}


	// Prepare the data from the server-database
	static prepDataYearBiomass(inData){

		const outData = {};
		outData.children = [];

		// Iterate over all rows
		for (let i = 0; i<inData.length; i++){
				let item = inData[i];
				let year = item.Year;
			let season = item.Season;
			let scientificName = item.ScientificName;
			let catalanName = item.CatalanName || item.ScientificName;
			let classification = item.Classification;
			let biomass = item.Biomass_Kg_Km2;

			if (biomass < 1) // Do not display items with little biomass
				continue;

			// Create Year level if it does not exist
			if (outData.children.find(child => child.name === year) === undefined)
				outData.children.push({"name": year, "children": [], "species": year});

			let yearIndex = outData.children.findIndex(child => child.name === year)
			// Create Estacio level if it does not exist
			let yearChilds = outData.children[yearIndex].children;
			if (yearChilds.find(child => child.name === season) === undefined)
				outData.children[yearIndex].children.push({"name": season, "children": [], "species": season});

			let seasonIndex = outData.children[yearIndex].children.findIndex(child => child.name === season)// TODO HERE NOW
			// Create category level (Landed, Discarded, Restes)
			let seasonChilds = outData.children[yearIndex].children[seasonIndex].children;
			if (seasonChilds.find(child => child.name === classification) === undefined)
				outData.children[yearIndex].children[seasonIndex].children.push({"name": classification, "children": [], "species": classification});

			let classIndex =  outData.children[yearIndex].children[seasonIndex].children.findIndex(child => child.name === classification)
			// If biomass is very small, put to others
			if ((biomass < 7 && classification == "Landed") || (biomass < 4 && classification == "Discarded")){
				let otherIndex =  outData.children[yearIndex].children[seasonIndex].children[classIndex].children.findIndex(child => child.name === "Other");
				// Define Other group
				if (otherIndex == -1) {
					outData.children[yearIndex].children[seasonIndex].children[classIndex].children.push({"name": "Other", "children": [], "species": "Other"});
					otherIndex = outData.children[yearIndex].children[seasonIndex].children[classIndex].children.length - 1;
				}
				// Assign to Other
				outData.children[yearIndex].children[seasonIndex].children[classIndex].children[otherIndex].children.push({"name": catalanName, "value": biomass, "species": scientificName});
			}
			// Biomass is bigger
			else {
				// Assign biomass value
				outData.children[yearIndex].children[seasonIndex].children[classIndex].children.push({"name": catalanName, "value": biomass, "species": scientificName});
			}
		}


		// Because there is port area, several repeated species appear
		// Iterate to remove duplicated entries. The values are averaged
		/*outData.children.forEach(
			(anyItem) => anyItem.children.forEach(
				(estacioItem) => estacioItem.children.forEach(
					(classItem) => {
						averageChildren(classItem);
					}
				)
			)
		);*/

		return outData;
	}







}





//export {PieChart}
