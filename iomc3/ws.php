<?php
'use strict';
date_default_timezone_set("Asia/Shanghai");

define('CALLED_BY', 'OMC_WEBSERVICE_PROC');

define('BPATH', dirname(__FILE__));
require_once BPATH . "/Common/BaseEnv.php";
require_once BPATH . "/OMC3/WSMngr.php";

//
$get = $_GET;
$post = $_POST;

// TODO: check UserAgent
//var_dump($_SERVER);
$ua = BaseEnv::RemoteUserAgent($_SERVER);
$host = BaseEnv::RemoteIPAddr($_SERVER);

// add host ip address
$env = array(
    'host' => $host,
    'ua' => $ua
);
$get['host'] = $host;

// TODO: pass in ENVIRONMENT
// call
$response = OMCWebServiceMngr::Run($get, $post);

// control header here
if ($response) {
    echo ($response);
}

?>
