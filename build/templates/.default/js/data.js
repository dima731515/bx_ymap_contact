const mapData = {
    cities:[],
    points:[],
    relatedCitiesToPoints:[],
    filterList:[],
    templates:{
        main: ''
            +'<div id="saloons-map">'
            +'</div>'
            +'<div id="saloons-list">'
            +'<div class="search-line">'
            +'<div class="city-list">'
            +'</div>'
            +'<input class="search" placeholder="Поиск по адресу или названию торгового центра" />'
            + '<ul class="filter-list">'
            + '<li></li>'
            + '</ul>'
            +'</div>'
            +'<div id="saloons-detail" data-id="#id#" style="display:none;"></div>'
            +'<div class="list-block">'
            +'<ul class="list">'
            +'</ul>'
            +'</div>'
            +'</div>'
        ,
        listItem:''
            + '<li onclick="" data-id="#id#">'
            + '<span><a href="#detailPage#" target="blank" class="name">#name#</a></span>'
            + '<span class="categories" style="display:none;">#category#</span>'
            + '<br/><div class="item-address"></div><span>#address#</span>'
            + '<br/><div class="item-hors"></div><span>#workHors#</span>'
            //+ '<br/><span>телефон: #phone#</span></li>'
            + '</li>',
        balloonTemplate:''
            + '<div class="balloon-contents">'
            + '<span class="name">#name#</span><br />'
            + '<ul>'
            + '<li><div class="balloon-address"></div><span class="address">#address#</span></li>'
            + '<li><div class="balloon-hors"></div><span>#workHors#</span></li>'
        //+ '<li><div class="balloon-phone"></div><span>#phones#</span></li>'
            + '<li><span><a href="#detailPage#" target="blank">подробнее о салоне</a></span></li>'
            + '</ul>'
            + '</div>'
            +'',
        listDetail:''
            + '<span class="saloons-list_close" data-id="#id#">< Назад к списку</span>'
            + '<div class="detail-contents">'
            + '<span class="name">#name#</span><br /><br /><br />'
            + '<ul>'
            + '<li><div class="detail-address"></div><span class="address">#address#</span></li>'
            + '#metro#'
            + '<li><div class="detail-hors"></div><span>#workHors#</span></li>'
            + '<li><div class="detail-phone"></div><span class="call_phone_1">#phones#</span></li>'
            + '<li><span><a href="#detailPage#" target="blank">подробнее о салоне</a></span></li>'
            + '</ul>'
            //        + '<span class="description">#descriptin#</span>'
            + '</div>',
    }
};
//cities:
//mapData.cities.push({id:0, name:'Москва', coordinates:'', zoom:''});
//////points:
//mapData.points.push({id:0,coordinates:['55.749960726878', '37.56726825892997'],name:'Олимпийский',description:'',phone:'234234',category:'сантех,кухня',workHors:'12:00-23:00',detailPage:'/catalog',photos:[]});
////related:
//mapData.relatedCitiesToPoints.push({cityId:0, pointId:1});

