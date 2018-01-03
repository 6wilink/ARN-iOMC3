<?php
// by Qige <qigezhao@gmail.com> since 2017.11.20
// 2017.12.28 17:14
'use strict';
define('CALLED_BY', 'OMC_WEBSERVICE_PROC');

// reserved for date()
date_default_timezone_set("Asia/Shanghai");

define('BPATH', dirname(__FILE__));
require_once BPATH . "/Common/BaseEnv.php";
require_once BPATH . "/OMC3/WSMngr.php";

// XXX: what to test
$dbgType = 'report_idle';

// load valid data
switch($dbgType) {
    case 'report_peers':
        // verified at 2017.12.22
        $env = dbgAgentReportEnv();
        $get = dbgAgentReportGet();
        $post = dbgAgentPostedFullReport();
        break;
    case 'report_idle':
        // verified at 2017.12.21
        $env = dbgAgentReportEnv();
        $get = dbgAgentReportGet();
        $post = dbgAgentPostedFullReportNoPeers();
        break;
    case 'report_sync':
        // verified at 2017.12.21
        $env = dbgAgentReportEnv();
        $get = dbgAgentReportGet();
        $post = dbgAgentPostedSync();
        break;
    case 'signin':
        // verified at 2017.12.25
        $env = dbgAuthSigninEnv();
        $get = dbgAuthSigninGet();
        $post = dbgAuthSigninPost();
        break;
    case 'token':
        // XXX: test toke valid
        $env = NULL;
        $get = dbgAuthValidToken();
        $post = NULL;
        break;
    case 'devices':
        // 2017.12.28 15:25
        $env = NULL;
        $get = dbgDeviceList();
        $post = NULL;
        break;
    case 'idevices':
        $env = NULL;
        $get = dbgDeviceList(1);
        $post = NULL;
        break;
    case 'sdevices':
        $env = NULL;
        $get = dbgDeviceList('.211');// :all, :online, :offline, .226, 1
        $post = NULL;
        break;
    case 'detail':
        // XXX: test device detail
        $env = NULL;
        $get = dbgDeviceDetail(1);
        $post = NULL;
        break;
}


if ($get) {
    // TODO: pass in ENVIRONMENT
    // call
    $response = WebServiceMngr::Run($env, $get, $post);

    // control header here
    if ($response) {
        echo ($response);
    }
}





function dbgDeviceDetail($did = NULL)
{
    return array(
        'do' => 'detail',
        'token' => 'e585505613467a58afe1fbaf49359821',
        'did' => $did
    );
}
//------------------------------

function dbgDeviceList($kw = NULL)
{
    $did = NULL;
    if (is_numeric($kw)) {
        $did = (int) $kw;
    }
    return array(
        'do' => 'devices',
        'token' => 'e585505613467a58afe1fbaf49359821',
        'keyword' => $kw,
        'did' => $did
    );
}

//------------------------------
function dbgAuthSigninEnv()
{
    return array(
        'REMOTE_ADDR' => '192.168.1.2'
    );
}
function dbgAuthSigninGet()
{
    return array(
        'do' => 'signin'
    );
}

function dbgAuthSigninPost()
{
    return array(
        'user' => 'admin',
        'passwd' => '6harmonics'
    );
}

//------------------------------
function dbgAuthValidToken()
{
    return array(
        'do' => 'token_verify',
        'token' => 'e585505613467a58afe1fbaf49359821'
    );
}



//------------------------------

function dbgAgentReportEnv()
{
    return array(
        'HTTP_USER_AGENT' => 'OMC3Agent',
        'REMOTE_ADDR' => '192.168.1.211'
    );
}
function dbgAgentReportGet($do = 'sync')
{
    return array(
        'do' => $do
    );
}

// TODO: debug function
function dbgAgentPostedSync()
{
    return array(
        'data' => <<<EOF
{
    "ops":"sync",
    "wmac":"AC:EE:3B:03:80:73",
    "ts":1510734808
}
EOF

    );
}


function dbgAgentPostedIdle()
{
    return array(
        'data' => <<<EOF
{
    "ops":"report",
    "ts":1512381113,
    "data":{
        "abb_safe":{
            "noise":-80,
            "ssid":"6harmonicsGWS",
            "bssid":"AC:EE:3B:03:80:73",
            "chanbw":"8",
            "wmac":"AC:EE:3B:03:80:73",
            "peers":{},
            "mode":"Ad-Hoc",
            "signal":-80,
            "peer_qty":0
        },
        "nw_thrpt":{
            "rx":0,
            "tx":0
        },
        "radio_safe":{
            "timeout":60,
            "region":1,
            "elapsed":28,
            "freq":666,
            "chanbw":8,
            "channo":45,
            "txpwr":24,
            "hw_ver":"GWS5Kv2",
            "rxgain":1
        }
    }
}
EOF
    );
}


function dbgAgentPostedFullReportNoPeers()
{
    return array(
        'data' => <<<EOF
{
    "ops": "report",
    "ts": 1495694362,
    "data": {
        "abb_safe": {
            "noise": -67,
            "ssid": "6harmonicsGWS",
            "bssid": "----",
            "chanbw": "8",
            "wmac": "AC:EE:3B:03:80:4D",
            "peers": null,
            "mode": "Ad-Hoc",
            "signal": -67,
            "peer_qty": 0
        },
        "nw_thrpt": {
            "rx": 0,
            "tx": 0
        },
        "radio_safe": {
            "timeout": 60,
            "region": 1,
            "elapsed": 0,
            "freq": 666,
            "chanbw": 8,
            "channo": 45,
            "txpwr": 25,
            "hw_ver": "GWS5Kv2",
            "rxgain": 1
        }
    }
}
EOF
    );
}
function dbgAgentPostedFullReport()
{
    return array(
        'data' => <<<EOF
{
    "ops":"report",
    "ts":1512380203,
    "data":{
        "abb_safe":{
            "noise":-74,
            "ssid":"6harmonicsGWS",
            "bssid":"AC:EE:3B:03:80:73",
            "chanbw":"8",
            "wmac":"AC:EE:3B:03:80:73",
            "peers":[
                {
                    "rx_short_gi":0,
                    "noise":-74,
                    "rx_mcs":1,
                    "bssid":"AC:EE:3B:03:80:73",
                    "tx_short_gi":0,
                    "rx_br":"5.8",
                    "inactive":1890,
                    "tx_br":"8.7",
                    "tx_mcs":2,
                    "wmac":"AC:EE:3B:D1:00:04",
                    "signal":-65
                },
                {
                    "rx_short_gi":0,
                    "noise":-74,
                    "rx_mcs":4,
                    "bssid":"AC:EE:3B:03:80:73",
                    "tx_short_gi":0,
                    "rx_br":"15.6",
                    "inactive":1300,
                    "tx_br":"28.9",
                    "tx_mcs":7,
                    "wmac":"AC:EE:3B:D1:00:05",
                    "signal":-55
                }
            ],
            "mode":"CAR",
            "signal":-60,
            "peer_qty":2
        },
        "nw_thrpt":{
            "rx":736,"tx":0
        },
        "radio_safe":{
            "timeout":60,
            "region":1,
            "elapsed":50,
            "freq":474,
            "chanbw":8,
            "channo":21,
            "txpwr":9,
            "hw_ver":"GWS5Kv2",
            "rxgain":1
        }
    }
}
EOF

    );
}

?>
