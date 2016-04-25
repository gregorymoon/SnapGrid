SnapGrid = sg = (function(){
	var _grids = [];
	
	_resizeGrids = function(){
		$(_grids).each(function(idx, grid){
			grid.resize();
		});
	}
	
	return {
		initialize: function(){
			$('.snap-grid').each(function(idx, grid){
				_grids.push(sg.GridManager.init($(grid)));
			});
			
			$(window).on('resize', _resizeGrids);
		},
		getGrids: function(){
			return _grids;
		}
	};
})();

$(document).ready(function(){
	sg.initialize();
});