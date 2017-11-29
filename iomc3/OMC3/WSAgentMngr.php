<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/Common/BaseFilter.php';
require_once BPATH . '/OMC3/OMCDeviceMngr.php';

final class WSAgentMngr
{

    // TODO: find WMAC, query if device exists
    // if not exist, save device before update
    // update device latest
    static public function ReportReceivedAndFetchCmds($host = NULL, $report = NULL)
    {
        $reply = NULL;
        
        if ($report) {
            $deviceData = FormatJSON::Decode($report);
            $deviceId = BaseFilter::SearchKey($deviceData, 'wmac');
            if ($deviceId) {
                $devMngr = new OMCDeviceMngr();
                $devMngr->DeviceLatestStatusFromAgent($deviceId, $deviceData, $host);
                $reply = $devMngr->DeviceCmdsForAgent($deviceId);
                $devMngr->Destroy();
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
