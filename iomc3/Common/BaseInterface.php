<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

interface ISingleton
{
    static public function GetInstant();
    static public function Destroy();
}

?>
