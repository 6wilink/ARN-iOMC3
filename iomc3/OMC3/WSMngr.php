<?php
// by Qige <qigezhao@gmail.com>
// tech-preview: 2017.11.29
// alpha: 2017.12.04/05|2017.12.21
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// by Qige <qigezhao@gmail.com> at 2017.12.21
(! defined('BPATH')) && define('BPATH', dirname(dirname(__FILE__)));

require_once BPATH . '/Common/BaseFilter.php';
require_once BPATH . '/Common/FormatJSON.php';
require_once BPATH . '/Common/FormatHttp.php';

require_once BPATH . '/OMC3/WSAgentMngr.php';
require_once BPATH . '/OMC3/WSDeviceMngr.php';
require_once BPATH . '/OMC3/WSAuth.php';
require_once BPATH . '/OMC3/WSError.php';

// handle all request
// partly verified since 2017.12.04
// TODO: 1. audit hook ? 2. more "do"
final class WebServiceMngr
{

    // FIXME: complete user agent list
    private static $USER_AGENT = array(
        'OMC3Agent',
        'omc3agent'
    );

    // TODO: handle several kilos of requests at same time
    static public function EveryRequestHook()
    {
        // audit_all hook
        WSAuth::AuditAll(); // is token timeout?
        WSDeviceMngr::AuditAll(); // is device offline?
        return NULL;
    }

    // verified since 2017.11.04|2017.12.21
    static public function Run($envRaw = NULL, $urlRaw = NULL, $dataRaw = NULL)
    {
        // var_dump($urlRaw, $dataRaw);
        // FIXME: if $reply valid, must put all into field $reply['data']
        $response = $reply = $responseFormat = NULL;
        
        // check UserAgent first
        $envSafe = BaseFilter::FilterAll($envRaw);
        $urlSafe = BaseFilter::FilterAll($urlRaw);
        $dataSafe = BaseFilter::FilterAll($dataRaw);
        
        $do = BaseFilter::SearchKey($urlSafe, 'do');
        switch ($do) {
            case 'report':
            case 'sync':
                $responseFormat = 'kv';
                $reply = self::actionsRequireUserAgent($envSafe, $urlSafe, $dataSafe);
                break;
            case 'signin':
            case 'token_verify':
                $reply = self::actionsAnonymous($envSafe, $urlSafe, $dataSafe);
                break;
            default:
                $reply = self::actionsRequireAutherization($envSafe, $urlSafe, $dataSafe);
                break;
        }
        
        // set default reply
        if (! $reply) {
            $responseFormat = 'json';
            $reply = OMCError::GetErrorInArray(ERROR_EMPTY_RESPONSE, ($do ? $do : __FUNCTION__));
        } else {
            $reply += OMCError::GetErrorInArray(ERROR_NONE);
        }
        
        // FIXME: add more data format: csv, xml, html, etc.
        switch ($responseFormat) {
            case 'kv':
                $response = FormatHttp::Encode($reply);
                break;
            case 'json':
            default:
                $response = FormatJSON::Encode($reply);
                break;
        }
        
        return $response;
    }

    // check user agent
    // verified since 2017.11.04|2017.12.21
    static private function actionsRequireUserAgent($envSafe = NULL, $urlSafe = NULL, $dataSafe = NULL)
    {
        $reply = NULL;
        $ua = BaseEnv::RemoteUserAgent($envSafe);
        if (self::verifyUserAgent($ua)) {
            $host = BaseEnv::RemoteIPAddr($envSafe);
            $report = BaseFilter::SearchKey($dataSafe, 'data');
            $reply = WSAgentMngr::ReportReceivedAndFetchCmds($host, $report);
            
            // FIXME: only run by valid source
            // self::EveryRequestHook(); // if no is using WebApp, it won't matter
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_UNKNOWN_AR_UA);
        }
        return $reply;
    }

    // verified since 2017.11.04
    static private function actionsRequireAutherization($envSafe = NULL, $urlSafe = NULL, $dataSafe = NULL)
    {
        $token = BaseFilter::SearchKey($urlSafe, 'token');
        if (self::verifyAuthToken($token)) {
            $do = BaseFilter::SearchKey($urlSafe, 'do');
            
            // FIXME: only run by valid source, can be changed by WebApp interactions
            // self::EveryRequestHook();
            
            switch ($do) {
                case 'devices':
                case 'device_list':
                    $kw = BaseFilter::SearchKey($urlSafe, 'keyword');
                    $dqid = BaseFilter::SearchKey($urlSafe, 'did');
                    $reply = WSDeviceMngr::DeviceSearch($kw, $dqid);
                    break;
                case 'detail':
                    $dqid = BaseFilter::SearchKey($urlSafe, 'did');
                    $reply = WSDeviceMngr::DeviceDetail($dqid);
                    break;
                case 'signout':
                    $token = BaseFilter::SearchKey($urlSafe, 'token');
                    $reply = WSAuth::Singout($host, $token);
                    break;
                case 'config_load':
                    $dqid = BaseFilter::SearchKey($urlSafe, 'did');
                    $reply = WSDeviceMngr::DeviceConfigLoad($dqid);
                    break;
                case 'config':
                case 'set':
                    $dqid = BaseFilter::SearchKey($urlSafe, 'did');
                    $reply = WSDeviceMngr::DeviceConfigInQueue($dqid);
                    break;
                case 'audit_all':
                default:
                    $reply = OMCError::GetErrorInArray(ERROR_NONE);
                    break;
            }
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_BAD_TOKEN, __FUNCTION__);
        }
        return $reply;
    }

    // verified since 2017.11.04
    static private function actionsAnonymous($envSafe = NULL, $urlSafe = NULL, $dataSafe = NULL)
    {
        $reply = NULL;
        $do = BaseFilter::SearchKey($urlSafe, 'do');
        switch ($do) {
            case 'signin':
                $host = BaseEnv::RemoteIPAddr($envSafe);
                $user = BaseFilter::SearchKey($dataSafe, 'user');
                $passwd = BaseFilter::SearchKey($dataSafe, 'passwd');
                $reply = WSAuth::Signin($host, $user, $passwd);
                break;
            case 'token_verify':
                $token = BaseFilter::SearchKey($urlSafe, 'token');
                $reply = WSAuth::IsTokenValid($token);
                break;
            default:
                break;
        }
        return $reply;
    }

    // verified since 2017.11.04|2017.12.21
    static private function verifyAuthToken($token = NULL)
    {
        return ($token && WSAuth::IsTokenValid($token));
    }

    // verified since 2017.11.04|2017.12.21
    static private function verifyUserAgent($ua = NULL)
    {
        return ($ua && in_array($ua, self::$USER_AGENT));
    }
}

?>
