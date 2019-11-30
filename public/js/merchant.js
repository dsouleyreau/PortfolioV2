// Variables globales
var heroesSchema = []
var regionSchema = [];

// Requête AJAX vers le serveur
function request(schema){
    var xhr = new XMLHttpRequest();
    var url = '/projects/merchant/' + schema;
    xhr.open('GET', url, false);
    xhr.send();
    
    if(xhr.status == 200) {
        var data = xhr.responseText;
        if(data.length > 0 && data[0] == '['){
            return JSON.parse(data);
        }
    }
    return [];
}

async function getHeroesSchema(){
//    heroesSchema = [{'heroName': ' '}, ...await mysql_request('heroesSchema')];
    heroesSchema = [{'heroName': ' ', 'spells': [{ 'skillName': ' ' }]}, ...await request('heroesSchema')];
//    heroesSchema.forEach(function(hero){
//        hero.spells = [{'skillName': ' '}, hero.spells];
//    });
//    console.log(heroesSchema);
}

getHeroesSchema();

async function getRegionsSchema(){
    regionsSchema = [{'regionName': ' '}, ...await request('regionsSchema')];
//    console.log(regionsSchema);
}

getRegionsSchema();

var app = angular.module('merchantComp', ['ngSanitize']);


app.controller('heroesPlacement', function($scope, $rootScope) {
    $scope.heroesSchema = heroesSchema;
    $scope.heroesPlacementSelected = [];
    //$scope.heroesSchema.find(function(obj){return obj.name === " "});
    $scope.changeHeroesPlacementSelected = function(heroesPlacementSelected, slot){
        heroesPlacementSelected[slot].id = slot;
        //console.log('object ' + JSON.stringify(heroesPlacementSelected));
        $rootScope.$broadcast('changeHeroesPlacementSelected', heroesPlacementSelected, slot);
    };
    $rootScope.$on('changeHeroesPlacementSlot', function(event, heroesPlacementSlot, slot){
        //heroesPlacementSlot[slot].id = slot;
        $scope.heroesPlacementSelected[slot] = heroesPlacementSlot[slot];
    });
});

app.controller('monsterPlacement', function($scope, $rootScope) {
    $scope.regionsSchema = regionsSchema;
//    console.log(regionsSchema);
});

app.controller('heroesPlacementSlot', function($scope, $rootScope) {
    $scope.heroesSchema = heroesSchema;
    $scope.heroesPlacementSlot = [];
    $scope.loadBasicSpells = function(slot){
        var basicSpell = $scope.heroesPlacementSlot[slot].spells.find(function(obj){return obj['skillName'] === 'Basic'});
        $scope.heroesPlacementSlot[slot].selectedSpells = [];
        for(i = 0; i < 5; i++){
            $scope.heroesPlacementSlot[slot].selectedSpells[i] = basicSpell;
        }
    }
    $scope.changeHeroesPlacementSlot = function(heroesPlacementSlot, slot){
        heroesPlacementSlot[slot].id = slot;
        $scope.loadBasicSpells(slot);
        $rootScope.$broadcast('changeHeroesPlacementSlot', heroesPlacementSlot, slot);
    };
    $rootScope.$on('changeHeroesPlacementSelected', function(event, heroesPlacementSelected, slot){
        //heroesPlacementSelected[slot].id = slot;
        $scope.heroesPlacementSlot[slot] = heroesPlacementSelected[slot];
        $scope.loadBasicSpells(slot);
    });
    $scope.spells = function(schema, list){
        var spells = ['Basic'];
        if(list && list.heroName) spells = schema.find(obj => obj.heroName === list.heroName).spells;
        return spells;
    }
});

app.controller('form', function($scope, $rootScope){
   
    $scope.submit = function(){
        alert($scope.text);
        return false;
    };
});