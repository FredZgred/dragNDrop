( function() {

    'use strict';

    function controller() {
        var ctrl = this;

        ctrl.elements = [
            { title: 'firstElem', type: 0 },
            { title: 'secondElem', type: 0 },
            { title: 'thirdElem', type: 0 },
            { title: 'sixthElem', type: 0 },
            { title: 'seventhElem', type: 0 },
            { title: 'ninthElem', type: 0 },
            { title: 'tenthElem', type: 0 },
            { title: 'eighthElem', type: 0 },
            { title: 'fourthElem', type: 0 },
            { title: 'fifthElem', type: 0 }
        ];
    }

    angular.module( 'project' )
        .controller( 'projectController', [ controller ] );
})();