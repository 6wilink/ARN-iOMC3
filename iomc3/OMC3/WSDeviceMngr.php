<?php
// by Qige <qigezhao@gmail.com> since 2017.11.29
// 2017.12.25/2017.12.28
// verified at 2017.12.28 17:19
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// by Qige <qigezhao@gmail.com> at 2017.12.21
(! defined('BPATH')) && define('BPATH', dirname(dirname(__FILE__)));

require_once BPATH . '/Common/BaseFilter.php';
require_once BPATH . '/OMC3/OMCDeviceDAO.php';

// verified at 2017.12.28 17:19
final class WSDeviceMngr
{
    // 3 intervals, 4*3=12 seconds
    CONST GS_BAR = 12;
    
    // 120 timestamp gap, plus 1 interval, 120+2=122 seconds
    CONST GS_BAR_FIX = 122;

    // get the latest lock time stamp
    // for audit lock check
    static public function AuditLastTs()
    {
        $reply = self::getAuditLockTs();
        $ts = BaseFilter::SearchKey($reply, 'audit');
        return $ts;
    }
    
    // TODO: audit device offline by last update ts
    static public function AuditAllDevices()
    {
        $reply = null;
        
        // audit device offline
        $devices = self::deviceListSearchByKeyword(':all');
        $now = date('Y-m-d H:i:s');
        foreach ($devices as $device) {
            $did = BaseFilter::SearchKey($device, 'id');
            
            // save online/offline
            $ts = self::getLastestSyncTs($did);
            $gap = self::GS_BAR;
            if (! $ts) {
                $ts = 0;
            }
            
            // if 
            $now_val = strtotime($now);
            $last_min = strtotime('-1 min');
            $ts_val = strtotime($ts);
            $gap = (int) ($now_val - $ts_val - self::GS_BAR_FIX);
            $reply = array(
                'now_val' => $now_val,
                'last_min' => $last_min,
                'ts_val' => $ts_val,
                'gap' => $gap
            );
            if ($gap >= self::GS_BAR) {
                // mark offline
                $data = array(
                    'reachable' => 'offline'
                );
                OMCDeviceDAO::DeviceStatusSaveByRecordId($did, 'nw', $data);
                
                // offline all its peers
                $pdata = array(
                    'realtime' => 'unreachable'
                );
                OMCDeviceDAO::DeviceStatusSaveByRecordId($did, 'abb_peers', $pdata);
                
                // TODO: trigger DeviceMSG offline
                ;
                
                // let all its peers offline
            } else {
                // mark online, save audit ts
                // mark offline
                $data = array(
                    'reachable' => 'online'
                );
                OMCDeviceDAO::DeviceStatusSaveByRecordId($did, 'nw', $data);
                
                // TODO: trigger DeviceMSG offline
                ;
            }
                        
            // save audit ts
            $data = array(
                'auditts' => $now
            );
            OMCDeviceDAO::DeviceSaveByRecordId($did, $data);
        }
        
        return $reply;
    }
    
    static private function getAuditLockTs()
    {
        $reply = OMCDeviceDAO::GetLastDeviceTs('lock');
        $ts = BaseFilter::SearchKey($reply, 'auditat');
        return $ts;
    }
    // get last audit ts
    static private function getLatestAuditTs($deviceQueryId = null)
    {
        $reply = OMCDeviceDAO::GetLastDeviceTs('auditts', $deviceQueryId);
        $ts = BaseFilter::SearchKey($reply, 'auditat');
        return $ts;
    }
    
    static private function getLastestSyncTs($deviceQueryId = null)
    {
        $reply = OMCDeviceDAO::GetLastDeviceTs('syncts', $deviceQueryId);
        $ts = BaseFilter::SearchKey($reply, 'ts');
        return $ts;
    }
    
