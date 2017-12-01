<?php
// by Qige <qigezhao@gmail.com> at 2017.11.29

'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// 
final class WSDeviceMngr
{
    static public function DeviceSearch($keyword = NULL, $deviceQueryId = NULL)
    {
        // handle search by id or keyword
        if ($deviceQueryId) {
            $devices = self::DeviceListSearchById($deviceQueryId);
        } else if ($keyword) {
            $devices = self::DeviceListSearchByKeyword($keyword);
        } else {
            $devices = self::DeviceListFetchAll();
        }
        
        $reply = array(
            'data' => array(
                'ds' => self::DeviceStatistics(),
                'qty' => count($devices),
                'devices' => $devices
            )
        );
        return $reply;
    }
    
    // reserved wrapper
    static private function DeviceListSearchById($deviceQueryId = NULL)
    {
        $reply = OMCDeviceDAO::DeviceListSearchById($deviceQueryId);
        return $reply;
    }
    
    static private function DeviceListSearchByKeyword($keyword = NULL)
    {
        $reply = NULL;
        switch($keyword) {
            case ':all':
                $reply = OMCDeviceDAO::DeviceListFetchAll();
                break;
            case ':online':
                $reply = OMCDeviceDAO::DeviceListFetchAll('online');
                break;
            case ':offline':
                $reply = OMCDeviceDAO::DeviceListFetchAll('offline');
                break;
            default:
                $reply = OMCDeviceDAO::DeviceListSearchByKeyword($keyword);
                break;
        }
        return $reply;
    }
    
    static private function DeviceListFetchAll($filterStatus = NULL)
    {
        $reply = OMCDeviceDAO::DeviceListFetchAll($filterStatus);
        return $reply;
    }
        
    static public function DeviceDetail($deviceQueryId = NULL)
    {
        $devid = (int) $deviceQueryId + 10;
        if ($deviceQueryId) {
            $reply = array();
            $device = array(
                'device' => array(
                    'wmac' => '00:00:00:00:00:00',
                    'name' => '山西现网#1',
                    'hwver' => 'gws5kv2',
                    'fwver' => 'v1.0.7',
                    'wireless' => array(
                        'mode' => 2,
                        'rgn' => 1,
                        'channel' => 43,
                        'freq' => 650,
                        'txpower' => 17,
                        'watt' => 0.05,
                        'chanbw' => 8
                    ),
                    'peer_qty' => self::devicePeerQty(1),
                    'peers' => NULL,
                    'network' => array(
                        'ip' => "192.168.1.{$devid}",
                        'netmask' => '255.255.255.0'
                    ),
                    'thrpt' => array(
                        'qty' => 1,
                        'ifname_rxtx' => array(
                            array(
                                'name' => 'eth0',
                                'unit' => 'Mbps',
                                'rx' => 1.386, 
                                'tx' => 0.011
                            )
                        )
                    )
                )
            );
            $reply['data'] = $device;
            return $reply;
        }
        return NULL;
    }
    
    static private function devicePeerQty($deviceQueryId = NULL)
    {
        return OMCDeviceDAO::FetchDevicePeerQty($deviceQueryId);
    }
    
    static private function DeviceStatistics()
    {
        $total = self::DeviceListSearchByKeyword(':all');
        $online = self::DeviceListSearchByKeyword(':online');
        $offline = self::DeviceListSearchByKeyword(':offline');
        $reply = array(
            'total' => count($total),
            'online' => count($online),
            'offline' => count($offline)
        );
        return $reply;
    }
    
    // TODO: search database by wmac or devid
    static public function DeviceMsgs($deviceId = NULL)
    {
        //return $deviceId ? $deviceId : 0;
        return 0;
    }
    
    // TODO: load by model
    static public function DeviceConfigLoad($deviceQueryId = NULL)
    {
        ;
    }
    
    
    // TODO: save to database, then agent will read in queue, one at a time
    static public function DeviceConfigInQueue($deviceQueryId = NULL)
    {
        ;
    }
}

?>
