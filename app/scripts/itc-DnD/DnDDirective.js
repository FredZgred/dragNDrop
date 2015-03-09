( function() {

    'use strict';

    function link( scope ) {

        scope.structure = {
            dropAreasCount: 4,
            unallocated: [
                { title: 'firstElem', type: 0 },
                { title: 'secondElem', type: 0 },
                { title: 'thirdElem', type: 0 },
                { title: 'sixthElem', type: 0 },
                { title: 'seventhElem', type: 0 }
            ],
            columns: [
                [
                    { title: 'ninthElem', type: 0 },
                    { title: 'tenthElem', type: 0 }
                ],
                [
                    { title: 'eighthElem', type: 0 }
                ],
                [],
                [
                    { title: 'fourthElem', type: 0 },
                    { title: 'fifthElem', type: 0 }
                ]
            ]
        };

        console.log({"dropAreasCount":5,"unallocated":[{"title":"firstElem","type":0},{"title":"secondElem","type":0},{"title":"thirdElem","type":0},{"title":"sixthElem","type":0},{"title":"seventhElem","type":0}],"columns":[[{"title":"ninthElem","type":0},{"title":"tenthElem","type":0}],[{"title":"eighthElem","type":0}],[],[{"title":"fourthElem","type":0},{"title":"fifthElem","type":0}],[]]});

        scope.$watch( function() {
            return scope.structure.dropAreasCount;
        }, function( newV, oldV ) {
            if( ( newV>=3 && newV<oldV ) || ( newV>=4 && newV>oldV ) ) {
                scope.renderColumns( newV - ( oldV || 0 ) );
            }
        }, true );
    }

    function directive() {
        return {
            restrict: 'E',
            scope: {},
            link: link,
            controller: 'DnDController',
            templateUrl: 'scripts/itc-DnD/DnDTemplate.html'
        };
    }

    angular.module( 'itc-DnD' )
        .directive( 'dragNDrop', directive );
})();