    // --------- --------- Search Device by id, keyword or all --------- ---------
    // verified since 2017.12.28 17:00
    // reserved wrapper
    static private function deviceStatistics()
    {
        $reply = OMCDeviceDAO::DeviceStatistics();
        return $reply;
    }
    
    // wrapper for search by id, search by keyword & all
    // verified since 2017.12.28 16:05
    static public function DeviceSearch($keyword = null, $deviceQueryId = null)
    {
        // handle search by id or keyword
        if ($deviceQueryId) {
            $devices = self::deviceListSearchById($deviceQueryId);
        } else if ($keyword) {
            $devices = self::deviceListSearchByKeyword($keyword);
        } else {
            $devices = self::deviceListSearchByKeyword(':all');
        }
        
        $reply = array(
            'data' => array(
                'ds' => self::deviceStatistics(),
                'qty' => count($devices),
                'devices' => $devices
            )
        );
        return $reply;
    }
    
    static public function DeviceSearchWithGPS($keyword = null, $deviceQueryId = null)
    {
        // handle search by id or keyword
        $flag = true;
        if ($deviceQueryId) {
            $devices = self::deviceListSearchById($deviceQueryId, $flag);
        } else if ($keyword) {
            $devices = self::deviceListSearchByKeyword($keyword, $flag);
        } else {
            $devices = self::deviceListSearchByKeyword(':all', $flag);
        }
        
        $reply = array(
            'data' => array(
                'ds' => self::deviceStatistics(),
                'qty' => count($devices),
                'devices' => $devices
            )
        );
        return $reply;
    }

    // reserved wrapper
    static private function deviceListSearchById($deviceQueryId = null, $flag = false)
    {
        $reply = OMCDeviceDAO::DeviceListSearchById($deviceQueryId, $flag);
        return $reply;
    }

    // support search pattens
    // verified since 2017.12.28 16:06
    static private function deviceListSearchByKeyword($keyword = null, $flag = false)
    {
        $reply = null;
        $records = null;
        switch ($keyword) {
            case ':all':
                $records = OMCDeviceDAO::DeviceListFetchByStatus('all', $flag); // 2017.12.28 15:26
                break;
            case ':online':
                $records = OMCDeviceDAO::DeviceListFetchByStatus('online', $flag);
                break;
            case ':offline':
                $records = OMCDeviceDAO::DeviceListFetchByStatus('offline', $flag);
                break;
            default:
                $records = OMCDeviceDAO::DeviceListSearchByKeyword($keyword, $flag);
                break;
        }
        
        // re-format result
        if ($records && is_array($records)) {
            $reply = array();
            foreach ($records as $record) {
                $did = BaseFilter::SearchKey($record, 'id');
                $name = BaseFilter::SearchKey($record, 'name');
                $emode = BaseFilter::SearchKey($record, 'emode');
                $lat = BaseFilter::SearchKey($record, 'lat');
                $lng = BaseFilter::SearchKey($record, 'lng');
                $ipaddr = BaseFilter::SearchKey($record, 'ipaddr');
                $alive = BaseFilter::SearchKey($record, 'reachable');
                $qty = self::deviceAbbPeerQty($did, 'online');
                $r = array(
                    'id' => $did,
                    'name' => $name,
                    'gps' => array(
                        'lat' => number_format($lat, 6),
                        'lng' => number_format($lng, 6)
                    ),
                    'emode' => $emode,
                    'ipaddr' => $ipaddr,
                    'alive' => (($alive && $alive == 'online') ? true : false),
                    //'reachable' => $alive,
                    'peer_qty' => (is_numeric($qty) ? (int) $qty : 0)
                );
                $reply[] = $r;
            }
            return $reply;
        }
        
        return $reply;
    }

    // reserved wrapper
    // if $filterStatus not given, return all
    static private function deviceListFetchByStatus($filterStatus = null)
    {
        $records = OMCDeviceDAO::DeviceListFetchByStatus($filterStatus);
        return $records;
    }

