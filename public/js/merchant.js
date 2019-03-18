var app = angular.module('merchantComp', ['ngSanitize']);

var heroesSchema = [{'id': "warrior", 'name': "Warrior", spells : ['Basic']}, {'id': "mage", 'name': "Mage", spells : ['Basic']}, {'id': "rogue", 'name': "Rogue", spells : ['Basic']}, {'id': "berzerker", 'name': "Berzerker", spells : ['Basic']}, {'id': "cleric", 'name': "Cleric", spells : ['Basic']}, {'id': "paladin", 'name': "Paladin", spells : ['Basic']}, {'id': "assasin", 'name': "Assasin", spells : ['Basic']}, {'id': "darkknight", 'name': "Dark Knight", spells : ['Basic']}, {'id': "bard", 'name': "Bard", spells : ['Basic']}];

//var heroesPlacementSelected = [];
//var heroesPlacementSlot = {};

app.controller('heroesPlacement', function($scope, $rootScope) {
    $scope.heroesSchema = heroesSchema;
    $scope.heroesPlacementSelected = [];
    $scope.changeHeroesPlacementSelected = function(heroesPlacementSelected, slot){
        $rootScope.$broadcast('changeHeroesPlacementSelected', heroesPlacementSelected, slot);
    };
    $rootScope.$on('changeHeroesPlacementSlot', function(event, heroesPlacementSlot, slot){
        $scope.heroesPlacementSelected[slot] = heroesPlacementSlot[slot];
    });
});

app.controller('monsterPlacement', function($scope, $rootScope) {
});

app.controller('heroesPlacementSlot', function($scope, $rootScope) {
    $scope.heroesSchema = heroesSchema;
    $scope.heroesPlacementSlot = [];
    $scope.changeHeroesPlacementSlot = function(heroesPlacementSlot, slot){
        $rootScope.$broadcast('changeHeroesPlacementSlot', heroesPlacementSlot, slot);
    };
    $rootScope.$on('changeHeroesPlacementSelected', function(event, heroesPlacementSelected, slot){
        $scope.heroesPlacementSlot[slot] = heroesPlacementSelected[slot];
    });
});