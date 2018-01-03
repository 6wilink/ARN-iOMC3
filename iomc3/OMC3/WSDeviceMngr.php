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

    // TODO: audit device offline by last update ts
    static public function AuditAll()
    {
        // audit device offline
        /*$devices = self::DeviceListFetchAll();
        foreach ($devices as $device) {
            // TODO: audit last ts, generate msg;
        }*/
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
    static public function DeviceSearch($keyword = NULL, $deviceQueryId = NULL)
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

    // reserved wrapper
    static private function deviceListSearchById($deviceQueryId = NULL)
    {
        $reply = OMCDeviceDAO::DeviceListSearchById($deviceQueryId);
        return $reply;
    }

    // support search pattens
    // verified since 2017.12.28 16:06
    static private function deviceListSearchByKeyword($keyword = NULL)
    {
        $reply = NULL;
        $records = NULL;
        switch ($keyword) {
            case ':all':
                $records = OMCDeviceDAO::deviceListFetchByStatus(); // 2017.12.28 15:26
                break;
            case ':online':
                $records = OMCDeviceDAO::deviceListFetchByStatus('online');
                break;
            case ':offline':
                $records = OMCDeviceDAO::deviceListFetchByStatus('offline');
                break;
            default:
                $records = OMCDeviceDAO::DeviceListSearchByKeyword($keyword);
                break;
        }
        
        if ($records && is_array($records)) {
            $reply = array();
            foreach ($records as $record) {
                $did = BaseFilter::SearchKey($record, 'id');
                $name = BaseFilter::SearchKey($record, 'name');
                $ipaddr = BaseFilter::SearchKey($record, 'ipaddr');
                $qty = self::deviceAbbPeerQty($did, 'online');
                $r = array(
                    'id' => $did,
                    'name' => $name,
                    'ipaddr' => $ipaddr,
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
    static private function deviceListFetchByStatus($filterStatus = NULL)
    {
        $records = OMCDeviceDAO::DeviceListFetchByStatus($filterStatus);
        return $records;
    }

    // --------- --------- Fetch Device Detail --------- --------- ---------
    // answer to Ajax: do=detail&did=<n>&token=<token>
    static public function DeviceDetail($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            // data.device
            $device = array();
            // device: .wmac, .base, .mac, .hw_ver, .fw_ver, .wireless, .network, .thrpt, .msg
            $device['basic'] = self::deviceBasicDetail($deviceQueryId);
            // device.wireless
            $deivce['wireless'] = array();
            // device.wireless.abb: .ssid, .mode
            $device['abb'] = self::deviceAbbDetail($deviceQueryId);
            $peers = self::deviceAbbPeers($deviceQueryId);
            $device['abb']['peer_qty'] = count($peers);
            $device['abb']['peers'] = $peers;
            // device.wireless.radio: .region, .channel, .txpower, .watt, .chanbw
            $device['radio'] = self::deviceRadioDetail($deviceQueryId);
            
            // device.network: .ifname, .vlan, .ipaddr, .netmask, .gateway
            $device['network'] = self::deviceNetworkDetail($deviceQueryId);
            // device.thrpt: .qty, .ifname_rxtx
            $device['thrpt'] = self::deviceThrptCalc($deviceQueryId); // TODO: calc based on report
            
            // device.msg_qty
            $device['msg_qty'] = self::deviceMsgQty($deviceQueryId); // TODO: add msg query
            
            // fre-format
            $reply = array(
                'data' => array(
                    'device' => $device
                )
            );
            //var_dump($device);
            return $reply;
        }
        return NULL;
    }

    // reserved wrapper
    // verified since 2018.01.03 12:39
    static private function deviceBasicDetail($deviceQueryId = NULL)
    {
        $record = OMCDeviceDAO::FetchDeviceBasicDetail($deviceQueryId);
        return $record;
    }
    
    // reserved wrapper
    // verified since 2018.01.03 12:39
    static private function deviceAbbDetail($deviceQueryId = NULL)
    {
        $record = OMCDeviceDAO::FetchDeviceAbbDetail($deviceQueryId);
        return $record;
    }
    // verified since 2018.01.03 12:25
    static private function deviceAbbPeerQty($deviceQueryId = NULL)
    {
        $records = OMCDeviceDAO::FetchDevicePeerQty($deviceQueryId, 'online');
        return $records;
    }
    // verified since 2018.01.03 12:41
    static private function deviceAbbPeers($deviceQueryId = NULL)
    {
        $records = OMCDeviceDAO::FetchDevicePeers($deviceQueryId, 'online');
        return $records;
    }
    
    // verified since 2018.01.03 12:39
    static private function deviceRadioDetail($deviceQueryId = NULL)
    {
        $record = OMCDeviceDAO::FetchDeviceRadioDetail($deviceQueryId);
        return $record;
    }
    
    // verified since 2017.12.04
    // verified since 2018.01.03 12:39
    static private function deviceNetworkDetail($deviceQueryId = NULL)
    {
        $record = OMCDeviceDAO::FetchDeviceNetworkDetail($deviceQueryId);
        return $record;
    }
    
    // TODO: not verified since 2017.12.04
    static private function deviceThrptCalc($deviceQueryId = NULL)
    {
        return array(
            'qty' => 1,
            'rxtx' => array(
                array(
                    'ifname' => 'eth0',
                    'unit' => 'Mbps',
                    'rx' => 1.386,
                    'tx' => 0.011 + rand(0, 10)
                )
            )
        );
    }

    // TODO: search database by wmac or devid
    // TODO: not verified since 2017.12.04
    static private function deviceMsgQty($deviceId = NULL)
    {
        // return $deviceId ? $deviceId : 0;
        return 0;
    }

    // TODO: load by model
    // TODO: not verified since 2017.12.04
    static public function DeviceConfigLoad($deviceQueryId = NULL)
    {
        ;
    }

    // TODO: save to database, then agent will read in queue, one at a time
    // TODO: not verified since 2017.12.04
    static public function DeviceConfigInQueue($deviceQueryId = NULL)
    {
        ;
    }
}

?>
