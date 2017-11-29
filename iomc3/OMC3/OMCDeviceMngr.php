<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/OMC3/WSError.php';
require_once BPATH . '/OMC3/OMCDeviceDAO.php';

final class OMCDeviceMngr
{

    public function Destroy()
    {}

    public function DeviceCmdsForAgent($deviceId = NULL)
    {
        $reply = array();
        $cmds = $this->fetchCmdsToExec($deviceId);
        $reply = OMCError::GetErrorInArray(ERROR_NONE);
        if ($cmds) {
            $reply['cmd'] = $cmds;
        }
        return $reply;
    }

    public function DeviceLatestStatusFromAgent($deviceId = NULL, $data = NULL, $host = NULL)
    {
        if ($deviceId && $data && is_array($data)) {
            if (! $this->deviceExists($deviceId)) {
                $this->deviceFoundNew($deviceId);
            }
            $ops = BaseFilter::SearchKey($data, 'ops');
            $deviceData = BaseFilter::SearchKey($data, 'data');
            switch ($ops) {
                case 'report':
                case 'update':
                    // seprate into three parts: Analog Baseband, Radio, Network
                    $this->deviceUpdateAll($deviceId, $deviceData, $host);
                    break; // update ts, too
                case 'sync':
                default:
                    $this->deviceHeatbeat($deviceId, $host);
                    break;
            }
        }
    }

    // reply with cmds from admin
    private function fetchCmdsToExec($deviceId = NULL)
    {
        return OMCDeviceDAO::CmdsToExecute($deviceId);
    }

    // return device record id
    private function deviceExists($deviceId = NULL)
    {
        return (true && OMCDeviceDAO::DeviceExists($deviceId));
    }

    // save device record with wmac
    private function deviceFoundNew($deviceId = NULL)
    {
        return OMCDeviceDAO::DeviceFoundNew($deviceId);
    }

    private function deviceHeatbeat($deviceId = NULL, $host = NULL)
    {
        return OMCDeviceDAO::DeviceUpdateTs($deviceId, $host);
    }
    
    // save "Agent's Report"
    private function DeviceUpdateAll($deviceId = NULL, $deviceData = NULL, $host = NULL)
    {
        if ($deviceId) {
            $devAbb = BaseFilter::SearchKey($deviceData, 'abb_safe');
            $this->deviceAbbUpdate($deviceId, $devAbb);
            
            $devRadio = BaseFilter::SearchKey($deviceData, 'radio_safe');
            $this->deviceRadioUpdate($deviceId, $devRadio);
            
            $devNw = BaseFilter::SearchKey($deviceData, 'nw_thrpt');
            $this->deviceNetworkUpdate($deviceId, $devNw);
            
            $this->deviceHeatbeat($deviceId, $host);
        }
    }
    
    private function deviceAbbUpdate($deviceId = NULL, $kpi= NULL)
    {
        if ($deviceId && $kpi) {
            $data = array();
            $data['wmac'] = $deviceId;
            $data['update'] = array();
            $data['update']['ssid'] = BaseFilter::SearchKey($kpi, 'ssid');
            $data['update']['signal'] = BaseFilter::SearchKey($kpi, 'signal');
            $data['update']['noise'] = BaseFilter::SearchKey($kpi, 'noise');
            
            return OMCDeviceDAO::DeviceAbbRecordInsert($deviceId, $data);
        }
        return NULL;
    }

    private function deviceRadioUpdate($deviceId = NULL, $kpi = NULL)
    {
        if ($deviceId && $kpi) {
            $data = array();
            $data['wmac'] = $deviceId;
            $data['update'] = array();
            $data['update']['freq'] = BaseFilter::SearchKey($kpi, 'freq');
            $data['update']['txpwr'] = BaseFilter::SearchKey($kpi, 'txpwr');
            $data['update']['rxgain'] = BaseFilter::SearchKey($kpi, 'rxgain');
            
            return OMCDeviceDAO::DeviceRadioRecordInsert($deviceId, $data);
        }
        return NULL;
    }

    private function deviceNetworkUpdate($deviceId = NULL, $kpi= NULL)
    {
        if ($deviceId && $kpi) {
            $insert = array();
            $insert['nw_rxbytes'] = BaseFilter::FilterAll($kpi, 'rx');
            $insert['nw_txbytes'] = BaseFilter::FilterAll($kpi, 'tx');
            
            $data = array();
            $data['table'] = 'arn_kpi';
            $data['insert'] = $insert;
            $data['where'] = array(
                'wmac' => $deviceId
            );
            return OMCDeviceDAO::DeviceNetworkRecordInsert($deviceId, $data);
        }
        return NULL;
    }

}

?>
