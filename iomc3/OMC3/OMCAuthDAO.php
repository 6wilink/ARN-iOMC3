<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/Common/BaseInterface.php';
require_once BPATH . '/Common/BaseAbsDAO.php';
require_once BPATH . '/OMC3/OMCBaseDAO.php';

final class OMCAuthDAO
{
    static private $DAO = NULL;
    
    static public function GetInstant()
    {
        self::$DAO = OMCBaseDAO::GetInstant();
        return self::$DAO;
    }
}

?>
