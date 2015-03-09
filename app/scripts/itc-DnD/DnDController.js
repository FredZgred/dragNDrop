( function() {

    'use strict';

    function controller( $scope ) {

        function removeCols ( num ) {
            num = Math.abs( num );

            // deleting empty columns
            for( var i=0; i<$scope.structure.columns.length; i++ ) {
                if( $scope.structure.columns[ i ].length === 0 ) {
                    $scope.structure.columns.splice( i, 1 );
                    --num;
                }
                if( num === 0 ) {
                    break;
                }
            }

            // deleting filled columns when there was not enough empty columns
            if( num > 0 ) {
                for( var j=0; j<num; j++ ) {
                    angular.forEach( $scope.structure.columns[ $scope.structure.columns.length-1 ], function( elem ) {
                        $scope.structure.columns[ $scope.structure.columns.length-2 ].push( elem );
                    } );
                    $scope.structure.columns.splice( $scope.structure.columns.length-1, 1 );
                }
            }
        }

        $scope.renderColumns = function( num ) {
            if( num > 0 ) {
                for( var i=0; i<num; i++ ) {
                    $scope.structure.columns.push( [] );
                }
            }
            else {
                removeCols( num );
            }
        };


        $scope.getJson = function() {
            $scope.json = angular.toJson( $scope.structure );
        };


        $scope.updateFromJson = function() {
            $scope.structure = JSON.parse( $scope.json );
            if( $scope.structure.dropAreasCount < 3 ) {
                $scope.structure.dropAreasCount = 3;
            }
        };


        $scope.sortableOptions = {
            placeholder: 'btn',
            connectWith: '.droppable-area'
        };
    }

    angular.module( 'itc-DnD' )
            .controller( 'DnDController', [ '$scope', controller ] );
})();