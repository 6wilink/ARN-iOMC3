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
                'ds' => self::DeviceStatistics(),
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
                $qty = OMCDeviceDAO::FetchDevicePeerQty($did);
                $r = array(
                    'id' => $did,
                    'name' => $name,
                    'ipaddr' => $ipaddr,
                    'peer_qty' => (is_array($qty) ? current($qty) : 0)
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
        $reply = OMCDeviceDAO::DeviceListFetchByStatus($filterStatus);
        return $reply;
    }

    // --------- --------- Fetch Device Detail --------- --------- ---------
    
    // TODO: fetch device thrpt, msg
    // including basic information, wireless, network, peers, thrpt
    static public function DeviceDetail($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $device = self::deviceBasicDetail($deviceQueryId);
            $device['network'] = self::deviceNetworkDetail($deviceQueryId);
            $device['wireless'] = self::deviceWirelessDetail($deviceQueryId);
            $device['thrpt'] = self::deviceThrptCalc($deviceQueryId);
            $device['msg_qty'] = self::deviceMsgQty($deviceQueryId);
            
            // fre-format
            $reply = array(
                'data' => array(
                    'device' => $device
                )
            );
            return $reply;
        }
        return NULL;
    }

    // verified since 2017.12.04
    static private function deviceBasicDetail($deviceQueryId = NULL)
    {
        return OMCDeviceDAO::FetchDeviceBasicDetail($deviceQueryId);
    }

    // verified since 2017.12.04
    static private function deviceNetworkDetail($deviceQueryId = NULL)
    {
        return OMCDeviceDAO::FetchDeviceNetworkDetail($deviceQueryId);
    }
    
    // TODO: not verified since 2017.12.04
    static private function deviceWirelessDetail($deviceQueryId = NULL)
    {
        return array(
            'peers' => NULL, //self::deviceWirelessPeers($deviceQueryId),
            'peer_qty' => OMCDeviceDAO::FetchDevicePeerQty($deviceQueryId)
        );
    }

    // TODO: not verified since 2017.12.04
    static private function deviceWirelessPeers($deviceQueryId = NULL)
    {
        return OMCDeviceDAO::FetchDevicePeers($deviceQueryId, 'online');
    }

    // TODO: not verified since 2017.12.04
    static private function deviceWirelessPeerQty($deviceQueryId = NULL)
    {
        return OMCDeviceDAO::FetchDevicePeerQty($deviceQueryId, 'online');
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

    // TODO: not verified since 2017.12.04
    static private function DeviceStatistics()
    {
        $reply = OMCDeviceDAO::DeviceStatistics();
        return $reply;
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
