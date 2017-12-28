<?php
// by Qige <qigezhao@gmail.com>
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// by Qige <qigezhao@gmail.com> at 2017.12.21
(! defined('BPATH')) && define('BPATH', dirname(dirname(__FILE__)));

require_once BPATH . '/Common/BaseFilter.php';
require_once BPATH . '/OMC3/OMCAgent3.php';

// verified at 2017.12.05
// 2017.12.21 dev
// verified at 2017.12.28 15:48
final class WSAgentMngr
{

    // find WMAC, query if device exists
    // if not exist, save device before update
    // update device latest, verified since 2017.12.21
    // verified at 2017.12.28 15:49
    static public function ReportReceivedAndFetchCmds($host = NULL, $report = NULL)
    {
        $reply = NULL;
        
        if ($report) {
            // parse json & fetch device query id
            $deviceData = FormatJSON::Decode($report);
            $deviceId = BaseFilter::SearchKey($deviceData, 'wmac');
            if ($deviceId) {
                $agentMngr = new OMCAgent3($deviceId);
                $agentMngr->DeviceLatestStatusFromAgent($deviceData, $host);
                $reply = $agentMngr->DeviceCmdsForAgent();
                $agentMngr->Destroy();
            } else {
                $reply = OMCError::GetErrorInArray(ERROR_UNKNOWN_AR_DEVICEID, __FUNCTION__);
            }
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_EMPTY_AR_CONTENT, __FUNCTION__);
        }
        
        return $reply;
    }
}

?>
