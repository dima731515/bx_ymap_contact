<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}
class Ymap extends \CBitrixComponent
{
    const SHOPS_IBLOCK_ID = 95;

    public function executeComponent()
    {
        $shopId = (isset($this->arParams["shopId"]) && !empty($this->arParams["shopId"])) ? $this->arParams["shopId"] : null ;
        $this->getPoints($shopId);
        $this->includeComponentTemplate();
    }
    public function onPrepareComponentParams($arParams)
    {
        return $arParams;
    }
    protected function getPoints($shopId = null)
    {
    
        if (!\CModule::IncludeModule("iblock")) return;

        $iblockId = self::SHOPS_IBLOCK_ID;//95;
        //result:
        $cities  = [];
        $points  = [];
        $related = [];// [cityId, eleId]
        $filterList = ['все'];

        $arSectionFilter = Array('IBLOCK_ID'=>$iblockId, 'GLOBAL_ACTIVE'=>'Y');
        $dbSectionlist = CIBlockSection::GetList(array(), $arSectionFilter, true);
        while($arSectionResult = $dbSectionlist->GetNext())
        {
            $coord = explode(',', trim(htmlspecialchars($arSectionResult['DESCRIPTION'])));
            $cities[] = ['id'=>$arSectionResult['ID'], 'name'=>htmlspecialchars($arSectionResult['NAME']), 'coordinates'=>[$coord[0], $coord[1]]];

        }
        $arFilterShops = array('IBLOCK_ID' => $iblockId, 'ACTIVE'=>'Y');
        if($shopId){
            $arFilterShops['ID'] = $shopId;
        }

        $dbElementList = \CIBlockElement::GetList(
            array('SORT'=>'DESC'),
            $arFilterShops,
            false,
            false,
            array(
                'ID', 'IBLOCK_ID', 'NAME', 'SECTION_ID', 'DETAIL_PAGE_URL', 'CODE', 'DESCRIPTION'
            )
        );
        while($arElement = $dbElementList->GetNextElement()){
            $arFields = $arElement->GetFields();
            $arProps = $arElement->GetProperties();

            $related[] = ['cityId'=>$arFields['IBLOCK_SECTION_ID'], 'pointId'=>$arFields['ID']];
            $images = [];
//            foreach($arProps['PHOTOS']['VALUE'] as $photo)
//            {
//                $img = CFile::GetFileArray($photo);
//                $images[] = $img['SRC'];
//                unset($img);
//            }
            $metro = [];
            foreach($arProps['METRO']['VALUE'] as $metroName)
            {
                $metro[] = $metroName; 
            }
            $arCoord = explode(',', trim(htmlspecialchars($arProps['LOCATION']['VALUE'])));
            $categories = implode(', ', $arProps['CATEGORY']['VALUE']);
            $filterList = array_merge($filterList, $arProps['CATEGORY']['VALUE']);
            $points[] = [
                'id'=> $arFields['ID'],
                'coordinates'=> [$arCoord[0],$arCoord[1]],
                'name'=> $arFields['NAME'],
                'description'=> htmlspecialchars($arFields['DESCRIPTION']),
                'address'=> $arProps['ADDRESS']['VALUE'],
                'phone'=> $arProps['PHONE']['VALUE'],
                'category'=> $categories,
                'workHors'=> $arProps['TIME_1']['VALUE'],
                'saturdayHors'=> $arProps['TIME_2']['VALUE'],
                'sundayHors'=> $arProps['TIME_3']['VALUE'],
                'detailPage'=> $arFields['DETAIL_PAGE_URL'],
                'photos'=> $images,
                'metro' => $metro
            ];
            unset($categories);
            unset($arCoord);
            unset($images);
        }
        $this->arResult['filterList'] = array_unique($filterList);
        $this->arResult['cities'] = $cities;
        $this->arResult['points'] = $points;
        $this->arResult['related'] = $related;
    }
}
