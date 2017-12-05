<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/OMC3/WSError.php';
require_once BPATH . '/OMC3/OMCDeviceDAO.php';
require_once BPATH . '/OMC3/VendorARN.php';

// 
final class AgentDeviceMngr
{
    private $deviceQueryId = NULL;
    private $deviceId = NULL;
    
    // verified since 2017.11.04
    public function __construct($deviceId = NULL)
    {
        $this->deviceId = $deviceId;
        if ($deviceId) {
            $deviceQueryId = $this->findDeviceQueryId($deviceId);
            $this->deviceQueryId = $deviceQueryId;
        }
    }
    
    // TODO: not verified since 2017.11.04
    public function Destroy()
    {
        OMCDeviceDAO::OMCDbDisconnect();
    }

    //--------- --------- device exists, save new device --------- ---------
    
    // NOTE: don't save device id! verified since 2017.11.04
    // return device record id
    private function findDeviceQueryId($deviceId = NULL)
    {
        if ($deviceId) {
            $deviceQueryId = OMCDeviceDAO::DeviceQueryId($deviceId);
            if ($deviceQueryId) {
                return $deviceQueryId;
            }
        }
        return NULL;
    }
    
    // verified since 2017.11.04
    private function deviceExists($deviceId = NULL)
    {
        return (true && OMCDeviceDAO::DeviceExists($deviceId));
    }
    
    // save device record with wmac
    // verified since 2017.11.04
    private function newDeviceFound($deviceId = NULL)
    {
        OMCDeviceDAO::NewDeviceFound($deviceId);
    }
    
    //--------- --------- Save Agent's Report/Sync --------- --------- ---------
    
    // verified since 2017.11.04
    public function DeviceLatestStatusFromAgent($data = NULL, $host = NULL)
    {
        $deviceQueryId = $this->deviceQueryId;
        if (! $deviceQueryId) {
            $deviceId = BaseFilter::SearchKey($data, 'wmac');
            if (! $this->deviceExists($deviceId)) {
                $this->newDeviceFound($deviceId);
            }
            
            $deviceQueryId = self::findDeviceQueryId($deviceId);
            $this->deviceQueryId = $deviceQueryId;
        }
        
        // query by device query id
        if ($deviceQueryId && $data && is_array($data)) {
            $ops = BaseFilter::SearchKey($data, 'ops');
            $deviceData = BaseFilter::SearchKey($data, 'data');
            switch ($ops) {
                case 'report':
                case 'update':
                    // seprate into three parts: Analog Baseband, Radio, Network
                    $this->deviceUpdateAll($deviceQueryId, $deviceData, $host);
                    break; // update ts, too
                case 'sync':
                default:
                    $this->deviceHeatbeat($deviceQueryId, $host);
                    break;
            }
        }
    }
    
    // FIXME: remove "ts" update of device if too much query slow down the speed
    // verified since 2017.11.04
    private function deviceHeatbeat($deviceQueryId = NULL, $host = NULL)
    {
        $now = date('Y-m-d H:i:s');
        $data = array(
            //'host' => $host,
            'ts' => $now
        );
        OMCDeviceDAO::DeviceSave($deviceQueryId, $data);
        
        $now = date('Y-m-d H:i:s');
        $data = array(
            'host' => $host,
            'ts' => $now
        );
        OMCDeviceDAO::DeviceStatusSave($deviceQueryId, 'nw', $data);
    }
    
    // save "Agent's Report"
    // not verified since 2017.11.04
    private function DeviceUpdateAll($deviceQueryId = NULL, $deviceData = NULL, $host = NULL)
    {
        if ($deviceQueryId) {
            $devAbb = BaseFilter::SearchKey($deviceData, 'abb_safe');
            $this->deviceAbbUpdate($deviceQueryId, $devAbb);
            
            $devRadio = BaseFilter::SearchKey($deviceData, 'radio_safe');
            $this->deviceRadioUpdate($deviceQueryId, $devRadio);
            
            $devNw = BaseFilter::SearchKey($deviceData, 'nw_thrpt');
            $this->deviceNetworkUpdate($deviceQueryId, $devNw, $host);
            
            $this->deviceHeatbeat($deviceQueryId, $host);
        }
    }
    
    // update abb, insert peers
    // verified since 2017.11.04
    private function deviceAbbUpdate($deviceQueryId = NULL, $kpi = NULL)
    {
        if ($deviceQueryId && $kpi) {
            $mode = BaseFilter::SearchKey($kpi, 'mode');
            $noise = BaseFilter::SearchKey($kpi, 'noise');
            $signal = BaseFilter::SearchKey($kpi, 'signal');
            $emode = VendorARN::ConvertModeToEnumMode($mode);
            $ssid = BaseFilter::SearchKey($kpi, 'ssid');
            $bssid = BaseFilter::SearchKey($kpi, 'bssid');
            $chanbw = BaseFilter::SearchKey($kpi, 'chanbw');
            
            $rx = BaseFilter::SearchKey($kpi, 'rx');
            $tx = BaseFilter::SearchKey($kpi, 'tx');
            
            // save cache/status
            $data = array(
                'emode' => $emode,
                'ssid' => $ssid,
                'bssid' => $bssid,
                'noise' => $noise,
                'chanbw' => $chanbw
            );
            OMCDeviceDAO::DeviceStatusSave($deviceQueryId, 'abb', $data);
            
            // TODO: insert peers
            
            // insert history
            $data = array(
                'emode' => $emode,
                'ssid' => $ssid,
                'bssid' => $bssid,
                'noise' => $noise,
                'signal' => $signal,
                'chanbw' => $chanbw,
                'rx' => $rx,
                'tx' => $tx
            );
            OMCDeviceDAO::DeviceStatusHistorySave($deviceQueryId, 'abb', $data);
        }
    }

