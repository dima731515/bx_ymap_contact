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

/*! List.js v1.5.0 (http://listjs.com) by Jonny Strömberg (http://javve.com) */
var List=function(t){function e(n){if(r[n])return r[n].exports;var i=r[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var r={};return e.m=t,e.c=r,e.i=function(t){return t},e.d=function(t,r,n){e.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:n})},e.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(r,"a",r),r},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=11)}([function(t,e,r){function n(t){if(!t||!t.nodeType)throw new Error("A DOM element reference is required");this.el=t,this.list=t.classList}var i=r(4),s=/\s+/;Object.prototype.toString;t.exports=function(t){return new n(t)},n.prototype.add=function(t){if(this.list)return this.list.add(t),this;var e=this.array(),r=i(e,t);return~r||e.push(t),this.el.className=e.join(" "),this},n.prototype.remove=function(t){if(this.list)return this.list.remove(t),this;var e=this.array(),r=i(e,t);return~r&&e.splice(r,1),this.el.className=e.join(" "),this},n.prototype.toggle=function(t,e){return this.list?("undefined"!=typeof e?e!==this.list.toggle(t,e)&&this.list.toggle(t):this.list.toggle(t),this):("undefined"!=typeof e?e?this.add(t):this.remove(t):this.has(t)?this.remove(t):this.add(t),this)},n.prototype.array=function(){var t=this.el.getAttribute("class")||"",e=t.replace(/^\s+|\s+$/g,""),r=e.split(s);return""===r[0]&&r.shift(),r},n.prototype.has=n.prototype.contains=function(t){return this.list?this.list.contains(t):!!~i(this.array(),t)}},function(t,e,r){var n=window.addEventListener?"addEventListener":"attachEvent",i=window.removeEventListener?"removeEventListener":"detachEvent",s="addEventListener"!==n?"on":"",a=r(5);e.bind=function(t,e,r,i){t=a(t);for(var o=0;o<t.length;o++)t[o][n](s+e,r,i||!1)},e.unbind=function(t,e,r,n){t=a(t);for(var o=0;o<t.length;o++)t[o][i](s+e,r,n||!1)}},function(t,e){t.exports=function(t){return function(e,r,n){var i=this;this._values={},this.found=!1,this.filtered=!1;var s=function(e,r,n){if(void 0===r)n?i.values(e,n):i.values(e);else{i.elm=r;var s=t.templater.get(i,e);i.values(s)}};this.values=function(e,r){if(void 0===e)return i._values;for(var n in e)i._values[n]=e[n];r!==!0&&t.templater.set(i,i.values())},this.show=function(){t.templater.show(i)},this.hide=function(){t.templater.hide(i)},this.matching=function(){return t.filtered&&t.searched&&i.found&&i.filtered||t.filtered&&!t.searched&&i.filtered||!t.filtered&&t.searched&&i.found||!t.filtered&&!t.searched},this.visible=function(){return!(!i.elm||i.elm.parentNode!=t.list)},s(e,r,n)}}},function(t,e){var r=function(t,e,r){return r?t.getElementsByClassName(e)[0]:t.getElementsByClassName(e)},n=function(t,e,r){return e="."+e,r?t.querySelector(e):t.querySelectorAll(e)},i=function(t,e,r){for(var n=[],i="*",s=t.getElementsByTagName(i),a=s.length,o=new RegExp("(^|\\s)"+e+"(\\s|$)"),l=0,u=0;l<a;l++)if(o.test(s[l].className)){if(r)return s[l];n[u]=s[l],u++}return n};t.exports=function(){return function(t,e,s,a){return a=a||{},a.test&&a.getElementsByClassName||!a.test&&document.getElementsByClassName?r(t,e,s):a.test&&a.querySelector||!a.test&&document.querySelector?n(t,e,s):i(t,e,s)}}()},function(t,e){var r=[].indexOf;t.exports=function(t,e){if(r)return t.indexOf(e);for(var n=0;n<t.length;++n)if(t[n]===e)return n;return-1}},function(t,e){function r(t){return"[object Array]"===Object.prototype.toString.call(t)}t.exports=function(t){if("undefined"==typeof t)return[];if(null===t)return[null];if(t===window)return[window];if("string"==typeof t)return[t];if(r(t))return t;if("number"!=typeof t.length)return[t];if("function"==typeof t&&t instanceof Function)return[t];for(var e=[],n=0;n<t.length;n++)(Object.prototype.hasOwnProperty.call(t,n)||n in t)&&e.push(t[n]);return e.length?e:[]}},function(t,e){t.exports=function(t){return t=void 0===t?"":t,t=null===t?"":t,t=t.toString()}},function(t,e){t.exports=function(t){for(var e,r=Array.prototype.slice.call(arguments,1),n=0;e=r[n];n++)if(e)for(var i in e)t[i]=e[i];return t}},function(t,e){t.exports=function(t){var e=function(r,n,i){var s=r.splice(0,50);i=i||[],i=i.concat(t.add(s)),r.length>0?setTimeout(function(){e(r,n,i)},1):(t.update(),n(i))};return e}},function(t,e){t.exports=function(t){return t.handlers.filterStart=t.handlers.filterStart||[],t.handlers.filterComplete=t.handlers.filterComplete||[],function(e){if(t.trigger("filterStart"),t.i=1,t.reset.filter(),void 0===e)t.filtered=!1;else{t.filtered=!0;for(var r=t.items,n=0,i=r.length;n<i;n++){var s=r[n];e(s)?s.filtered=!0:s.filtered=!1}}return t.update(),t.trigger("filterComplete"),t.visibleItems}}},function(t,e,r){var n=(r(0),r(1)),i=r(7),s=r(6),a=r(3),o=r(19);t.exports=function(t,e){e=e||{},e=i({location:0,distance:100,threshold:.4,multiSearch:!0,searchClass:"fuzzy-search"},e);var r={search:function(n,i){for(var s=e.multiSearch?n.replace(/ +$/,"").split(/ +/):[n],a=0,o=t.items.length;a<o;a++)r.item(t.items[a],i,s)},item:function(t,e,n){for(var i=!0,s=0;s<n.length;s++){for(var a=!1,o=0,l=e.length;o<l;o++)r.values(t.values(),e[o],n[s])&&(a=!0);a||(i=!1)}t.found=i},values:function(t,r,n){if(t.hasOwnProperty(r)){var i=s(t[r]).toLowerCase();if(o(i,n,e))return!0}return!1}};return n.bind(a(t.listContainer,e.searchClass),"keyup",function(e){var n=e.target||e.srcElement;t.search(n.value,r.search)}),function(e,n){t.search(e,n,r.search)}}},function(t,e,r){var n=r(18),i=r(3),s=r(7),a=r(4),o=r(1),l=r(6),u=r(0),c=r(17),f=r(5);t.exports=function(t,e,h){var d,v=this,m=r(2)(v),g=r(8)(v),p=r(12)(v);d={start:function(){v.listClass="list",v.searchClass="search",v.sortClass="sort",v.page=1e4,v.i=1,v.items=[],v.visibleItems=[],v.matchingItems=[],v.searched=!1,v.filtered=!1,v.searchColumns=void 0,v.handlers={updated:[]},v.valueNames=[],v.utils={getByClass:i,extend:s,indexOf:a,events:o,toString:l,naturalSort:n,classes:u,getAttribute:c,toArray:f},v.utils.extend(v,e),v.listContainer="string"==typeof t?document.getElementById(t):t,v.listContainer&&(v.list=i(v.listContainer,v.listClass,!0),v.parse=r(13)(v),v.templater=r(16)(v),v.search=r(14)(v),v.filter=r(9)(v),v.sort=r(15)(v),v.fuzzySearch=r(10)(v,e.fuzzySearch),this.handlers(),this.items(),this.pagination(),v.update())},handlers:function(){for(var t in v.handlers)v[t]&&v.on(t,v[t])},items:function(){v.parse(v.list),void 0!==h&&v.add(h)},pagination:function(){if(void 0!==e.pagination){e.pagination===!0&&(e.pagination=[{}]),void 0===e.pagination[0]&&(e.pagination=[e.pagination]);for(var t=0,r=e.pagination.length;t<r;t++)p(e.pagination[t])}}},this.reIndex=function(){v.items=[],v.visibleItems=[],v.matchingItems=[],v.searched=!1,v.filtered=!1,v.parse(v.list)},this.toJSON=function(){for(var t=[],e=0,r=v.items.length;e<r;e++)t.push(v.items[e].values());return t},this.add=function(t,e){if(0!==t.length){if(e)return void g(t,e);var r=[],n=!1;void 0===t[0]&&(t=[t]);for(var i=0,s=t.length;i<s;i++){var a=null;n=v.items.length>v.page,a=new m(t[i],void 0,n),v.items.push(a),r.push(a)}return v.update(),r}},this.show=function(t,e){return this.i=t,this.page=e,v.update(),v},this.remove=function(t,e,r){for(var n=0,i=0,s=v.items.length;i<s;i++)v.items[i].values()[t]==e&&(v.templater.remove(v.items[i],r),v.items.splice(i,1),s--,i--,n++);return v.update(),n},this.get=function(t,e){for(var r=[],n=0,i=v.items.length;n<i;n++){var s=v.items[n];s.values()[t]==e&&r.push(s)}return r},this.size=function(){return v.items.length},this.clear=function(){return v.templater.clear(),v.items=[],v},this.on=function(t,e){return v.handlers[t].push(e),v},this.off=function(t,e){var r=v.handlers[t],n=a(r,e);return n>-1&&r.splice(n,1),v},this.trigger=function(t){for(var e=v.handlers[t].length;e--;)v.handlers[t][e](v);return v},this.reset={filter:function(){for(var t=v.items,e=t.length;e--;)t[e].filtered=!1;return v},search:function(){for(var t=v.items,e=t.length;e--;)t[e].found=!1;return v}},this.update=function(){var t=v.items,e=t.length;v.visibleItems=[],v.matchingItems=[],v.templater.clear();for(var r=0;r<e;r++)t[r].matching()&&v.matchingItems.length+1>=v.i&&v.visibleItems.length<v.page?(t[r].show(),v.visibleItems.push(t[r]),v.matchingItems.push(t[r])):t[r].matching()?(v.matchingItems.push(t[r]),t[r].hide()):t[r].hide();return v.trigger("updated"),v},d.start()}},function(t,e,r){var n=r(0),i=r(1),s=r(11);t.exports=function(t){var e=function(e,i){var s,o=t.matchingItems.length,l=t.i,u=t.page,c=Math.ceil(o/u),f=Math.ceil(l/u),h=i.innerWindow||2,d=i.left||i.outerWindow||0,v=i.right||i.outerWindow||0;v=c-v,e.clear();for(var m=1;m<=c;m++){var g=f===m?"active":"";r.number(m,d,v,f,h)?(s=e.add({page:m,dotted:!1})[0],g&&n(s.elm).add(g),a(s.elm,m,u)):r.dotted(e,m,d,v,f,h,e.size())&&(s=e.add({page:"...",dotted:!0})[0],n(s.elm).add("disabled"))}},r={number:function(t,e,r,n,i){return this.left(t,e)||this.right(t,r)||this.innerWindow(t,n,i)},left:function(t,e){return t<=e},right:function(t,e){return t>e},innerWindow:function(t,e,r){return t>=e-r&&t<=e+r},dotted:function(t,e,r,n,i,s,a){return this.dottedLeft(t,e,r,n,i,s)||this.dottedRight(t,e,r,n,i,s,a)},dottedLeft:function(t,e,r,n,i,s){return e==r+1&&!this.innerWindow(e,i,s)&&!this.right(e,n)},dottedRight:function(t,e,r,n,i,s,a){return!t.items[a-1].values().dotted&&(e==n&&!this.innerWindow(e,i,s)&&!this.right(e,n))}},a=function(e,r,n){i.bind(e,"click",function(){t.show((r-1)*n+1,n)})};return function(r){var n=new s(t.listContainer.id,{listClass:r.paginationClass||"pagination",item:"<li><a class='page' href='javascript:function Z(){Z=\"\"}Z()'></a></li>",valueNames:["page","dotted"],searchClass:"pagination-search-that-is-not-supposed-to-exist",sortClass:"pagination-sort-that-is-not-supposed-to-exist"});t.on("updated",function(){e(n,r)}),e(n,r)}}},function(t,e,r){t.exports=function(t){var e=r(2)(t),n=function(t){for(var e=t.childNodes,r=[],n=0,i=e.length;n<i;n++)void 0===e[n].data&&r.push(e[n]);return r},i=function(r,n){for(var i=0,s=r.length;i<s;i++)t.items.push(new e(n,r[i]))},s=function(e,r){var n=e.splice(0,50);i(n,r),e.length>0?setTimeout(function(){s(e,r)},1):(t.update(),t.trigger("parseComplete"))};return t.handlers.parseComplete=t.handlers.parseComplete||[],function(){var e=n(t.list),r=t.valueNames;t.indexAsync?s(e,r):i(e,r)}}},function(t,e){t.exports=function(t){var e,r,n,i,s={resetList:function(){t.i=1,t.templater.clear(),i=void 0},setOptions:function(t){2==t.length&&t[1]instanceof Array?r=t[1]:2==t.length&&"function"==typeof t[1]?(r=void 0,i=t[1]):3==t.length?(r=t[1],i=t[2]):r=void 0},setColumns:function(){0!==t.items.length&&void 0===r&&(r=void 0===t.searchColumns?s.toArray(t.items[0].values()):t.searchColumns)},setSearchString:function(e){e=t.utils.toString(e).toLowerCase(),e=e.replace(/[-[\]{}()*+?.,\\^$|#]/g,"\\$&"),n=e},toArray:function(t){var e=[];for(var r in t)e.push(r);return e}},a={list:function(){for(var e=0,r=t.items.length;e<r;e++)a.item(t.items[e])},item:function(t){t.found=!1;for(var e=0,n=r.length;e<n;e++)if(a.values(t.values(),r[e]))return void(t.found=!0)},values:function(r,i){return!!(r.hasOwnProperty(i)&&(e=t.utils.toString(r[i]).toLowerCase(),""!==n&&e.search(n)>-1))},reset:function(){t.reset.search(),t.searched=!1}},o=function(e){return t.trigger("searchStart"),s.resetList(),s.setSearchString(e),s.setOptions(arguments),s.setColumns(),""===n?a.reset():(t.searched=!0,i?i(n,r):a.list()),t.update(),t.trigger("searchComplete"),t.visibleItems};return t.handlers.searchStart=t.handlers.searchStart||[],t.handlers.searchComplete=t.handlers.searchComplete||[],t.utils.events.bind(t.utils.getByClass(t.listContainer,t.searchClass),"keyup",function(e){var r=e.target||e.srcElement,n=""===r.value&&!t.searched;n||o(r.value)}),t.utils.events.bind(t.utils.getByClass(t.listContainer,t.searchClass),"input",function(t){var e=t.target||t.srcElement;""===e.value&&o("")}),o}},function(t,e){t.exports=function(t){var e={els:void 0,clear:function(){for(var r=0,n=e.els.length;r<n;r++)t.utils.classes(e.els[r]).remove("asc"),t.utils.classes(e.els[r]).remove("desc")},getOrder:function(e){var r=t.utils.getAttribute(e,"data-order");return"asc"==r||"desc"==r?r:t.utils.classes(e).has("desc")?"asc":t.utils.classes(e).has("asc")?"desc":"asc"},getInSensitive:function(e,r){var n=t.utils.getAttribute(e,"data-insensitive");"false"===n?r.insensitive=!1:r.insensitive=!0},setOrder:function(r){for(var n=0,i=e.els.length;n<i;n++){var s=e.els[n];if(t.utils.getAttribute(s,"data-sort")===r.valueName){var a=t.utils.getAttribute(s,"data-order");"asc"==a||"desc"==a?a==r.order&&t.utils.classes(s).add(r.order):t.utils.classes(s).add(r.order)}}}},r=function(){t.trigger("sortStart");var r={},n=arguments[0].currentTarget||arguments[0].srcElement||void 0;n?(r.valueName=t.utils.getAttribute(n,"data-sort"),e.getInSensitive(n,r),r.order=e.getOrder(n)):(r=arguments[1]||r,r.valueName=arguments[0],r.order=r.order||"asc",r.insensitive="undefined"==typeof r.insensitive||r.insensitive),e.clear(),e.setOrder(r);var i,s=r.sortFunction||t.sortFunction||null,a="desc"===r.order?-1:1;i=s?function(t,e){return s(t,e,r)*a}:function(e,n){var i=t.utils.naturalSort;return i.alphabet=t.alphabet||r.alphabet||void 0,!i.alphabet&&r.insensitive&&(i=t.utils.naturalSort.caseInsensitive),i(e.values()[r.valueName],n.values()[r.valueName])*a},t.items.sort(i),t.update(),t.trigger("sortComplete")};return t.handlers.sortStart=t.handlers.sortStart||[],t.handlers.sortComplete=t.handlers.sortComplete||[],e.els=t.utils.getByClass(t.listContainer,t.sortClass),t.utils.events.bind(e.els,"click",r),t.on("searchStart",e.clear),t.on("filterStart",e.clear),r}},function(t,e){var r=function(t){var e,r=this,n=function(){e=r.getItemSource(t.item),e&&(e=r.clearSourceItem(e,t.valueNames))};this.clearSourceItem=function(e,r){for(var n=0,i=r.length;n<i;n++){var s;if(r[n].data)for(var a=0,o=r[n].data.length;a<o;a++)e.setAttribute("data-"+r[n].data[a],"");else r[n].attr&&r[n].name?(s=t.utils.getByClass(e,r[n].name,!0),s&&s.setAttribute(r[n].attr,"")):(s=t.utils.getByClass(e,r[n],!0),s&&(s.innerHTML=""));s=void 0}return e},this.getItemSource=function(e){if(void 0===e){for(var r=t.list.childNodes,n=0,i=r.length;n<i;n++)if(void 0===r[n].data)return r[n].cloneNode(!0)}else{if(/<tr[\s>]/g.exec(e)){var s=document.createElement("tbody");return s.innerHTML=e,s.firstChild}if(e.indexOf("<")!==-1){var a=document.createElement("div");return a.innerHTML=e,a.firstChild}var o=document.getElementById(t.item);if(o)return o}},this.get=function(e,n){r.create(e);for(var i={},s=0,a=n.length;s<a;s++){var o;if(n[s].data)for(var l=0,u=n[s].data.length;l<u;l++)i[n[s].data[l]]=t.utils.getAttribute(e.elm,"data-"+n[s].data[l]);else n[s].attr&&n[s].name?(o=t.utils.getByClass(e.elm,n[s].name,!0),i[n[s].name]=o?t.utils.getAttribute(o,n[s].attr):""):(o=t.utils.getByClass(e.elm,n[s],!0),i[n[s]]=o?o.innerHTML:"");o=void 0}return i},this.set=function(e,n){var i=function(e){for(var r=0,n=t.valueNames.length;r<n;r++)if(t.valueNames[r].data){for(var i=t.valueNames[r].data,s=0,a=i.length;s<a;s++)if(i[s]===e)return{data:e}}else{if(t.valueNames[r].attr&&t.valueNames[r].name&&t.valueNames[r].name==e)return t.valueNames[r];if(t.valueNames[r]===e)return e}},s=function(r,n){var s,a=i(r);a&&(a.data?e.elm.setAttribute("data-"+a.data,n):a.attr&&a.name?(s=t.utils.getByClass(e.elm,a.name,!0),s&&s.setAttribute(a.attr,n)):(s=t.utils.getByClass(e.elm,a,!0),s&&(s.innerHTML=n)),s=void 0)};if(!r.create(e))for(var a in n)n.hasOwnProperty(a)&&s(a,n[a])},this.create=function(t){if(void 0!==t.elm)return!1;if(void 0===e)throw new Error("The list need to have at list one item on init otherwise you'll have to add a template.");var n=e.cloneNode(!0);return n.removeAttribute("id"),t.elm=n,r.set(t,t.values()),!0},this.remove=function(e){e.elm.parentNode===t.list&&t.list.removeChild(e.elm)},this.show=function(e){r.create(e),t.list.appendChild(e.elm)},this.hide=function(e){void 0!==e.elm&&e.elm.parentNode===t.list&&t.list.removeChild(e.elm)},this.clear=function(){if(t.list.hasChildNodes())for(;t.list.childNodes.length>=1;)t.list.removeChild(t.list.firstChild)},n()};t.exports=function(t){return new r(t)}},function(t,e){t.exports=function(t,e){var r=t.getAttribute&&t.getAttribute(e)||null;if(!r)for(var n=t.attributes,i=n.length,s=0;s<i;s++)void 0!==e[s]&&e[s].nodeName===e&&(r=e[s].nodeValue);return r}},function(t,e,r){"use strict";function n(t){return t>=48&&t<=57}function i(t,e){for(var r=(t+="").length,i=(e+="").length,s=0,l=0;s<r&&l<i;){var u=t.charCodeAt(s),c=e.charCodeAt(l);if(n(u)){if(!n(c))return u-c;for(var f=s,h=l;48===u&&++f<r;)u=t.charCodeAt(f);for(;48===c&&++h<i;)c=e.charCodeAt(h);for(var d=f,v=h;d<r&&n(t.charCodeAt(d));)++d;for(;v<i&&n(e.charCodeAt(v));)++v;var m=d-f-v+h;if(m)return m;for(;f<d;)if(m=t.charCodeAt(f++)-e.charCodeAt(h++))return m;s=d,l=v}else{if(u!==c)return u<o&&c<o&&a[u]!==-1&&a[c]!==-1?a[u]-a[c]:u-c;++s,++l}}return r-i}var s,a,o=0;i.caseInsensitive=i.i=function(t,e){return i((""+t).toLowerCase(),(""+e).toLowerCase())},Object.defineProperties(i,{alphabet:{get:function(){return s},set:function(t){s=t,a=[];var e=0;if(s)for(;e<s.length;e++)a[s.charCodeAt(e)]=e;for(o=a.length,e=0;e<o;e++)void 0===a[e]&&(a[e]=-1)}}}),t.exports=i},function(t,e){t.exports=function(t,e,r){function n(t,r){var n=t/e.length,i=Math.abs(o-r);return s?n+i/s:i?1:n}var i=r.location||0,s=r.distance||100,a=r.threshold||.4;if(e===t)return!0;if(e.length>32)return!1;var o=i,l=function(){var t,r={};for(t=0;t<e.length;t++)r[e.charAt(t)]=0;for(t=0;t<e.length;t++)r[e.charAt(t)]|=1<<e.length-t-1;return r}(),u=a,c=t.indexOf(e,o);c!=-1&&(u=Math.min(n(0,c),u),c=t.lastIndexOf(e,o+e.length),c!=-1&&(u=Math.min(n(0,c),u)));var f=1<<e.length-1;c=-1;for(var h,d,v,m=e.length+t.length,g=0;g<e.length;g++){for(h=0,d=m;h<d;)n(g,o+d)<=u?h=d:m=d,d=Math.floor((m-h)/2+h);m=d;var p=Math.max(1,o-d+1),C=Math.min(o+d,t.length)+e.length,y=Array(C+2);y[C+1]=(1<<g)-1;for(var b=C;b>=p;b--){var w=l[t.charAt(b-1)];if(0===g?y[b]=(y[b+1]<<1|1)&w:y[b]=(y[b+1]<<1|1)&w|((v[b+1]|v[b])<<1|1)|v[b+1],y[b]&f){var x=n(g,b-1);if(x<=u){if(u=x,c=b-1,!(c>o))break;p=Math.max(1,2*o-c)}}}if(n(g+1,o)>u)break;v=y}return!(c<0)}}]);

//$tool(function(){
$(document).ready(function() {
    //window.test = JSON.parse(cities);
    //console.log(cities);
    mapData.cities = window.cities;
    mapData.points = window.points;
    mapData.relatedCitiesToPoints = window.related;
    mapData.filterList = window.filterList;

    window.map = new YMap();
    ymaps.ready(map.init());
});
