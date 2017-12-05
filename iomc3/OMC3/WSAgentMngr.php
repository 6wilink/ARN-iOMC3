<?php
// by Qige <qigezhao@gmail.com>
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/Common/BaseFilter.php';
require_once BPATH . '/OMC3/AgentDeviceMngr.php';

// verified at 2017.12.05
final class WSAgentMngr
{

    // find WMAC, query if device exists
    // if not exist, save device before update
    // update device latest
    static public function ReportReceivedAndFetchCmds($host = NULL, $report = NULL)
    {
        $reply = NULL;
        
        if ($report) {
            // parse json & fetch device query id
            $deviceData = FormatJSON::Decode($report);
            $deviceId = BaseFilter::SearchKey($deviceData, 'wmac');
            if ($deviceId) {
                $devMngr = new AgentDeviceMngr($deviceId);
                $devMngr->DeviceLatestStatusFromAgent($deviceData, $host);
                $reply = $devMngr->DeviceCmdsForAgent();
                $devMngr->Destroy();
                
                if (! $reply) {
                    $reply = OMCError::GetErrorInArray(ERROR_NONE, __FUNCTION__);
                }
            } else {
                $reply = OMCError::GetErrorInArray(ERROR_UNKNOWN_AR_DEVICEID, __FUNCTION__);
            }
        } else {
            $reply = OMCError::GetErrorInArray(ERROR_UNKNOWN_AR_FORMAT, __FUNCTION__);
        }
        
        return $reply;
    }
}

?>