    // verified since 2017.11.04
    private function deviceRadioUpdate($deviceQueryId = NULL, $kpi = NULL)
    {
        if ($deviceQueryId && $kpi) {
            $hwver = BaseFilter::SearchKey($kpi, 'hw_ver');
            $chanbw = BaseFilter::SearchKey($kpi, 'chanbw');
            
            $region = BaseFilter::SearchKey($kpi, 'region');
            $channel = BaseFilter::SearchKey($kpi, 'channo');
            $freq = BaseFilter::SearchKey($kpi, 'freq');
            
            $txpwr = BaseFilter::SearchKey($kpi, 'txpwr');
            $rxgain = BaseFilter::SearchKey($kpi, 'rx_gain');
            
            // save hw_ver
            $now = date('Y-m-d H:i:s');
            $data = array(
                'hw_ver' => $hwver,
                'ts' => $now
            );
            OMCDeviceDAO::DeviceSave($deviceQueryId, $data);
            
            // save cache/status
            $now = date('Y-m-d H:i:s');
            $data = array(
                'region' => $region,
                'channel' => $channel,
                'freq' => $freq,
                'chanbw' => $chanbw,
                'txpwr' => $txpwr,
                'rxgain' => $rxgain,
                'ts' => $now
            );
            OMCDeviceDAO::DeviceStatusSave($deviceQueryId, 'radio', $data);
            
            // insert history
            $now = date('Y-m-d H:i:s');
            $data = array(
                'region' => $region,
                'channel' => $channel,
                'freq' => $freq,
                'chanbw' => $chanbw,
                'txpwr' => $txpwr,
                'rxgain' => $rxgain,
                'ts' => $now
            );
            OMCDeviceDAO::DeviceStatusHistorySave($deviceQueryId, 'radio', $data);
        }
    }

    // verified since 2017.11.04
    private function deviceNetworkUpdate($deviceQueryId = NULL, $kpi= NULL, $host = NULL)
    {
        if ($deviceQueryId && $kpi) {
            $ifname = BaseFilter::SearchKey($kpi, 'ifname');
            $netmask = BaseFilter::SearchKey($kpi, 'netmask');
            $gw = BaseFilter::SearchKey($kpi, 'gw');
            $vlan = BaseFilter::SearchKey($kpi, 'vlan');
            
            $rxthrpt = BaseFilter::SearchKey($kpi, 'rx');
            $txthrpt = BaseFilter::SearchKey($kpi, 'tx');            
            
            // save cache/status
            $now = date('Y-m-d H:i:s');
            $data = array(
                'ifname' => $ifname,
                'reachable' => 'online',
                'ipaddr' => $host,
                'netmask' => $netmask,
                'gw' => $gw,
                'vlan' => $vlan,
                'ts' => $now
            );
            OMCDeviceDAO::DeviceStatusSave($deviceQueryId, 'nw', $data);
            
            // insert history
            $now = date('Y-m-d H:i:s');
            $data = array(
                'ifname' => $ifname,
                'rxthrpt' => $rxthrpt,
                'txthrpt' => $txthrpt,
                'ts' => $now
            );
            OMCDeviceDAO::DeviceStatusHistorySave($deviceQueryId, 'nw', $data);
        }
    }

    //--------- --------- Device Cmds from Admin --------- --------- ---------
    // TODO: not verified since 2017.11.04
    public function DeviceCmdsForAgent()
    {
        $deviceQueryId = $this->deviceQueryId;
        if (! $deviceQueryId) {
            $deviceId = BaseFilter::SearchKey($data, 'wmac');
            if (! $this->deviceExists($deviceId)) {
                $this->newDeviceFound($deviceId);
            }
            
            $deviceQueryId = self::findDeviceQueryId($deviceId);
            $this->deviceQueryId = $deviceQueryId;
        }
        
        $cmds = $this->fetchCmdsToExec($deviceQueryId);
        $reply = OMCError::GetErrorInArray(ERROR_NONE);
        if ($cmds) {
            $reply = array();
            $reply['cmd'] = $cmds;
            
            return $reply;
        }
        return NULL;
    }

    // reply with cmds from admin
    // TODO: not verified since 2017.11.04
    private function fetchCmdsToExec($deviceQueryId = NULL)
    {
        return OMCDeviceDAO::CmdsToExecute($deviceQueryId);
    }
    
}

?>
