SnapGrid.GridManager = (function(){
	_drawLine = function(ctx, x1, y1, x2, y2){
		ctx.strokeStyle = '1px solid black';
		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	Grid = function($_container){
		this.resize = function(){
			_canvas.draw();
			
			$(_elements).each(function(idx, element){
				element.place();
			});
		}

		this.setSize = function(rows, cols){
			_canvas.setSize(rows, cols);
		}

		this.getRows = function(){
			return _canvas.getRows();
		}
		
		this.getCols = function(){
			return _canvas.getCols();
		}
		
		this.getElements = function(){
			return _elements;
		}
		
		$_container.addClass('snap-grid');

		var _canvas = new Canvas($_container);

		this.setSize(parseInt($_container.attr('snap-rows')) || 10,
				parseInt($_container.attr('snap-cols')) || 10);

		var _elements = [];

		
		$_container.find('.snap-element').each(function(idx, element){
				var sElement = new Element($(element), _canvas);
				
				_elements.push(sElement);
			});
	}
	
	Canvas = function($_container){
		_drawHLine = function(ctx, y, x1, x2){
			if(typeof(y) != 'number'){
				sg.Logger.error("SnapGrid.GridManager._drawHLine 'y' parameter must be a number");
			}

			//draw full width line
			if(typeof(x1) != 'number' || typeof(x2) != 'number'){
				x1 = 0;
				x2 = _canvas.width;
			}

			_drawLine(ctx, x1, y, x2, y);
		}

		_drawVLine = function(ctx, x, y1, y2){
			if(typeof(x) != 'number'){
				sg.Logger.error("SnapGrid.GridManager._drawVLine 'x' parameter must be a number");
			}

			//draw full height line
			if(typeof(y1) != 'number' || typeof(y2) != 'number'){
				y1 = 0;
				y2 = _canvas.height;
			}

			_drawLine(ctx, x, y1, x, y2);
		}

		_setRows = function(rows){
			if(typeof(rows) != 'number'){
				sg.Logger.error(new TypeError("SnapGrid.GridManager.Canvas._setRows param 'rows' must be a number."));
			}

			$_container.attr('snap-rows', rows);
			_rows = rows;
		}
		
		_setCols = function(cols){
			if(typeof(cols) != 'number'){
				sg.Logger.error(new TypeError("SnapGrid.GridManager.Canvas._setCols param 'cols' must be a number."));
			}

			_cols = cols;
		}
		
		this.setSize = function(rows, cols){
			_setRows(rows);
			_setCols(cols);
			this.draw();
		}

		this.getRows = function(){
			return _rows();
		}
		
		this.getCols = function(){
			return _cols;
		}

		this.getSHeight = function(){
			return _sHeight;
		}

		this.getSWidth = function(){
			return _sWidth;
		}
		
		this.getHeight = function(){
			return _canvas.height;
		}
		
		this.getWidth = function(){
			return _canvas.width;
		}
		
		this.draw = function(){
			var ctx = _canvas.getContext('2d');

			_canvas.width = $_container.width();
			_canvas.height = $_container.height();

			_sWidth = _canvas.width / _cols;
			_sHeight = _canvas.height / _rows

			ctx.clearRect(0, 0, _canvas.width, _canvas.height);

			for(var i = 1; i < _rows; i++){
				_drawHLine(ctx, i * _sHeight);
			}

			for(var i = 1; i < _cols; i++){
				_drawVLine(ctx, i * _sWidth);
			}
		}

		this.getDOMElement = function(){
			return _canvas;
		}

		var _canvas = document.createElement('canvas');
		var _sWidth;
		var _sHeight;
		
		$(_canvas).addClass('snap-canvas'); 
		$_container.append(_canvas);
	}
	
	Element = function($_element, _canvas){
		_setHeight = function(height){
			_height = height;
		}
		
		_setWidth = function(width){
			_width = width;
		}

		_getStartCol = function(){
			return Math.floor($_element.offset().left / _canvas.getSWidth());
		}

		_getStartRow = function(){
			return Math.floor($_element.offset().top / _canvas.getSHeight());
		}
		
		this.getCoordinates = function(){
			var gridPos = this.getGridPosition();
			
			var coords = {
				x1: gridPos.startCol * _canvas.getSWidth() + 1,
				y1: gridPos.startRow * _canvas.getSHeight() + 1,
				x2: gridPos.endCol * _canvas.getSWidth(),
				y2: gridPos.endRow * _canvas.getSHeight()
			};
			
			coords['width'] = coords.x2 - coords.x1;
			coords['height'] = coords.y2 - coords.y1;
			
			return coords;
		}
		
		this.getGridPosition = function(){
			var startRow = _getStartRow();
			var startCol = _getStartCol();
			
			return {
				startRow: startRow,
				startCol: startCol,
				endRow: startRow + _height,
				endCol: startCol + _width
			};
		}
		
		this.getWidth = function(){
			return _width;
		}
		
		this.getHeight = function(){
			return _height;
		}

		this.getDOMElement = function(){
			return $_element.get(0);
		}
		
		this.setSize = function(height, width){
			_setHeight(height);
			_setWidth(width);
			this.place();
		}
		
		this.place = function(event, ui){
			var coords = this.getCoordinates();
			
			$_element
				.width(coords.width)
				.height(coords.height)
				.offset({ top: coords.y1, left: coords.x1 });
		}
		
		var _height, _width;
		
		this.setSize($_element.attr('snap-height') || 2,
					$_element.attr('snap-width') || 2);

		$_element
			.draggable({
				containment: 'parent',
				stop: $.proxy(this.place, this)
			})
			.resizable({
				containment: 'parent',
				stop: $.proxy(this.place, this)
			});
	}

	return {
		init: function($container){
			return new Grid($container);
		}
	};
})();