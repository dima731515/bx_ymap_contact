//const data = {
//    templates:{
//        main: ''
//            +'<div id="saloons-map">'
//            +'</div>'
//            +'<div id="saloons-list">'
//            +'<ul>'
//            +'<li>sdsf</li>'
//            +'<li>sdfsf</li>'
//            +'</ul>'
//            +'</div>'
//        ,
//        listItem:''
//            +''
//        ,
//        listDetail:'',
//        map:{},
//        baloon:{},
//        placemack:{}
//    }
//};
function Saloons(data){
    this.data = data;
    this.containerId = 'saloons';
    this.mapContainerId = 'saloons-map';
    this.listContainerId = 'saloons-list';
    this.containerElement = [];
    this.map = {};
}
Saloons.prototype.init = function(){
    this.setContainer();
    this.initContainer();
    this.initYmap();
};
Saloons.prototype.setContainer = function(){
    el = document.getElementById(this.containerId);
    this.containerElement = el; 
    console.log('setContainer' + this.containerElement);
    return true;
}; 
// создать в контейнере необходимые элементы, карта, список, ...
Saloons.prototype.initContainer = function(){
   this.containerElement.innerHTML = this.data.templates.main;
   console.log(this.containerElement);
};
Saloons.prototype.initYmap = function(){
    ymaps.ready(this._bind(function() {
        this.map = new ymaps.Map(this.mapContainerId, {
            center  : [55.76, 37.64],
            zoom    : 12,
            controls: ['zoomControl']
        });
        this.setShops();
    }));
};
Saloons.prototype.setCities = function(cities){
    if(!cities){
        let citiesName = this.data.cities[0].name; 
        let citiesId = this.data.cities[0].id; 
        let citiesCoordinate = this.data.cities[0].coordinate; 
    } 
};
Saloons.prototype.setShops = function(){

    this.setPlacemark();
};
Saloons.prototype.setPlacemark = function(){
    let placemark = new ymaps.Placemark([55.76, 37.64], {
        // Хинт показывается при наведении мышкой на иконку метки.
        hintContent: 'Содержимое всплывающей подсказки',
        // Балун откроется при клике по метке.
        balloonContent: 'Содержимое балуна'
    });
    // После того как метка была создана, добавляем её на карту.
    this.map.geoObjects.add(placemark);
};
Saloons.prototype._bind = function(callback)
{
    var self = this;

    callback = (typeof callback == 'function') 
        ? callback
        : this[callback]
    ; 

    return function () {
        return callback.apply(self, arguments);
    }
};

//$(function(){
//    var test = new Saloons(data);
//    ymaps.ready(test.init());
//    console.log(test);
//});