    // --------- --------- Fetch Device Detail --------- --------- ---------
    static private function deviceIsAlive($deviceQueryId = null)
    {
        if ($deviceQueryId) {
            $deviceNetwork = OMCDeviceDAO::FetchDeviceNetworkDetail($deviceQueryId);
            $flagAlive = BaseFilter::SearchKey($deviceNetwork, 'reachable');
            return ($flagAlive == 'online');
        }
    }
    // answer to Ajax: do=detail&did=<n>&token=<token>
    static public function DeviceDetail($deviceQueryId = null)
    {
        if ($deviceQueryId) {
            // data.device
            $device = array();
            // device: .wmac, .base, .mac, .hw_ver, .fw_ver, .wireless, .network, .thrpt, .msg
            $deviceBasic = self::deviceBasicDetail($deviceQueryId);
            $device['basic'] = $deviceBasic;
            // device.wireless
            $deivce['wireless'] = array();
            // device.wireless.abb: .ssid, .mode
            $device['wireless']['abb'] = self::deviceAbbDetail($deviceQueryId);
            $peers = self::deviceAbbPeers($deviceQueryId);
            $device['wireless']['abb']['peer_qty'] = count($peers);
            $device['wireless']['abb']['peers'] = $peers;
            // device.wireless.radio: .region, .channel, .txpower, .watt, .chanbw
            $device['wireless']['radio'] = self::deviceRadioDetail($deviceQueryId);
            
            // device.network: .ifname, .vlan, .ipaddr, .netmask, .gateway
            $device['network'] = self::deviceNetworkDetail($deviceQueryId);
            // device.thrpt: .qty, .ifname_rxtx
            $device['thrpt'] = self::deviceThrptCalc($deviceQueryId); // TODO: calc based on report
            
            // device.msg_qty
            $device['msg_qty'] = 0;//self::deviceMsgQty($deviceQueryId); // TODO: add msg query
            
            // fre-format
            $reply = array(
                'data' => array(
                    'device' => $device,
                    'ts' => BaseFilter::SearchKey($deviceBasic, 'ts')
                )
            );
            //var_dump($device);
            return $reply;
        }
        return null;
    }

    // reserved wrapper
    // verified since 2018.01.03 12:39
    static private function deviceBasicDetail($deviceQueryId = null)
    {
        $record = OMCDeviceDAO::FetchDeviceBasicDetail($deviceQueryId);
        return $record;
    }
    
    static private function deviceAbbEModeConvert($emode = 'sta')
    {
        $mode =  'ear';
        switch($emode) {
            case 'ap':
                $mode = 'car';
                break;
            case 'sta':
            default:
                $mode = 'ear';
                break;
        }
        return $mode;
    }
    
    // reserved wrapper
    // verified since 2018.01.03 12:39
    static private function deviceAbbDetail($deviceQueryId = null)
    {
        $record = OMCDeviceDAO::FetchDeviceAbbDetail($deviceQueryId);
        $emode = BaseFilter::SearchKey($record, 'emode');
        $mode = self::deviceAbbEModeConvert($emode);
        $record['emode'] = $mode;
        return $record;
    }
    // verified since 2018.01.03 12:25
    static private function deviceAbbPeerQty($deviceQueryId = null)
    {
        $records = 0;
        if (self::deviceIsAlive($deviceQueryId)) {
            $records = OMCDeviceDAO::FetchDevicePeerQty($deviceQueryId, 'connected');
        }
        return $records;
    }
    // verified since 2018.01.03 12:41
    static private function deviceAbbPeers($deviceQueryId = null)
    {
        $records = null;
        if (self::deviceIsAlive($deviceQueryId)) {
            $records = OMCDeviceDAO::FetchDevicePeers($deviceQueryId, 'connected');
        }
        return $records;
    }
    
