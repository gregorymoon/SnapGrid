/**
 * 
 */

var sg = sg || {logging: false};

$(document).ready(function(){
	sg.setLogging(true);
	sg.addCanvas(30, 50);
	
	$('.snap-element')
		.each(function(idx, obj){
			var $obj = $(obj);
			
			sg.dragSnapElement( {target: obj} );
			sg.placeElement($obj);
		})
		.resizable({
			containment: 'parent',
			resize: sg.resizeSnapElement,
			start: sg.startResizeSnapElement,
			stop: sg.endResizeSnapElement
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


/*
 * Coordinate to Grid Position Translations
 */

sg.getColFromXCoord = function(x){
	return Math.floor(x / sg.canvas.snapWidth * sg.cols);
}

sg.getRowFromYCoord = function(y){
	return Math.floor(y / sg.canvas.snapHeight * sg.rows);
}

sg.getGridPosFromCoords = function(x, y){
	return {
		row: sg.getRowFromYCoord(y),
		col: sg.getColFromXCoord(x)
	};
}

sg.getGridPosFromElement = function($element){
	var startPos = sg.getGridPosFromCoords($element.position().left, $element.position().top);
	
	return {
		startCol: startPos.col,
		startRow: startPos.row,
		endCol: sg.getColFromXCoord($element.position().left + $element.width()),
		endRow: sg.getRowFromYCoord($element.position().top + $element.height())
	};
}

/*
 * Grid Position to Coordinates Translations
 */

sg.getCoordsFromGridPos = function(row, col){
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

sg.getCoordsFromElement = function($element){
	var startCol = parseInt($element.attr('snapStartCol')),
		startRow = parseInt($element.attr('snapStartRow'));
	
	if(startCol > sg.cols || startCol < 0){
		sg.warning("getCoordsFromElement - startCol out of bounds for: ", $element);
		startCol = Math.floor(sg.cols/2);
		$element.attr('startCol', startCol);
		$element.attr('snapWidth', endCol - startCol);
	}

	if(startRow > sg.rows || startRow < 0){
		sg.warning("getCoordsFromElement - startRow out of bounds for: ", $element);
		startRow = Math.floor(sg.rows/2);
		$element.attr('startRow', startRow);
		$element.attr('snapHeight', endRow - startRow);
	}
	
	var endCol = startCol + parseInt($element.attr('snapWidth')),
		endRow = startRow + parseInt($element.attr('snapHeight'));

	if(endCol > sg.cols || endCol < 0 || endCol < startCol){
		sg.warning("getCoordsFromElement - endCol out of bounds for:", $element);
		endCol = startCol + 1;
		$element.attr('snapWidth', endCol - startCol);
	}

	if(endRow > sg.rows || endRow < 0 || endRow < startRow){
		sg.warning("getCoordsFromElement - endRow out of bounds for: ", $element);
		endRow = startRow + 1;
		$element.attr('snapHeight', endRow - startRow);
	}

	var x1 = sg.getCoordsFromCol(startCol).x1,
		x2 = sg.getCoordsFromCol(endCol).x1,
		y1 = sg.getCoordsFromRow(startRow).y1,
		y2 = sg.getCoordsFromRow(endRow).y1;
	
	return {
		x1: x1,
		x2: x2,
		y1: y1,
		y2: y2,
		height: y2 - y1,
		width: x2 - x1
	};
}

/*
 * Resizing Snap Elements
 */

sg.resizeSnapElement = function(event, ui){
	var $element = $(event.target);
	sg.canvas.show();
	$element.width(ui.size.width);
	$element.height(ui.size.height);
	
	var grid = sg.getGridPosFromElement($element),
		snapWidth = grid.endCol - grid.startCol,
		snapHeight = grid.endRow - grid.startRow;
	
	$element
		.attr({
			snapWidth: snapWidth > 0 ? snapWidth : 1,
			snapHeight: snapHeight > 0 ? snapHeight : 1
		});
}

sg.startResizeSnapElement = function(event, ui){
	var $element = $(event.target);

	sg.log('end resizing');
}

sg.endResizeSnapElement = function(event, ui){
	sg.canvas.hide(200);
	sg.placeElement($(event.target));
}

/*
 * Dragging Snap Elements
 */

sg.dragSnapElement = function(event, ui){
	var $element = $(event.target),
		grid = sg.drawEnclosingGrid($element);
	
	$element
		.attr({
			snapStartCol: grid.startCol,
			snapStartRow: grid.startRow,
		});
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

/*
 * Canvas Drawing
 */

sg.clearLastGrid = function(){
	var ctx = sg.canvas.get(0).getContext('2d'),
		xCoords, yCoords;

	if(sg.lastGrid !== undefined){
		var temp = ctx.globalCompositeOperation;
		ctx.globalCompositeOperation = 'xor';
		ctx.clearRect(sg.lastGrid.x1, sg.lastGrid.y1, sg.lastGrid.width, sg.lastGrid.height);
		ctx.globalCompositeOperation = temp;

		for(var i = sg.lastGrid.startRow; i < sg.lastGrid.endRow - 1; i++){
			yCoords = sg.getCoordsFromRow(i);

			sg.drawHorizontalLine(ctx, yCoords.y2, sg.lastGrid.x1, sg.lastGrid.x2);
		}

		for(var i = sg.lastGrid.startCol; i < sg.lastGrid.endCol - 1; i++){
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

sg.placeElement = function($element){
	if(!$element.hasClass('snap-element')){
		sg.error("placeElement cannot place element that is does not have 'snap-element' class");
		return;
	}
	
	var coords = sg.getCoordsFromElement($element);
	
	$element.offset({ left: coords.x1, top: coords.y1 });
	$element.width(coords.width - 1);
	$element.height(coords.height - 1);
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
	var grid = sg.getGridPosFromElement($element),
		x1 = grid.startCol * sg.sWidth,
		x2 = grid.endCol * sg.sWidth,
		y1 = grid.startRow * sg.sHeight,
		y2 = grid.endRow * sg.sHeight;
	
	var grid = {
		startCol: grid.startCol,	
		x1: x1,
		endCol: grid.endCol,	
		x2: x2,
		startRow: grid.startRow,	
		y1: y1,
		endRow: grid.endRow,	
		y2: y2,
		width: x2 - x1,
		height: y2 - y1
	}
	
	return grid;
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

	canvas.width = $('body').width();//canvas.clientWidth;
	canvas.height = $('body').height();//canvas.clientHeight;

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
	
	sg.lastGrid = undefined;
	
	$('.snap-element').each(function(idx, obj){
		sg.placeElement($(obj));
	});
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

/*
 * Logging
 */

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

sg.warning = function(message, param){
	if(sg.logging){
		console.log('SnapGrid Warning: ' + message);
		
		if(param !== undefined){
			console.log(param);
		}
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