function YMap(){
    this.data = mapData;
    this.containerId = 'saloons';
    this.currentCityId = false;
    this.currentCity = {};
    this.mapContainerId = 'saloons-map';
    this.listContainerId = 'saloons-list';
    this.containerElement = {};
    this.detailElement ={};
    this.map = {};
    this.placeMarcList = [];
    this.ymap = {};
};
YMap.prototype.init = function(cityId = false){
    cityId = (cityId === false) ? 0 : cityId; 
    this.currentCityId = this.setCityById(cityId).id;
    this.currentCity = this.setCityById(cityId);
    this.initMainContainer();
    this.initYmap();
};
YMap.prototype.initMainContainer = function(){
    el = document.getElementById(this.containerId);
    this.containerElement = el; 
    this.containerElement.innerHTML = this.data.templates.main;
    this.detailElement = document.getElementById('saloons-detail'); 
    this.detailElement.innerHTML = this.data.templates.listDetail;
    let citiesHtml = '';
    for(i=0; this.data.cities.length>i;i++){
            let active = (this.currentCityId === this.data.cities[i].id) ? 'active"' : '"'; 
            citiesHtml += '<span class="city-name ';
            citiesHtml += active;
            citiesHtml += 'data-id="'+this.data.cities[i].id+'">';
            citiesHtml += this.data.cities[i].name;
            citiesHtml += '</span>';
    }
    el.getElementsByClassName('city-list')[0].innerHTML = citiesHtml;
    let filterListHtml = '';
    for(i=0;this.data.filterList.length>i;i++){
        filterListHtml += '<li>' + this.data.filterList[i]+ '</li>';
    }
    el.getElementsByClassName('filter-list')[0].innerHTML = filterListHtml;
    return true;
}; 
YMap.prototype.initYmap = function(){
    ymaps.ready(this._bind(function(){
        this.map = new ymaps.Map(this.mapContainerId, {
            center  : [this.currentCity.coordinates[0], this.currentCity.coordinates[1]],
            zoom    : 10,
            controls: ['zoomControl']

        }, {suppressMapOpenBlock:true});
        var points = this.getRelatedPointsByCityId(this.currentCityId);
        this.setPoints(points);
        // поиск по списку:
        this.initEvents();
        let listLibInit = window.listInit();
    }));
};
YMap.prototype.initEvents = function(){
    window.eventItems = this.containerElement.getElementsByClassName('list-block')[0].querySelectorAll('li');
    for(i=0; eventItems.length > i; i++){
        var self = this;
        eventItems[i].addEventListener('click', function(el){
            self.onClickItem(el.currentTarget);
        }); 
    }
    let cities = this.containerElement.getElementsByClassName('city-list')[0].querySelectorAll('span.city-name'); 
    for(i=0; cities.length>i; i++){
        var self = this;
        cities[i].addEventListener('click', function(el){
            let cityId = parseInt(el.currentTarget.getAttribute('data-id'));
            self.init(cityId);
        });
    }
    let filterList = this.containerElement.getElementsByClassName('filter-list')[0].getElementsByTagName('li'); 

    for(i=0;filterList.length>i;i++){
        filterList[i].addEventListener('click', function(el){
            let targetInner = el.target.innerText;
            for(i=0;filterList.length>i;i++){
                filterList[i].classList.toggle('active', false);
            }
            el.target.classList.toggle('active', true);
            if(targetInner === 'все'){
                window.listObj.search(''); 
            }else{
                window.listObj.search(targetInner); 
            }
        }); 
    }

    this.detailElement.addEventListener('click', function(el){
        if(el.target.classList.contains('saloons-list_close')){
            let itemId = el.target.getAttribute('data-id');
            //            self.placeMarcList[parseInt(itemId)].events.fire('click');
            self.containerElement.querySelector('input.search').parentElement.style.display = 'block';
            self.hideDetail();
        }
    });
    for(i=0;this.placeMarcList.length>i;i++){
        var self = this;
        this.placeMarcList[i].events.add('click', function(el){
            let id = el.originalEvent.target.properties.get('id');
            self.onClickMarker(parseInt(id));
        }); 
    }
};