    // verified since 2018.01.03 12:39
    static private function deviceRadioDetail($deviceQueryId = null)
    {
        $record = OMCDeviceDAO::FetchDeviceRadioDetail($deviceQueryId);
        $txpower = BaseFilter::SearchKey($record, 'txpwr');
        $watt = VendorARN::ConvertTxpwrToWatt($txpower);
        $record['watt'] = $watt;
        return $record;
    }
    
    // verified since 2017.12.04
    // verified since 2018.01.03 12:39
    static private function deviceNetworkDetail($deviceQueryId = null)
    {
        $record = OMCDeviceDAO::FetchDeviceNetworkDetail($deviceQueryId);
        return $record;
    }
    
    // TODO: not verified since 2017.12.04
    static private function deviceThrptCalc($deviceQueryId = null)
    {
        if (self::deviceIsAlive($deviceQueryId)) {
            $record = OMCDeviceDAO::FetchDeviceNetworkBytes($deviceQueryId);
            $ifname = BaseFilter::SearchKey($record, 'ifname');
            $rxbytes = BaseFilter::SearchKey($record, 'rxbytes');
            $txbytes = BaseFilter::SearchKey($record, 'txbytes');
            $elapsed = BaseFilter::SearchKey($record, 'elapsed');
            $ts = BaseFilter::SearchKey($record, 'ts');
            
            if (! $elapsed || $elapsed <= 0) {
                $elapsed = 1;
            }
            
            if ($rxbytes + $txbytes > 0) {
                $rxthrpt = $rxbytes * 8 / $elapsed / 1024 / 1024;
                $txthrpt = $txbytes * 8 / $elapsed / 1024 / 1024;
                $unit = 'Mbps';
            } else {
                $unit = 'Mbps';
                $rxthrpt = 0.0;
                $txthrpt = 0.0;
            }
            
            return array(
                'qty' => 1,
                'rxtx' => array(
                    array(
                        'ifname' => $ifname,
                        'unit' => $unit,
                        'rx' => ($rxthrpt ? rand(0,10)/1000 + number_format($rxthrpt, 3) : 0),
                        'tx' => ($txthrpt ? rand(0,10)/1000 + number_format($txthrpt, 3) : 0)
                    )
                )
            );
        }
    }

    // TODO: search database by wmac or devid
    // TODO: not verified since 2017.12.04
    static public function DeviceMessages($deviceId = null)
    {
        // return $deviceId ? $deviceId : 0;
        return array(
            'data' => array(
                'ds' => self::deviceStatistics()
            )
        );
    }

    // verified since 2018.01.10
    static public function DeviceConfigLoad($deviceQueryId = null)
    {
        if ($deviceQueryId) {
            // data.device
            $device = array();
            // device: .wmac, .base, .mac, .hw_ver, .fw_ver, .wireless, .network, .thrpt, .msg
            $device['basic'] = self::deviceBasicDetail($deviceQueryId);
            // device.wireless
            $deivce['wireless'] = array();
            // device.wireless.abb: .ssid, .mode
            $device['wireless']['abb'] = self::deviceAbbDetail($deviceQueryId);
            // device.wireless.radio: .region, .channel, .txpower, .watt, .chanbw
            $device['wireless']['radio'] = self::deviceRadioDetail($deviceQueryId);
            
            // device.network: .ifname, .vlan, .ipaddr, .netmask, .gateway
            $device['network'] = self::deviceNetworkDetail($deviceQueryId);
            // fre-format
            $reply = array(
                'data' => array(
                    'device' => $device
                )
            );
            //var_dump($device);
            return $reply;
        }
        return null;
    }

