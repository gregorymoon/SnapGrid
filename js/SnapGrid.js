/**
 * 
 */

var sg = sg || {logging: false};

$(document).ready(function(){
	//sg.showLoadingIndicator();
	sg.setLogging(true);
	sg.addCanvas(20, 20);
	
	$('.snap-element')
		.each(function(idx, obj){
			var $obj = $(obj);
			
			sg.dragSnapElement( {target: obj} );
			sg.placeElement($obj);
		})
		.draggable({
			containment: 'parent',
			drag: sg.dragSnapElement,
			start: sg.startDragSnapElement,
			stop: sg.stopDragSnapElement
		});
	
		
	
	$(window).on('resize', sg.updateGrid);
	$('.snap.loading-indicator').remove();
});

sg.showLoadingIndicator = function(){
	var $loading = $(document.createElement('div'));
	
	$loading
		.addClass('snap')
		.addClass('loading-indicator');

	$('body').append($loading);
}

sg.dragSnapElement = function(event, ui){
	var $element = $(event.target),
		grid = sg.drawEnclosingGrid($element);
	
	$element
		.attr({
			snapStartCol: grid.startCol,
			snapStartRow: grid.startRow,
		});
}

sg.clearLastGrid = function(){
	var ctx = sg.canvas.get(0).getContext('2d'),
		xCoords, yCoords;

	if(sg.lastGrid !== undefined){
		ctx.clearRect(sg.lastGrid.x1, sg.lastGrid.y1, sg.lastGrid.width, sg.lastGrid.height);

		for(var i = sg.lastGrid.startRow; i < sg.lastGrid.endRow; i++){
			yCoords = sg.getCoordsFromRow(i);

			sg.drawHorizontalLine(ctx, yCoords.y2, sg.lastGrid.x1, sg.lastGrid.x2);
		}

		for(var i = sg.lastGrid.startCol; i < sg.lastGrid.endCol; i++){
			xCoords = sg.getCoordsFromCol(i);

			sg.drawVerticalLine(ctx, xCoords.x2, sg.lastGrid.y1, sg.lastGrid.y2);
		}	

		if(sg.lastGrid.y1 != 0 && sg.lastGrid.y1 != sg.cols - 1){
			sg.drawHorizontalLine(ctx, sg.lastGrid.y1, sg.lastGrid.x1, sg.lastGrid.x2);
		}

		if(sg.lastGrid.y2 != 0 && sg.lastGrid.y2 != sg.cols - 1){
			sg.drawHorizontalLine(ctx, sg.lastGrid.y2, sg.lastGrid.x1, sg.lastGrid.x2);
		}

		if(sg.lastGrid.x1 != 0 && sg.lastGrid.x1 != sg.rows - 1){
			sg.drawVerticalLine(ctx, sg.lastGrid.x1, sg.lastGrid.y1, sg.lastGrid.y2);
		}

		if(sg.lastGrid.x2 != 0 && sg.lastGrid.x2 != sg.rows - 1){
			sg.drawVerticalLine(ctx, sg.lastGrid.x2, sg.lastGrid.y1, sg.lastGrid.y2);
		}
	}

	return ctx;
}

sg.getCoordsFromRow = function(row){
	var y1 = row * sg.sHeight;

	return {
		y1: y1,
		y2: y1 + sg.sHeight
	};
}

sg.getCoordsFromCol = function(col){
	var x1 = col * sg.sWidth;

	return {
		x1: x1,
		x2: x1 + sg.sWidth
	};
}

sg.placeElement = function($element){
	if(!$element.hasClass('snap-element')){
		sg.error("placeElement cannot place element that is does not have 'snap-element' class");
		return;
	}

	var coords = sg.getCoordsFromSnapElement($element);
	
	$element.offset({ left: coords.x1, top: coords.y1 });
	$element.width(coords.width - 1);
	$element.height(coords.height - 1);
}

sg.getCoordsFromSnapElement = function($element){
	var startCol = parseInt($element.attr('snapStartCol')),
		x1 = sg.getCoordsFromCol(startCol).x1,
		x2 = sg.getCoordsFromCol(startCol + parseInt($element.attr('snapWidth'))).x1,
		startRow = parseInt($element.attr('snapStartRow')),
		y1 = sg.getCoordsFromRow(startRow).y1,
		y2 = sg.getCoordsFromRow(startRow + parseInt($element.attr('snapHeight'))).y1;
	
	return {
		x1: x1,
		x2: x2,
		y1: y1,
		y2: y2,
		height: y2 - y1,
		width: x2 - x1
	};
}

