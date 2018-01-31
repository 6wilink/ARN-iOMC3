<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// by Qige <qigezhao@gmail.com> at 2017.12.21
(! defined('BPATH')) && define('BPATH', dirname(dirname(__FILE__)));

require_once BPATH . '/OMC3/WSError.php';
require_once BPATH . '/OMC3/OMCDeviceDAO.php';
require_once BPATH . '/OMC3/VendorARN.php';

// TODO: 1. fetch cmds.
// support agent
final class OMCAgent3
{
    private $deviceQueryId = NULL;
    private $deviceId = NULL;
    
    // verified since 2017.11.04
    // 2017.12.21
    // verified at 2017.12.28 15:48
    public function __construct($deviceId = NULL)
    {
        $this->deviceId = $deviceId;
        /*if ($deviceId) {
            $deviceQueryId = $this->findDeviceRecordId($deviceId);
        }*/
    }
    
    // verified since 2017.12.21
    // verified at 2017.12.28 15:48
    public function __destruct()
    {
        self::Destroy();
    }
    
    // verified since 2017.11.04|2017.12.21
    // verified at 2017.12.28 15:48
    public function Destroy()
    {
        OMCDeviceDAO::Disconnect();
    }
    
    // verified at 2017.12.28 15:48
    public function Reset()
    {
        $this->deviceQueryId = NULL;
        $this->deviceId = NULL;
    }

    //--------- --------- device exists, save new device --------- ---------
    
    // NOTE: don't save device id! verified since 2017.11.04
    // return device record id
    // verified since 2017.12.21
    // verified at 2017.12.28 15:51
    private function findDeviceRecordId($deviceId = NULL)
    {
        $deviceQueryId = $this->deviceQueryId;
        if ($deviceQueryId < 1) {
            $rtype = 'device';
            $rfields = array(
                'id'
            );
            $rfilter = array(
                'wmac' => $deviceId
            );
            $deviceQueryId = OMCDeviceDAO::FindRecordId($rfields, $rtype, $rfilter, __FUNCTION__);
            $this->deviceQueryId = $deviceQueryId;
        }
        return $deviceQueryId;
    }
    
    // verified since 2017.11.04
    // 2017.12.21
    // verified at 2017.12.28 15:51
    private function deviceExists($deviceId = NULL)
    {
        return ($deviceId && $this->findDeviceRecordId($deviceId));
    }
    
    // save device record with wmac
    // verified since 2017.11.04|2017.12.21
    // verified at 2017.12.28 15:51
    private function newDeviceFound($deviceId = NULL)
    {
        $data = array(
            'wmac' => $deviceId
        );
        return OMCDeviceDAO::NewDeviceFound($data);
    }
    
    //--------- --------- Save Agent's Report/Sync --------- --------- ---------
    
    // verified since 2017.11.04
    // 2017.12.21
    // verified at 2017.12.28 15:50
    public function DeviceLatestStatusFromAgent($data = NULL, $host = NULL)
    {
        $deviceQueryId = $this->deviceQueryId;
        if (! $deviceQueryId) {
            $deviceId = BaseFilter::SearchKey($data, 'wmac');
            if (! $deviceId) {
                $deviceId = $this->deviceId;
            }
            if (! $this->deviceExists($deviceId)) {
                $this->newDeviceFound($deviceId);
            }
            
            $deviceQueryId = $this->findDeviceRecordId($deviceId);
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
    // verified since 2017.11.04|2017.12.21
    // verified at 2017.12.28 15:55
    private function deviceHeatbeat($deviceQueryId = NULL, $host = NULL)
    {
        $now = date('Y-m-d H:i:s');
        $data = array(
            //'host' => $host,
            'ts' => $now
        );
        OMCDeviceDAO::DeviceSaveByRecordId($deviceQueryId, $data);
        
        $ntype = 'nw';
        $now = date('Y-m-d H:i:s');
        $data = array(
            'ipaddr' => $host,
            'ts' => $now
        );
        OMCDeviceDAO::DeviceStatusSaveByRecordId($deviceQueryId, $ntype, $data);
    }
    
    // save "Agent's Report"
    // not verified since 2017.11.04|2017.12.21
    // verified at 2017.12.28 15:52
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
    // verified since 2017.11.04|2017.12.21
    // verified at 2017.12.28 15:52
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
            OMCDeviceDAO::DeviceStatusSaveByRecordId($deviceQueryId, 'abb', $data);
            
            // insert peers
            // if no peers, set all history peers offline
            $peer_qty = BaseFilter::SearchKey($kpi, 'peer_qty');
            $peers = BaseFilter::SearchKey($kpi, 'peers');
            if ($peer_qty > 0 && is_array($peers)) {
                foreach($peers as $peer) {
                    $pwmac = BaseFilter::SearchKey($peer, 'wmac');
                    $pipaddr = BaseFilter::SearchKey($peer, 'ip');
                    $psignal = BaseFilter::SearchKey($peer, 'signal');
                    
                    $prx_br = BaseFilter::SearchKey($peer, 'rx_br');
                    $prx_mcs = BaseFilter::SearchKey($peer, 'rx_mcs');
                    $prx_short_gi = BaseFilter::SearchKey($peer, 'rx_short_gi');
                    $prx = "{$prx_br},{$prx_mcs},{$prx_short_gi}";
                    
                    $ptx_br = BaseFilter::SearchKey($peer, 'tx_br');
                    $ptx_mcs = BaseFilter::SearchKey($peer, 'tx_mcs');
                    $ptx_short_gi = BaseFilter::SearchKey($peer, 'tx_short_gi');
                    $ptx = "{$ptx_br},{$ptx_mcs},{$ptx_short_gi}";
                    $data = array(
                        'pwmac' => $pwmac,
                        'realtime' => 'connected',
                        'pipaddr' => $pipaddr,
                        'psignal' => $psignal,
                        'prx' => $prx,
                        'ptx' => $ptx
                    );
                    OMCDeviceDAO::DeviceStatusSaveByRecordId($deviceQueryId, 'abb_peers', $data);
                }
            } else {
                $flagInsertIfNoRecordFound = false;
                $data = array(
                    'realtime' => 'unreachable'
                );
                OMCDeviceDAO::DeviceStatusSaveByRecordId($deviceQueryId, 'abb_peers', $data, $flagInsertIfNoRecordFound);
            }
            
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
            OMCDeviceDAO::DeviceStatusHistorySaveByRecordId($deviceQueryId, 'abb', $data);
        }
    }

