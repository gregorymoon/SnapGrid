/** @constructor */
SnapGrid = function() {
	function test(){
		console.log('test');
	}

	var _containers = [];
	var _grids = {};

	this.grids = function(){
		return _grids;
	}

	this.containers = function(){
		return _containers;
	}

	this.resizeAll = function(){
		$(Object.keys(_grids)).each(function(idx, key){
			_grids[key].resize();
		});
	}

	_drawLine = function(ctx, x1, y1, x2, y2){
		ctx.strokeStyle = '1px solid black';
		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	/**
	 * SElement Constructor
	 * 
	 * @constructor
	 */
	SElement = function($_element, _grid){
		this.resize = function(event, ui){
			
		}
		
		this.startResize = function(event, ui){
			_grid.show(SnapGrid.INTERVAL);
		}
		
		this.stopResize = function(event, ui){
			_grid.hide(SnapGrid.INTERVAL);
		}

		this.resize = function(event, ui){
			
		}
		
		this.startDrag = function(event, ui){
			_grid.show(SnapGrid.INTERVAL);
		}
		
		this.stopDrag = function(event, ui){
			_grid.hide(SnapGrid.INTERVAL);
		}

		$_element
			.resizable({
				containment: 'parent',
				start: this.startResize,
				stop: this.stopResize,
				resize: this.resize,
			})
			.draggable({
				containment: 'parent',
				start: this.startDrag,
				stop: this.stopDrag,
				resize: this.resize,
			});
	}
	
	/**
	 * SGrid Constructor
	 * 
	 * @param {string} selector - The selector for the element to become a Grid.
	 * @constructor
	 */
	this.SGrid = function($_container, rows, cols){
		this.getSElements = function(){
			return _sElements;
		}

		this.getContainer = function(){
			return $_container;
		}

		this.getCanvas = function(){
			return _canvas;
		}

		this.setGridSize = function(rows, cols){
			_canvas.setNumRows(rows);
			_canvas.setNumCols(cols);
			_canvas.draw();
		}

		this.resize = function(){
			this.updateCanvasSize($_container.height(), $_container.width());
		}

		this.updateCanvasSize = function(height, width){
			var $element = $(_canvas.getCanvasElement());

			$element.attr('width', width);
			$element.attr('height', height);
			_canvas.draw();
		}

		this.show = function(interval){
			_canvas.show(interval);
		}

		this.hide = function(interval){
			_canvas.hide(interval);
		}

		if(typeof($_container) != 'object'){
			SnapGrid.Logger.logError(new TypeError("SnapGrid.Grid: '$_container' param must be a jQuery object."));
		}
		else if($.inArray($_container, _containers) > -1){
			SnapGrid.Logger.logError("SnapGrid.Grid: '" + $_container + "' is already a Grid.");
		}
		else if($_container.length == 0){
			SnapGrid.Logger.logError("SnapGrid.Grid: DOM element '" + $_container + "' does not exist.");
		}

		var _canvas = new Canvas($_container);
		var _sElements = [];
		
		this.updateCanvasSize($_container.height(), $_container.width());
		this.setGridSize(rows, cols);
		
		var snapElements = $_container.find('.snap-element');
		
		for(var i = 0; i < snapElements.length; i++){
			_sElements.push(new SElement($(snapElements[i]), this));
		}

		_containers.push($_container);
		_grids[$_container] = this;
		_canvas.hide();
	}

	/**
	 * Canvas Constructor
	 * 
	 * @class
	 */
	Canvas = function($container){
		this.draw = function(){
			var ctx = _canvas.getContext('2d');

			_sWidth = _canvas.width / _cols;
			_sHeight = _canvas.height / _rows

			ctx.clearRect(0, 0, _canvas.width, _canvas.height);

			_sWidth = _canvas.width / _cols;
			_sHeight = _canvas.height / _rows

			ctx.clearRect(0, 0, _canvas.width, _canvas.height);

			for(var i = 1; i < _rows; i++){
				this.drawHLine(ctx, i * _sHeight);
			}

			for(var i = 1; i < _cols; i++){
				this.drawVLine(ctx, i * _sWidth);
			}
		}

		this.show = function(interval){
			$(_canvas).show(interval);
		}

		this.hide = function(interval){
			$(_canvas).hide(interval);
		}

		this.getCanvasElement = function(){
			return _canvas;
		}

		this.drawHLine = function(ctx, y, x1, x2){
			if(typeof(y) != 'number'){
				SnapGrid.Logger.logError("drawHLine 'y' parameter must be a number");
			}

			//draw full width line
			if(typeof(x1) != 'number' || typeof(x2) != 'number'){
				x1 = 0;
				x2 = _canvas.width;
			}

			_drawLine(ctx, x1, y, x2, y);
		}

		this.drawVLine = function(ctx, x, y1, y2){
			if(typeof(x) != 'number'){
				SnapGrid.Logger.logError("drawVLine 'x' parameter must be a number");
			}

			//draw full height line
			if(typeof(y1) != 'number' || typeof(y2) != 'number'){
				y1 = 0;
				y2 = _canvas.height;
			}

			_drawLine(ctx, x, y1, x, y2);
		}


		this.setNumRows = function(rows){
			if(typeof(rows) != 'number'){
				SnapGrid.Logger.logError(new TypeError("SnapGrid.Canvas: 'rows' param must be a number."));
			}

			_rows = parseInt(rows);
		}

		this.setNumCols = function(cols){
			if(typeof(cols) != 'number'){
				SnapGrid.Logger.logError(new TypeError("SnapGrid.Canvas: 'cols' param must be a number."));
			}

			_cols = parseInt(cols);
		}

		var _rows, _cols;
		var _sWidth, _sHeight;

		if(typeof($container) != 'object'){
			SnapGrid.Logger.logError(new TypeError("SnapGrid.Canvas: 'container' param should be jQuery object."));
		}

		var _canvas = document.createElement('canvas');
		$(_canvas).addClass('snap-canvas');

		$container.append(_canvas);
	}
}

SnapGrid.INTERVAL = 200;
SnapGrid.EXISTS = false;

/**
 * Error
 * 
 * @namespace
 */

SnapGrid.Error = {
		/**
		 * @constructor
		 */
		InvalidSelectorError: function(){

		}
};

/**
 * Logger
 * 
 * @namespace
 */
SnapGrid.Logger = {
		logError: function(error){
			if(error instanceof Error){
				throw error;
			}
			else{
				throw Error(error);
			}
		},

		logWarning: function(message){

		},

		log: function(message){
			console.log('SnapGrid: ' + message);
		}
};

var sg = sg || new SnapGrid();

$(document).ready(function(){
	$(window).on('resize', sg.resizeAll);
	
	$('.snap-grid').each(function(idx, grid){
		var $grid = $(grid);

		new sg.SGrid($grid, parseInt($grid.attr('snap-rows')) || 10 , parseInt($grid.attr('snap-cols')) || 10);
	});
});

;