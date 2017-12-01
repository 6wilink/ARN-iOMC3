<?php
// by Qige <qigezhao@gmail.com> at 2017.11.29

'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/Common/BaseFilter.php';
require_once BPATH . '/Common/FormatJSON.php';
require_once BPATH . '/Common/FormatHttp.php';

require_once BPATH . '/OMC3/WSAgentMngr.php';
require_once BPATH . '/OMC3/WSDeviceMngr.php';
require_once BPATH . '/OMC3/WSAuth.php';
require_once BPATH . '/OMC3/WSError.php';

// handle all request
final class OMCWebServiceMngr
{
    // FIXME: complete user agent list
    static private $USER_AGENT = array('OMC3Agent');

    static public function Run($envRaw = NULL, $urlRaw = NULL, $dataRaw = NULL)
    {
        //var_dump($urlRaw, $dataRaw);
        // FIXME: if $reply valid, must put all into field $reply['data']
        $response = $reply = $responseFormat = NULL;
        
        // TODO: check UserAgent first
        $envSafe = BaseFilter::FilterAll($envRaw);
        $urlSafe = BaseFilter::FilterAll($urlRaw);
        $dataSafe = BaseFilter::FilterAll($dataRaw);
        
        $do = BaseFilter::SearchKey($urlSafe, 'do');
        switch($do) {
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
        
        // TODO: add more data format: csv, xml, html, etc.
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
    static private function actionsRequireUserAgent($envSafe = NULL, $urlSafe = NULL, $dataSafe = NULL)
    {
        $reply = NULL;
        $ua = BaseEnv::RemoteUserAgent($envSafe);
        if (self::verifyUserAgent($ua)) {
            $host = BaseEnv::RemoteIPAddr($envSafe);
            $report = BaseFilter::SearchKey($dataSafe, 'data');
            $reply = WSAgentMngr::ReportReceivedAndFetchCmds($host, $report);
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_UNKNOWN_AR_UA);
        }
        return $reply;
    }
    
    static private function actionsRequireAutherization($envSafe = NULL, $urlSafe = NULL, $dataSafe = NULL)
    {
        $token = BaseFilter::SearchKey($urlSafe, 'token');
        if (self::verifyAuthToken($token)) {
            $do = BaseFilter::SearchKey($urlSafe, 'do');
            switch ($do) {
                case 'audit': // is token timeout? is device offline?
                    break;
                case 'signout':
                    $token = BaseFilter::SearchKey($urlSafe, 'token');
                    $reply = WSAuth::Singout($host, $token);
                    break;
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
                case 'config_load':
                    $dqid = BaseFilter::SearchKey($urlSafe, 'did');
                    $reply = WSDeviceMngr::DeviceConfigLoad($dqid);
                    break;
                case 'config':
                case 'set':
                    $dqid = BaseFilter::SearchKey($urlSafe, 'did');
                    $reply = WSDeviceMngr::DeviceConfigInQueue($dqid);
                    break;
                case 'msg_sync':
                    $dqid = BaseFilter::SearchKey($urlSafe, 'did');
                    $reply = WSDeviceMngr::DeviceMsgCheck($kw, $dqid);
                    break;
                default:
                    break;
            }
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_BAD_TOKEN, __FUNCTION__);
        }
        return $reply;
    }
    
    static private function actionsAnonymous($envSafe = NULL, $urlSafe = NULL, $dataSafe = NULL)
    {
        $reply = NULL;
        $do = BaseFilter::SearchKey($urlSafe, 'do');
        switch($do) {
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
    
    static private function verifyAuthToken($token = NULL)
    {
        return ($token && WSAuth::IsTokenValid($token));
    }
    
    static private function verifyUserAgent($ua = NULL)
    {
        return ($ua && in_array($ua, self::$USER_AGENT));
    }
}

?>
