( function() {

    'use strict';

    var path, pos,
        scripts = angular.element( 'script' );

    angular.forEach( scripts, function( elem ) {
        if( ( pos = elem.src.indexOf( 'dragNDrop.js' ) ) > -1 ) {
            path = elem.src.substr( 0, pos );
        }
    } );


    function validateObject( obj ) {
        return ( obj.hasOwnProperty( 'title' ) && obj.hasOwnProperty( 'type' ) );
    }


    // jesli element juz jest w kolumnie
    function ifObjectInsideArray( obj, array ) {
        var bool = false;
        angular.forEach( array, function( elem ) {
            if( elem.title === obj.title && elem.type === obj.type ) {
                bool = true;
                return;
            }
        });
        return bool;
    }


    function controller( $scope ) {
        $scope.structure = {};
        $scope.structure.unallocated = [];
        if( Array.isArray( $scope.ngModel ) ) {
            angular.forEach( $scope.ngModel, function( elem ) {
                if( validateObject( elem ) ) {
                    $scope.structure.unallocated.push( elem )
                }
            } );
        }
        $scope.structure.columns =[
            [], [], []
        ];
        $scope.dropAreasCount = 3;
    }

    function link( scope ) {

        var clearWatch;

        function ifObjectInUnallocated( obj ) {
            var bool = false;
            angular.forEach( scope.structure.unallocated, function( elem ) {
                if( elem.title === obj.title && elem.type === obj.type ) {
                    bool = true;
                    return;
                }
            });
            return bool;
        }

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

            console.log( num );

            // deleting filled columns when there was not enough empty columns
            if( num > 0 ) {
                for( var j=0; j<num; j++ ) {
                    angular.forEach( scope.structure.columns[ scope.structure.columns.length-1 ], function( elem ) {
                        if( !ifObjectInsideArray( elem, scope.structure.columns[ scope.structure.columns.length-2 ] ) ) {
                            scope.structure.columns[ scope.structure.columns.length-2 ].push( elem );
                        }
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
            lastDACount = lastDACount || scope.dropAreasCount;
            clearWatch = scope.$watch( function() {
                return scope.dropAreasCount;
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
            var lastDACount = scope.structure.columns.length;
            clearWatch();
            var data = JSON.parse( scope.json );


            // validation JSON
            if( Array.isArray( data.unallocated ) && data.unallocated.length !== 0 ) {
                angular.forEach( data.unallocated, function( elem ) {
                    if( validateObject( elem ) && !ifObjectInsideArray( elem, data.unallocated ) ) {
                        scope.structure.unallocated.push( elem );
                    }
                } );
            }
            console.log(data.columns.length);
            if( Array.isArray( data.columns ) && data.columns.length !== 0  ) {
                angular.forEach( data.columns, function( elem, index ) {
                    if( Array.isArray( elem ) ) {
                        if( index >= scope.structure.columns.length ) {
                            scope.structure.columns.push( [] );
                        }
                        if( elem.length !== 0 ) {
                            angular.forEach( elem, function( e ) {
                                if( validateObject( e ) ) {
                                    if( !ifObjectInsideArray( e, scope.structure.columns[ index ] ) ) {
                                        scope.structure.columns[ index ].push( e );
                                        if( !ifObjectInUnallocated( e ) ) {
                                            scope.structure.unallocated.push( e );
                                        }
                                    }
                                }
                            } );
                        }
                    }
                } );
            }
            scope.dropAreasCount = scope.structure.columns.length;
            setWatch( lastDACount );
        };

        scope.removeItem = function( elem, col ) {
            col.splice( col.indexOf( elem ), 1 );
        };


        scope.sortableOptions = {
            placeholder: 'btn',
            connectWith: '.droppable-area',
            update: function (e, ui) {
                if( ui.item.sortable.sourceModel === scope.structure.unallocated ) {
                    ui.item.sortable.cancel();
                    var draggedItem = ui.item.sortable.model,
                        target = ui.item.sortable.droptarget.scope().col;
                    if( target.indexOf( draggedItem ) > -1 ) {
                        return;
                    }
                    target.splice( ui.item.sortable.dropindex, 0, draggedItem );
                    scope.$apply();
                }
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