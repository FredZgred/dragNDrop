( function() {

    'use strict';

    var path, pos,
        scripts = angular.element( 'script' );

    angular.forEach( scripts, function( elem ) {
        if( ( pos = elem.src.indexOf( 'dragNDrop.js' ) ) > -1 ) {
            path = elem.src.substr( 0, pos );
        }
    } );

    function controller( $scope ) {
        $scope.structure = {};
        $scope.structure.unallocated = $scope.ngModel || [];
    }

    function link( scope ) {

        var clearWatch;
        scope.structure = {};


        function removeCols ( num ) {
            num = Math.abs( num );

            // deleting empty columns
            for( var i=0; i<scope.structure.columns.length; i++ ) {
                if( scope.structure.columns[ i ].length === 0 ) {
                    scope.structure.columns.splice( i, 1 );
                    --num;
                }
                if( num === 0 ) {
                    break;
                }
            }

            // deleting filled columns when there was not enough empty columns
            if( num > 0 ) {
                for( var j=0; j<num; j++ ) {
                    angular.forEach( scope.structure.columns[ scope.structure.columns.length-1 ], function( elem ) {
                        scope.structure.columns[ scope.structure.columns.length-2 ].push( elem );
                    } );
                    scope.structure.columns.splice( scope.structure.columns.length-1, 1 );
                }
            }
        }

        function renderColumns( num ) {
            if( num > 0 ) {
                for( var i=0; i<num; i++ ) {
                    scope.structure.columns.push( [] );
                }
            }
            else {
                removeCols( num );
            }
        }

        function setWatch( lastDACount ) {
            lastDACount = lastDACount || 0;
            clearWatch = scope.$watch( function() {
                return scope.structure.dropAreasCount;
            }, function( newV, oldV ) {
                if( ( newV>=3 && newV<oldV ) || ( newV>=4 && newV>oldV ) ) {
                    renderColumns( newV - ( oldV || lastDACount ) );
                }
            }, true );
        }


        scope.getJson = function() {
            scope.json = angular.toJson( scope.structure );
        };


        scope.updateFromJson = function() {
            var lastDACount = scope.structure.dropAreasCount;
            clearWatch();
            scope.structure = JSON.parse( scope.json );
            if( scope.structure.dropAreasCount < 3 ) {
                scope.structure.dropAreasCount = 3;
            }
            setWatch( lastDACount );
        };

        scope.removeItem = function( elem, col ) {
            col.splice( col.indexOf( elem ), 1 );
        };


        var draggedItem;
        scope.sortableOptions = {
            placeholder: 'btn',
            connectWith: '.droppable-area',
            start: function (e, ui) {
                draggedItem = ui.item.scope().elem;
                console.log(draggedItem);
            },
            update: function (e, ui) {
                ui.item.sortable.cancel();
                if (ctrl.controls !== ui.item.sortable.droptargetModel) {
                    return;
                }
                var dropindex = ui.item.sortable.dropindex;
                $timeout(function () {
                    var property = angular.copy(draggedItem);
                    ctrl.controls.splice(dropindex, 0, property);
                    property.id = 'property' + ctrl.controls.length;
                    ctrl.select(property);
                });
            }
        };

        setWatch();
    }

    function dragNDropDirective() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '='
            },
            link: link,
            controller: controller,
            templateUrl: path + 'dragNDropTemplate.html'
        };
    }


    angular.module('dragNDropModule', [ 'ui.sortable' ])
            .directive( 'dragNDrop', dragNDropDirective );
})();