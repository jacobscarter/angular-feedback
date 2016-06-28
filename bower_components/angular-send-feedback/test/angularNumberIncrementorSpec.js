describe('AngularNumberIncrementor', function() {
    var $compile, $rootScope;

    beforeEach(module('angular-number-incrementor'));


    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    function createView(scope) {
        scope.increase = function(){
            scope.spinnerValue++;
        };

        scope.decrease = function(){
            scope.spinnerValue--;
        };
        var element = angular.element('<number-incrementor></number-incrementor>');
        var elementCompiled = $compile(element)(scope);
        $rootScope.$digest();
        return elementCompiled;
    }

    it("number should increase by one", function() {
        var scope = $rootScope.$new();
        var view = createView(scope);
        scope.spinnerValue = 0;
        scope.increase();
        $rootScope.$digest();
        expect(scope.spinnerValue).toEqual(1);
    });

    it("number should decrease by one", function() {
        var scope = $rootScope.$new();
        var view = createView(scope);
        scope.spinnerValue = 5;
        scope.decrease();
        $rootScope.$digest();
        expect(scope.spinnerValue).toEqual(4);
    });

    
   
});