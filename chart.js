
var svg = d3.select(".svg1"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;
    
var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveCardinal)  
    //.curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });

var test=[{"DATE": "20170601", "TMAX": 79.5, "TMIN": 59.1}, {"DATE": "20170602", "TMAX": 75.8, "TMIN": 62.7}, {"DATE": "20170603", "TMAX": 78.9, "TMIN": 57.5}, {"DATE": "20170604", "TMAX": 80.5, "TMIN": 57.8}, {"DATE": "20170605", "TMAX": 83.0, "TMIN": 57.0}, {"DATE": "20170606", "TMAX": 80.0, "TMIN": 57.5}, {"DATE": "20170607", "TMAX": 81.1, "TMIN": 55.6}]

var draw = function(data,chart) {
  //d3.selectAll("g > *").remove()
  var graph=d3.select(chart)
  graph.selectAll("g > *").remove()
  data.columns = ["DATE","TMAX","TMIN"]
  data.forEach(function(d) {
        d.date = parseTime(d.DATE);
    });
  var cities = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {date: d.date, temperature: d[id]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));

  y.domain([
    d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.temperature; }); }),
    d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.temperature; }); })
  ]);

  z.domain(cities.map(function(c) { return c.id; }));

  gr=graph.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  gr.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%B %d, %Y")));

  gr.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Temperature, ºF");

  var city = gr.selectAll(".city")
    .data(cities)
    .enter().append("g")
      .attr("class", "city");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

  city.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature-.2) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

  city.append("g").selectAll("circle")
  .data(function(d){return d.values})
  .enter()
  .append("circle")
  .attr("r", 2)
  .attr("cx", function(d){return x(d.date)})
  .attr("cy", function(d){return y(d.temperature)})
  //.attr("fill", "none")
  .attr("stroke", "black");

  city.append("g").selectAll("circle")
  .data(function(d){return d.values})
  .enter()
  .append("text")
  .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.temperature+.3) + ")"; })
  .attr("x", 3)
  .attr("dy", "0.2em")
  .style("font", "8px sans-serif")
  .text(function(d) { return d.temperature; });
 
};