    // verified since 2017.11.04
    // 2017.12.21
    // verified at 2017.12.28 15:52
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
            OMCDeviceDAO::DeviceSaveByRecordId($deviceQueryId, $data);
            
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
            OMCDeviceDAO::DeviceStatusSaveByRecordId($deviceQueryId, 'radio', $data);
            
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
            OMCDeviceDAO::DeviceStatusHistorySaveByRecordId($deviceQueryId, 'radio', $data);
        }
    }

    // verified since 2017.11.04
    // 2017.12.21
    // verified at 2017.12.28 15:52
    private function deviceNetworkUpdate($deviceQueryId = NULL, $kpi= NULL, $host = NULL)
    {
        if ($deviceQueryId && $kpi) {
            $ifname = BaseFilter::SearchKey($kpi, 'ifname');
            $netmask = BaseFilter::SearchKey($kpi, 'netmask');
            $gateway = BaseFilter::SearchKey($kpi, 'gateway');
            $vlan = BaseFilter::SearchKey($kpi, 'vlan');
            
            // save cache/status
            $now = date('Y-m-d H:i:s');
            $data = array(
                'ifname' => $ifname,
                'reachable' => 'online',
                'ipaddr' => $host,
                'netmask' => $netmask,
                'gateway' => $gateway,
                'vlan' => $vlan,
                'ts' => $now
            );
            OMCDeviceDAO::DeviceStatusSaveByRecordId($deviceQueryId, 'nw', $data);
            
            // insert history
            $rxbytes = BaseFilter::SearchKey($kpi, 'rx');
            $txbytes = BaseFilter::SearchKey($kpi, 'tx');
            $interval = BaseFilter::SearchKey($kpi, 'interval');
            $now = date('Y-m-d H:i:s');
            $data = array(
                'ifname' => $ifname,
                'rxbytes' => $rxbytes,
                'txbytes' => $txbytes,
                'elapsed' => $interval,
                'ts' => $now
            );
            OMCDeviceDAO::DeviceStatusHistorySaveByRecordId($deviceQueryId, 'nw', $data);
        }
    }

    //--------- --------- Device Cmds from Admin --------- --------- ---------
    // TODO: not verified since 2017.11.04
    // TODO: not verified since 2017.12.12
    public function DeviceCmdsForAgent()
    {
        $deviceQueryId = $this->deviceQueryId;
        $reply = null;
        if ($deviceQueryId) {        
            $cmds = $this->fetchCmdsToExec($deviceQueryId);
            //$reply = OMCError::GetErrorInArray(ERROR_NONE);
            if ($cmds) {
                list($key, $value) = explode('=', $cmds);
                $reply = array(
                    'cmd' => $key,
                    'val' => $value
                );
            }
        }
        
        return $reply;
    }

    // reply with cmds from admin
    // TODO: not verified since 2017.11.04
    // TODO: not verified since 2017.12.12
    private function fetchCmdsToExec($deviceQueryId = NULL)
    {
        return OMCDeviceDAO::CmdsToExecute($deviceQueryId);
    }
    
}

?>