YMap.prototype.setPoints = function(points){
    var list = ''; 
    for(i=0; points.length>i; i++){
        list = list + points[i].element;
        var element = this.data.templates.balloonTemplate;
        for (var key in points[i]){
            let prop = '#' + key + '#';
            element = element.replace(prop, points[i][key]);
        }

        var shopPlacemark = new ymaps.Placemark(
            points[i].coordinates,
                {
                    hintContent: points[i].name,
                    balloonContent: element, //points[i].name,
                    id: points[i].id
                },{
                    iconLayout: 'default#image',
                    iconImageHref: '/img/point.svg', 
                    iconImageSize: [60, 30.26],
                    iconImageOffset: [-30, -25],
                }
        );
        this.map.geoObjects.add(shopPlacemark);
        this.placeMarcList[i] = shopPlacemark;
    }
    //document.getElementById(this.listContainerId).getElementsByTagName('ul')[0].innerHTML = list;
    document.getElementById(this.listContainerId).getElementsByClassName('list')[0].innerHTML = list;
};
// return City (object) by ID
YMap.prototype.setCityById = function(cityId){
    if(cityId === 0){
        return this.data.cities[0];
    }else{
        for(i=0;this.data.cities.length>i;i++){
            if(parseInt(this.data.cities[i].id) === cityId){ 
                return this.data.cities[i];
                break;
            }
        }
    }
};
// return Points (array) by City ID
YMap.prototype.getRelatedPointsByCityId = function(cityId){
    var self = this;
    //array(), [cityId:1, pointId:2]
    let pointIds = this.data.relatedCitiesToPoints.filter(function(item){
        if(item.cityId === cityId) return true;
    });
    let points = pointIds.map(function(item, index, arr){
        for(i=0; self.data.points.length>i; i++){
            if(item.pointId === self.data.points[i].id){
                var element = self.data.templates.listItem;;
                for (var key in self.data.points[i]){
                    let prop = '#' + key + '#';
                    element = element.replace(prop, self.data.points[i][key]);
                }
                return {element:element, ...self.data.points[i]};
            }
        }
    }); 
    //console.log('points: ');
    //console.log(points);
    return points;
};
YMap.prototype.getItemDataById = function(id){
    let itemData = this.data.points.filter(function(item){
        if(parseInt(item.id) === parseInt(id)){
            return true;
        }
    });
    return (1 >= itemData.length) ? itemData[0] : false;
};
YMap.prototype._bind = function(callback){
    var self = this;
    callback = (typeof callback == 'function') ? callback : this[callback]; 
    return function(){return callback.apply(self, arguments);}
};
YMap.prototype.onClickItem = function(item){
    let itemId = item.getAttribute('data-id');
    let itemData = this.getItemDataById(itemId)
    var element = this.data.templates.listDetail;
    for (var key in itemData){
        if(key === 'metro'){
            if(itemData[key].length <= 0){
                element = element.replace('#' + key + '#', '');
            }else{
                var data = itemData[key]; 
                let metroString = ''; 
                for(i=0; data.length>i;i++){
                    metroString += '<li><div class="detail-metro"></div><span class="metro">';
                    metroString += data[i];
                    metroString += '<span></li>';
                }
                element = element.replace('#' + key + '#', metroString);
            }
        }else{
            let prop = '#' + key + '#';
            element = element.replace(prop, itemData[key]);
        }
    }
    let phone = document.getElementsByClassName('call_phone_1')[0].innerHTML;
    element = element.replace('#phones#', phone);
    //this.placeMarcList[itemId].events.fire('click');
    this.detailElement.innerHTML = element; 
    this.showDetail();
    // эфект появления
};
YMap.prototype.onClickMarker = function(itemId){
    let itemData = this.getItemDataById(itemId)
    var element = this.data.templates.listDetail;
    for (var key in itemData){
        if(key === 'metro'){
            if(itemData[key].length <= 0){
                element = element.replace('#' + key + '#', '');
            }else{
                var data = itemData[key]; 
                let metroString = ''; 
                for(i=0; data.length>i;i++){
                    metroString += '<li><div class="detail-metro"></div><span class="metro">';
                    metroString += data[i];
                    metroString += '<span></li>';
                }
                element = element.replace('#' + key + '#', metroString);
            }
        }else{
            let prop = '#' + key + '#';
            element = element.replace(prop, itemData[key]);
        }
    }
    let phone = document.getElementsByClassName('call_phone_1')[0].innerHTML;
    element = element.replace('#phones#', phone);
//    this.placeMarcList[itemId].events.fire('click');
    this.detailElement.innerHTML = element; 
    this.showDetail();
    // эфект появления
};
YMap.prototype.showDetail = function(){
    el = this.detailElement; 
    el.style.opacity = '0.1';
    el.style.display = 'block';
    this.containerElement.querySelector('input.search').parentElement.style.display = 'none';
    el.style.backgroundColor = 'white';

    var timerId = setTimeout(function tick() {
        if(1 >= parseFloat(el.style.opacity)){
            el.style.opacity = parseFloat(el.style.opacity) + 0.1;
            //console.log(el.style.opacity);
            timerId = setTimeout(tick, 30);
        }else{
            //выходим из цикла
        }
    }, 30);
};
YMap.prototype.hideDetail = function(){
    el = this.detailElement; 
    var timerId = setTimeout(function tick() {
        if(0 < parseFloat(el.style.opacity)){
            el.style.opacity = parseFloat(el.style.opacity) - 0.1;
            //console.log(el.style.opacity);
            timerId = setTimeout(tick, 30);
        }else{
            el.style.display = 'none';
            //выходим из цикла
        }
    }, 30);
};
//$(function(){
    //    window.map = new Map();
    //    ymaps.ready(map.init());
//});

function listInit(){
    const listOptions = {valueNames:['name', 'categories']};
    return window.listObj = new List('saloons-list', listOptions);
}
