<?php if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) {die(); }?>
<?$componentPath = $this->GetFolder();?>
<?//todo: вставить ключь яндекс?>
<script src="https://api-maps.yandex.ru/2.1/?apikey=''&lang=ru_RU" type="text/javascript"></script>
<script>
    window.cities  = <?=json_encode($arResult['cities'], true) ?>;
    window.points  = <?=json_encode($arResult['points'], true) ?>;
    window.related = <?=json_encode($arResult['related'])?>;
    window.filterList = <?=json_encode(array_values($arResult['filterList']), true)?>;
</script>
<div id="saloons" class=<?=(isset($arParams['shopId']) && !empty($arParams['shopId']))?'"one-saloon"':'';?>></div>
