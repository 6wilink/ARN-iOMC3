<?php
// by Qige <qigezhao@gmail.com> since 2017.11.20
// 2017.12.28 17:14
'use strict';
define('CALLED_BY', 'OMC_WEBSERVICE_PROC');

// reserved for date()
date_default_timezone_set("Asia/Shanghai");

define('BPATH', dirname(__FILE__));
require_once BPATH . "/OMC3/WSMngr.php";

// raw data, filter them before use
$envRaw = $_SERVER;
$urlRaw = $_GET;
$dataRaw = $_POST;

// verified since 2017.11.04
// verified at 2017.12.28 15:33
$response = WebServiceMngr::Run($envRaw, $urlRaw, $dataRaw);

// control header here
if ($response) {
    echo ($response);
} else {
    echo ('404: File Not Found');
}

?>
