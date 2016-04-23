/** @constructor */
SnapGrid = function() {
	var _selectors = [];
	var _grids = {};

	this.grids = function(){
		return _grids;
	}

	this.selectors = function(){
		return _selectors;
	}

	this.resizeAll = function(){
		console.log(_grids);

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
	 * Grid Constructor
	 * 
	 * @param {string} selector - The selector for the element to become a Grid.
	 * @constructor
	 */
	this.Grid = function(selector, rows, cols){
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

		if(typeof(selector) != 'string'){
			SnapGrid.Logger.logError(new TypeError("SnapGrid.Grid: 'selector' param must be a string."));
		}
		else if($.inArray(selector, _selectors) > -1){
			SnapGrid.Logger.logError("SnapGrid.Grid: '" + selector + "' is already a Grid.");
		}
		else if($(selector).length == 0){
			SnapGrid.Logger.logError("SnapGrid.Grid: DOM element '" + selector + "' does not exist.");
		}

		var $_container = $(selector).addClass('snap-grid');
		var _canvas = new Canvas($_container);

		this.updateCanvasSize($_container.height(), $_container.width());
		this.setGridSize(rows, cols);

		_selectors.push(selector);
		_grids[selector] = this;
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


//DELETE!!

$(document).ready(function(){
	var grid = new sg.Grid('body', 10, 10);
	var grid1 = new sg.Grid('#snap-class-test', 2, 10);
	$('#snap-class-test').resizable();

	$(window).on('resize', sg.resizeAll);
});

;