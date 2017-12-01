<?php
'use strict';
date_default_timezone_set("Asia/Shanghai");

define('CALLED_BY', 'OMC_WEBSERVICE_PROC');

define('BPATH', dirname(__FILE__));
require_once BPATH . "/Common/BaseEnv.php";
require_once BPATH . "/OMC3/WSMngr.php";

// raw data, filter them before use
$envRaw = $_SERVER;
$urlRaw = $_GET;
$dataRaw = $_POST;

// TODO: pass in ENVIRONMENT
// call
$response = OMCWebServiceMngr::Run($envRaw, $urlRaw, $dataRaw);

// control header here
if ($response) {
    echo ($response);
}

?>