    // save to database, then agent will read in queue, one at a time
    // CURRENT: reset_abb, reset_nw, reset_os, mode, channel, txpower
    // FIXME: add more commands
    // verified since 2018.01.25
    static public function DeviceConfigInQueue($deviceQueryId = null, $config = null)
    {
        if ($deviceQueryId && $config && is_array($config)) {
            $reset = array();
            $ops = BaseFilter::SearchKey($config, 'ops');
            switch($ops) {
                case 'reset-wireless':
                    $reset['cmd'] = 'reset_abb';
                    break;
                case 'reset-network':
                    $reset['cmd'] = 'reset_nw';
                    break;
                case 'reset-system':
                    $reset['cmd'] = 'reset_os';
                    break;
                default:
                    break;
            }
            if (key_exists('cmd', $reset)) {
                self::deviceConfigReset($deviceQueryId, $reset);
            }
            unset($reset);
            
            // save data stored in omc server
            $basic = array();
            $name = BaseFilter::SearchKey($config, 'name');
            if ($name && $name != '') {
                $basic['name'] = $name;
            }
            $latlng = BaseFilter::SearchKey($config, 'latlng');
            
            $lat = $lng = null;
            // cannot handle "£¬"
            //list($lat, $lng) = explode(',', $latlng);
            // filter out all numbers < since 2018.01.30
            $pattern = '/[\d+\.]+[\d+\.]+/';
            preg_match_all($pattern, $latlng, $data_filtered);
            if (count($data_filtered) > 0) {
                $latlng_filtered = current($data_filtered);
                if (count($latlng_filtered) > 1) {
                    list($lat, $lng) = $latlng_filtered;
                }
            }
            
            // if both lat & lng valid, save them
            if ($lat && $lng) {
                $basic['latlng'] = "{$lat},{$lng}";
                $basic['lat'] = (float) $lat;
                $basic['lng'] = (float) $lng;
            }
            if ($basic && is_array($basic) && count($basic) > 0) {
                self::deviceConfigSaveBasic($deviceQueryId, $basic);
            }
            unset($basic);
            
            // convert config into command(s), save to _cmd table
            // FIXME: currently, only support mode/channel/txpower
            $abb = array();
            $mode = BaseFilter::SearchKey($config, 'mode');
            if ($mode && $mode != '') {
                $abb['mode'] = $mode;
            }
            if ($abb && is_array($abb) && count($abb) > 0) {
                self::deviceConfigSaveAbb($deviceQueryId, $abb);
            }
            unset($abb);
            
            $radio = array();
            $channel = BaseFilter::SearchKey($config, 'channel');
            $txpower = BaseFilter::SearchKey($config, 'txpower');
            if ($channel && $channel != '') {
                $radio['channel'] = $channel;
            }
            if ($txpower && $txpower != '') {
                $radio['txpower'] = $txpower;
            }
            if ($radio && is_array($radio) && count($radio) > 0) {
                self::deviceConfigSaveRadio($deviceQueryId, $radio);
            }
            
            return OMCError::GetErrorInArray(ERROR_NONE);
        }
        return OMCError::GetErrorInArray(ERROR_BAD_REQUEST_PARAM);
    }
    
    // reset_abb, reset_nw, reset_os
    // since 2018.01.25
    static private function deviceConfigReset($deviceQueryId = null, $reset = null)
    {
        foreach($reset as $key => $val) {
            OMCDeviceDAO::DeviceCommandsSaveByRecordId($deviceQueryId, array($key => $val));
        }
    }
    
    // name, latlng
    // since 2018.01.25
    static private function deviceConfigSaveBasic($deviceQueryId = null, $data = null)
    {
        OMCDeviceDAO::DeviceSaveByRecordId($deviceQueryId, $data);
    }
    
    // mode
    // since 2018.01.25
    static private function deviceConfigSaveAbb($deviceQueryId = null, $data = null)
    {
        foreach($data as $key => $val) {
            OMCDeviceDAO::DeviceCommandsSaveByRecordId($deviceQueryId, array($key => $val));
        }
    }
    
    // channel, txpower
    // since 2018.01.25
    static private function deviceConfigSaveRadio($deviceQueryId = null, $data = null)
    {
        foreach($data as $key => $val) {
            OMCDeviceDAO::DeviceCommandsSaveByRecordId($deviceQueryId, array($key => $val));
        }
    }
}

?>