sg.getCoordsFromRowAndCol = function(row, col){
	var yCoords = sg.getCoordsFromRow(row),
		xCoords = sg.getCoordsFromCol(col);
	
	return {
		x1: xCoords.x1,
		x2: xCoords.x2,
		y1: yCoords.y1,
		y2: yCoords.y2,
		width: xCoords.x2 - xCoords.x1,
		height: yCoords.x2 - yCoords.x1
	};
}

sg.drawEnclosingGrid = function($element){
	var grid = sg.getEnclosingGrid($element), ctx;

	ctx = sg.clearLastGrid();
	sg.lastGrid = grid;
	ctx.fillStyle = 'lightblue';
	ctx.fillRect(grid.x1, grid.y1, grid.width, grid.height);

	return grid;
}

sg.getEnclosingGrid = function($element){
	var startRow = Math.floor($element.position().top / sg.canvas.snapHeight * sg.rows),
		endRow = startRow + parseInt($element.attr('snapHeight')),
		startCol = Math.floor($element.position().left / sg.canvas.snapWidth * sg.cols),
		endCol = startCol + parseInt($element.attr('snapWidth')),
		x1 = startCol * sg.sWidth,
		x2 = endCol * sg.sWidth,
		y1 = startRow * sg.sHeight,
		y2 = endRow * sg.sHeight;
	
	var grid = {
		startCol: startCol,	
		x1: x1,
		endCol: endCol,	
		x2: x2,
		startRow: startRow,	
		y1: y1,
		endRow: endRow,	
		y2: y2,
		width: x2 - x1,
		height: y2 - y1
	}
	
	return grid;
}

sg.startDragSnapElement = function(event, ui){
	sg.clearLastGrid();
	sg.canvas.show(200);
}

sg.stopDragSnapElement = function(event, ui){
	sg.clearLastGrid();
	sg.placeElement($(event.target));
	sg.canvas.hide(200);
}

sg.addCanvas = function(rows, cols){
	if((sg.canvas = $('canvas.snap')).length === 0){
		sg.log('Adding canvas');
		
		sg.canvas = $(document.createElement('canvas'))
						.addClass('snap')
						.append('Your browser does not support SnapGrid');
		
		$('body').append(sg.canvas);
		sg.setCanvasSize(rows, cols);
		sg.canvas.hide();
	}
	else{
		sg.log('Canvas already exists');
	}
}

sg.setCanvasSize = function(rows, cols){
	if(typeof(rows) != 'number'){
		sg.warning("setCanvasSize 'rows' parameter must be an integer");
		rows = 2;
	}

	if(typeof(cols) != 'number'){
		sg.warning("setCanvasSize 'cols' parameter must be an integer");
		cols = 2;
	}
	
	sg.rows = rows;
	sg.cols = cols;

	sg.updateGrid();
}

sg.updateGrid = function(){
	var canvas = sg.canvas.get(0),
		ctx = canvas.getContext('2d');

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	sg.canvas.snapHeight = canvas.height;
	sg.canvas.snapWidth = canvas.width;
	sg.sWidth = canvas.width / sg.cols;
	sg.sHeight = canvas.height / sg.rows;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(var i = 1; i < sg.rows; i++){
		sg.drawHorizontalLine(ctx, i * sg.sHeight);
	}

	for(var i = 1; i < sg.cols; i++){
		sg.drawVerticalLine(ctx, i * sg.sWidth);
	}
}

sg.drawHorizontalLine = function(ctx, y, x1, x2){
	if(typeof(y) != 'number'){
		sg.error("drawHorizontalLine 'y' parameter must be a number");
		return;
	}

	if(typeof(x1) != 'number' || typeof(x2) != 'number'){
		x1 = 0;
		x2 = sg.canvas.width();
	}

	sg.drawLine(ctx, x1, y, x2, y);
}

sg.drawVerticalLine = function(ctx, x, y1, y2){
	if(typeof(x) != 'number'){
		sg.error("drawVerticalLine 'x' parameter must be a number");
		return;
	}

	if(typeof(y1) != 'number' || typeof(y2) != 'number'){
		y1 = 0;
		y2 = sg.canvas.height();
	}

	sg.drawLine(ctx, x, y1, x, y2);
}

sg.drawLine = function(ctx, x1, y1, x2, y2){
	ctx.strokeStyle = '1px solid black';
	ctx.fillStyle = 'black';
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

sg.setLogging = function(status){
	if(typeof(status) == 'boolean'){
		sg.logging = true;

		if(status){
			sg.log('Enabling logging');
		}
		else{
			sg.log('Disabling logging');
		}
	}
}

sg.warning = function(message){
	if(sg.logging){
		console.log('SnapGrid Warning: ' + message);
	}
}

sg.error = function(message){
	if(sg.logging){
		console.log('SnapGrid Error: ' + message);
	}
}

sg.log = function(message){
	if(sg.logging){
		console.log('SnapGrid: ' + message);
	}
}