<?php
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

    static public function Run($urlRaw = NULL, $dataRaw = NULL)
    {
        //var_dump($urlRaw, $dataRaw);

        $response = $reply = $responseFormat = NULL;
        
        $urlSafe = BaseFilter::FilterAll($urlRaw);
        $dataSafe = BaseFilter::FilterAll($dataRaw);
        
        $host = BaseFilter::SearchKey($urlRaw, 'host');
        $do = BaseFilter::SearchKey($urlRaw, 'do');
        switch ($do) {
            case 'report':
            case 'sync':
                $responseFormat = 'kv';
                $report = BaseFilter::SearchKey($dataSafe, 'data');
                $reply = WSAgentMngr::ReportReceivedAndFetchCmds($host, $report);
                break;
            case 'signin':
                $reply = WSAuth::Signin($dataSafe);
                break;
            case 'signout':
                $reply = WSAuth::Singout($dataSafe);
                break;
            case 'token_verify':
                $reply = WSAuth::IsTokenValid($dataSafe);
                break;
            case 'device':
            case 'detail':
                $kw = BaseFilter::SearchKey($dataSafe, 'keyword');
                $dqid = BaseFilter::SearchKey($dataSafe, 'did');
                $reply = WSDeviceMngr::DeviceSearch($kw, $dqid);
                break;
            default:
                break;
        }
        
        if (! $reply) {
            $responseFormat = 'json';
            $reply = OMCError::GetErrorInArray(ERROR_EMPTY_RESPONSE, ($do ? $do : __FUNCTION__));
        } else {
            $reply += OMCError::GetErrorInArray(ERROR_NONE);
        }
        
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
}

?>
