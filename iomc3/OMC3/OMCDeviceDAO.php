<?php
// TODO: restore line 271 debug (for Agent3)
// by Qige <qigezhao@gmail.com> since 2017.11.20
// 2017.12.13/2017.12.25
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// by Qige <qigezhao@gmail.com> at 2017.12.21
(! defined('BPATH')) && define('BPATH', dirname(dirname(__FILE__)));

require_once BPATH . '/Common/BaseInterface.php';
require_once BPATH . '/Common/BaseFilter.php';
require_once BPATH . '/OMC3/OMCConfig.php';
require_once BPATH . '/OMC3/OMCBaseDAO.php';

// query via OMCDatabaseConn
// function order: called by WSAgentMngr, WSDeviceMngr
final class OMCDeviceDAO extends OMCBaseDAO
{

    private static $DB_DEVICE_TABLE = 'arn_device';
    private static $DB_DEVICE_CMD_TABLE = 'arn_device_cmd';
    private static $DB_DEVICE_ABB_TABLE = 'arn_device_abb';
    private static $DB_DEVICE_ABB_PEER_TABLE = 'arn_device_abb_peers';
    private static $DB_DEVICE_RADIO_TABLE = 'arn_device_radio';
    private static $DB_DEVICE_NETWORK_TABLE = 'arn_device_nw';

    private static $DB_DEVICE_ABB_HISTORY_TABLE = 'arn_history_abb';
    private static $DB_DEVICE_RADIO_HISTORY_TABLE = 'arn_history_radio';
    private static $DB_DEVICE_NETWORK_HISTORY_TABLE = 'arn_history_nw';

    private static $DB_DEVICE_LIMIT = 50;

    // --------- --------- --------- Common Query --------- --------- ---------
    // 1. verified if record exists;
    // 2. find device abb/radio/nw/peers record id;
    // 3. fetch qty of record(s).
    // verified since 2017.12.25
    // verified at 2017.12.28 15:56
    static public function FindRecordId($rets = null, $rtype = null, $filter = null)
    {
        $deviceQueryId = null;

        // return fields: default only return 'id'
        $fields = $rets ? $rets : array('id');
        if ($filter && is_array($filter)) {
            switch($rtype) {
                case 'abb':
                    $table = self::$DB_DEVICE_ABB_TABLE;
                    break;
                case 'abb_peer':
                    $table = self::$DB_DEVICE_ABB_PEER_TABLE;
                    break;
                case 'radio':
                    $table = self::$DB_DEVICE_RADIO_TABLE;
                    break;
                case 'nw':
                    $table = self::$DB_DEVICE_NETWORK_TABLE;
                    break;
                case 'device':
                default:
                    $table = self::$DB_DEVICE_TABLE;
                    break;
            }
            // find device query id
            $deviceQueryId = self::FetchFieldsOfFirstRecord($table, $fields, $filter);
        }
        return $deviceQueryId;
    }

    // --------- --------- --------- Agent Mngr --------- --------- ---------
    // verified since 2017.11.04
    // 2017.12.21
    // verified at 2017.12.28 15:56
    static public function NewDeviceFound($data = null)
    {
        $table = self::$DB_DEVICE_TABLE;
        $result = self::Insert($table, $data, __FUNCTION__);
    }

    // update device last time stamp by device record id
    // verified since 2017.12.21
    // verified at 2017.12.28 15:56
    static public function DeviceSaveByRecordId($deviceQueryId = null, $data = null)
    {
        $result = null;
        if ($deviceQueryId && is_numeric($deviceQueryId) && $deviceQueryId > 0) {
            $tableDevice = self::$DB_DEVICE_TABLE;
            
            // generate sql
            $kv = array();
            // update record
            foreach ($data as $key => $val) {
                $kv[] = "{$key}='{$val}'";
            }
            $updates = implode(',', $kv);
            $conditions = "id='{$deviceQueryId}'";
            $sql = "update {$tableDevice} set {$updates} where {$conditions}";
            
            // execute & save
            $result = self::QueryBySql($sql, __FUNCTION__);
        }
        return $result;
    }
    
    static public function DeviceCommandsSaveByRecordId($deviceQueryId = null, $data = null)
    {
        if ($deviceQueryId && is_numeric($deviceQueryId) && $deviceQueryId > 0) {
            $tableDevice = self::$DB_DEVICE_CMD_TABLE;
            
            // generate sql
            $k = array(
                'devid',
                'ttl',
                'done'
            ); 
            $v = array(
                "'{$deviceQueryId}'",
                '3',
                "'new'"
            );
            
            $k[] = 'cmd';
            // update record
            foreach ($data as $key => $val) {
                $v[] = "'{$key}={$val}'";
            }
            $fields = implode(',', $k);
            $values = implode(',', $v);
            $sql = "insert into {$tableDevice}({$fields}) values({$values})";
            
            // execute & save
            $result = self::QueryBySql($sql, __FUNCTION__);
        }
        return $result;
    }

    // verified since 2017.12.25
    // verified at 2017.12.28 15:57
    static public function DeviceStatusSaveByRecordId($deviceQueryId = null, $ntype = null, $data = null, $flagInsertIfNoRecordFound = true)
    {
        if ($deviceQueryId) {
            // set all peers to "unreachable"
            $flagUpdateAll = false;
            
            $deviceStatusQueryId = null;
            
            $rtable = null;
            $rfields = array('id');
            $rfilter = array(
                'devid' => $deviceQueryId
            );
            // where to save
            switch ($ntype) {
                case 'abb':
                    $rtable = self::$DB_DEVICE_ABB_TABLE;
                    break;
                case 'abb_peers':
                    // set all peers to "unreachable"
                    if (key_exists('realtime', $data) && $data['realtime'] == 'unreachable') {
                        $flagUpdateAll = true;
                    } else {
                        $flagUpdateAll = false;
                        $data['realtime'] = 'connected';
                    }
                    $pwmac = BaseFilter::SearchKey($data, 'pwmac');
                    if ($pwmac) {
                        $rfilter['pwmac'] = $pwmac;
                    }
                    $rtable = self::$DB_DEVICE_ABB_PEER_TABLE;
                    break;
                case 'radio':
                    $rtable = self::$DB_DEVICE_RADIO_TABLE;
                    break;
                case 'nw':
                default:
                    // insert record
                    if (! key_exists('reachable', $data)) {
                        $data['reachable'] = 'online';
                    }
                    $rtable = self::$DB_DEVICE_NETWORK_TABLE;
                    break;
            }
            
            // record id, or doesn't exist
            if ($deviceQueryId && is_numeric($deviceQueryId) && $deviceQueryId > 0) {
                $deviceStatusQueryId = self::FetchFieldsOfFirstRecord($rtable, $rfields, $rfilter);
            }
            
            // $flagInsertIfNoRecordFound: update [or insert]
            $kv = array();
            $sql = null;
            if ($deviceStatusQueryId && $deviceStatusQueryId > 0) {
                if (! $flagUpdateAll) {
                    //add "online" peer
                    $rfilter = array(
                        'id' => $deviceStatusQueryId
                    );
                }
                $result = self::Update($rtable, $data, $rfilter, __FUNCTION__);
            } elseif ($flagInsertIfNoRecordFound) {
                $data['devid'] = $deviceQueryId;
                $result = self::Insert($rtable, $data, __FUNCTION__);
            }
        }
    }

    // insert into abb/radio/network history
    // - prevent two or more agents running as daemon
    // - verified since 2017.12.25
    // verified at 2017.12.28 15:57
    static public function DeviceStatusHistorySaveByRecordId($deviceQueryId = null, $table = null, $data = null)
    {
        $tableHistory = null;
        switch ($table) {
            case 'abb':
                $tableHistory = self::$DB_DEVICE_ABB_HISTORY_TABLE;
                break;
            case 'radio':
                $tableHistory = self::$DB_DEVICE_RADIO_HISTORY_TABLE;
                break;
            case 'nw':
            default:
                $tableHistory = self::$DB_DEVICE_NETWORK_HISTORY_TABLE;
                break;
        }
        
        if ($deviceQueryId && is_numeric($deviceQueryId) && $deviceQueryId > 0) {
            
            $k = array(
                'devid'
            );
            $v = array(
                $deviceQueryId
            );
            foreach ($data as $key => $val) {
                $k[] = "{$key}";
                $v[] = "'{$val}'";
            }
            $fields = implode(',', $k);
            $values = implode(',', $v);
            $sql = "insert into {$tableHistory}({$fields}) values({$values})";
            
            $result = self::QueryBySql($sql, __FUNCTION__);
        }
    }

    // --------- --------- Agent Cmds from Admin --------- --------- ---------
    // verified since 2018.01.30
    static public function CmdsToExecute($deviceQueryId = null)
    {
        if ($deviceQueryId) {
            $tableDeviceCmd = self::$DB_DEVICE_CMD_TABLE;
            $rfields = array(
                'id',
                'ttl',
                'cmd',
                'ts'
            );
            $rfilters = array(
                'devid' => $deviceQueryId,
                'done' => 'new'
            );
            $orderby = 'id asc';
            
            $records = self::FetchFirstRecord($tableDeviceCmd, $rfields, $rfilters, $orderby);
            $cmds = BaseFilter::SearchKey($records, 'cmd');
            
            // update "ttl" of $cmds
            if ($cmds) {
                $cid = BaseFilter::SearchKey($records, 'id');
                $ttl = BaseFilter::SearchKey($records, 'ttl');
                self::expireCmdsForAgent($cid, $ttl);
            }
            
            return $cmds;
        }
        return null;
    }
    
    // verified since 2018.01.30
    static private function expireCmdsForAgent($cid = null, $ttl = 0)
    {
        if ($cid) {
            $rtable = self::$DB_DEVICE_CMD_TABLE;
            $ttl_left = ($ttl > 0 ? $ttl - 1 : 0);
            $data = array(
                'ttl' => $ttl_left, // FIXME: help debug agent3
                'done' => ($ttl_left > 0 ? 'new' : 'done')
            );
            $rfilter = array(
                'id' => $cid
            );
            
            $result = self::Update($rtable, $data, $rfilter, __FUNCTION__);
        }
    }

    // --------- --------- --------- Device List --------- --------- ---------
    // verified since 2017.12.28 16:30
    static private function fetchDeviceListByFilter($rfields = null, $rfilters = null, $rsearch = null)
    {
        $tableDevice = self::$DB_DEVICE_TABLE;
        $tableAbb = self::$DB_DEVICE_ABB_TABLE;
        $tableNetwork = self::$DB_DEVICE_NETWORK_TABLE;
        $tables = array(
            "{$tableDevice} as dev",
            "{$tableNetwork} as nw",
            "{$tableAbb} as abb"
        );
        $joins = array(
            'dev.id=nw.devid',
            'dev.id=abb.devid'
        );
        return self::FetchInMultiTables($tables, $rfields, $joins, $rfilters, $rsearch);
    }
    
    static private function fetchDeviceListWithLatLngByFilter($rfields = null, $rfilters = null, $rsearch = null)
    {
        $tableDevice = self::$DB_DEVICE_TABLE;
        $tableAbb = self::$DB_DEVICE_ABB_TABLE;
        $tableNetwork = self::$DB_DEVICE_NETWORK_TABLE;
        $tables = array(
            "{$tableDevice} as dev",
            "{$tableNetwork} as nw",
            "{$tableAbb} as abb"
        );
        $joins = array(
            'dev.id=nw.devid',
            '(dev.latlng is not NULL or dev.latlng != NULL)',
            'dev.id=abb.devid'
            //'dev.lng!=0.00'
        );
        return self::FetchInMultiTables($tables, $rfields, $joins, $rfilters, $rsearch);
    }
    
    // verified since 2017.12.25
    // verified since 2017.12.28 16:08
    static public function DeviceStatistics()
    {
        $rfields = array(
            'count(dev.id) as qty'
        );
        // total, online, offline
        $rfilters = array();
        $qty = self::fetchDeviceListByFilter($rfields, $rfilters);
        $total = BaseFilter::SearchKey($qty, 'qty');
        
        $rfilters['nw.reachable'] = 'online';
        $qty = self::fetchDeviceListByFilter($rfields, $rfilters);
        $online = BaseFilter::SearchKey($qty, 'qty');
        
        $rfilters['nw.reachable'] = 'offline';
        $qty = self::fetchDeviceListByFilter($rfields, $rfilters);
        $offline = BaseFilter::SearchKey($qty, 'qty');
        return array(
            'total' => $total ? $total : 0,
            'online' => $online ? $online : 0,
            'offline' => $offline ? $offline : 0
        );
    }
    
    // verified since 2017.12.28 17:25
    static public function DeviceListFetchByStatus($filterStatus = null, $flag = false)
    {
        $rfields = array(
            'dev.id',
            'dev.name',
            'dev.latlng',
            'dev.lat',
            'dev.lng',
            'nw.ipaddr',
            'nw.reachable',
            'abb.emode'
        );
        $rfilters = array();
        switch ($filterStatus) {
            case 'offline':
                $rfilters['nw.reachable'] = 'offline';
                break;
            case 'online':
                $rfilters['nw.reachable'] = 'online';
                break;
            default:
                break;
        }
        
        if ($flag) {
            return self::fetchDeviceListWithLatLngByFilter($rfields, $rfilters);
        } else {
            return self::fetchDeviceListByFilter($rfields, $rfilters);
        }
    }
    
    // fetch device list, support device id or keyword search
    // verified since 2017.12.28 17:25
    static public function DeviceListSearchById($deviceQueryId = null, $flag = false)
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $rfields = array(
                    'dev.id',
                    'dev.name',
                    //'dev.latlng',
                    'dev.lat',
                    'dev.lng',
                    'nw.ipaddr',
                    'nw.reachable',
                    'abb.emode'
                );
                $rfilters = array(
                    'dev.id' => $deviceQueryIdSafe
                );
                
                if ($flag) {
                    return self::fetchDeviceListWithLatLngByFilter($rfields, $rfilters);
                } else {
                    return self::fetchDeviceListByFilter($rfields, $rfilters);
                }
            }
        }
        return null;
    }

    // verified since 2017.11.04
    // verified since 2017.12.28 17:25
    static public function DeviceListSearchByKeyword($keyword = null, $flag = false)
    {
        if ($keyword) {
            $safeKw = BaseFilter::FilterAll($keyword);
            $safeQid = (int) $safeKw;
            if ($safeQid > 0) {
                return self::DeviceListSearchById($safeQid, $flag);
            } else if ($safeKw) {
                $rfields = array(
                    'dev.id',
                    //'dev.latlng',
                    'dev.lat',
                    'dev.lng',
                    'dev.name',
                    'nw.ipaddr',
                    'nw.reachable',
                    'abb.emode'
                );
                $rsearch = array(
                    'dev.name' => "%{$safeKw}%",
                    'nw.ipaddr' => "%{$safeKw}%"
                );
                if ($flag) {
                    return self::fetchDeviceListWithLatLngByFilter($rfields, null, $rsearch);
                } else {
                    return self::fetchDeviceListByFilter($rfields, null, $rsearch);
                }
            }
        }
        
        return null;
    }


    // --------- --------- --------- Device Details --------- --------- ---------
    // verified since 2017.11.04
    // verified since 2018.01.03 12:36
    static public function FetchDeviceBasicDetail($deviceQueryId = null)
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_TABLE;
                $rfields = array(
                    'wmac',
                    'mac',
                    'name',
                    'latlng',
                    'fw_ver',
                    'hw_ver',
                    'ts'
                );
                $rfilters = array(
                    'id' => $deviceQueryIdSafe
                );
                $record = self::FetchFirstRecord($table, $rfields, $rfilters);
                return $record;
            }
        }
        return null;
    }
    // verified since 2018.01.03 12:36
    static public function FetchDeviceAbbDetail($deviceQueryId = null)
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_ABB_TABLE;
                $rfields = array(
                    'ssid',
                    'bssid',
                    'noise',
                    'chanbw',
                    'emode'
                );
                $rfilters = array(
                    'devid' => $deviceQueryIdSafe
                );
                $record = self::FetchFirstRecord($table, $rfields, $rfilters);
                return $record;
            }
        }
        return null;
    }
    
    // wrapper for WSDeviceMngr: search device that match conditions
    // verified since 2017.12.28 18:25
    static public function FetchDevicePeerQty($deviceQueryId = null, $ptype = 'connected')
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_ABB_PEER_TABLE;
                $rfields = array(
                    'count(id) as qty'
                );
                $rfilter = array(
                    'devid' => $deviceQueryId,
                    'realtime' => $ptype
                );
                $record = self::FetchFieldsOfFirstRecord($table, $rfields, $rfilter); // 2017.12.28 15:29
                return $record;
            }
        }
        return 0;
    }
    
    // verified since 2018.01.03 12:30
    static public function FetchDevicePeers($deviceQueryId = null, $ptype = 'connected')
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_ABB_PEER_TABLE;
                $rfields = array(
                    'pwmac',
                    'pipaddr',
                    'psignal',
                    'prx',
                    'ptx'
                );
                $rfilters = array(
                    'devid' => $deviceQueryId,
                    'realtime' => $ptype
                );
                $records = self::Fetch($table, $rfields, $rfilters);
                if ($records && is_array($records)) {
                    return $records;
                }
            }
        }
        return null;
    }
    
    // verified since 2018.01.03 12:36
    static public function FetchDeviceRadioDetail($deviceQueryId = null)
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_RADIO_TABLE;
                $rfields = array(
                    'region',
                    'channel',
                    'freq',
                    'chanbw',
                    'txpwr',
                    'rxgain'
                );
                $rfilters = array(
                    'devid' => $deviceQueryIdSafe
                );
                $record = self::FetchFirstRecord($table, $rfields, $rfilters);
                return $record;
            }
        }
        return null;
    }
    
    // verified since 2017.11.04
    // verified since 2018.01.03 12:37
    static public function FetchDeviceNetworkDetail($deviceQueryId = null)
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $tables = self::$DB_DEVICE_NETWORK_TABLE;
                $fields = array(
                    'reachable',
                    'ipaddr',
                    'netmask',
                    'gateway',
                    'ifname',
                    'vlan'
                );
                $rfilters = array(
                    'devid' => $deviceQueryIdSafe
                );
                $record = self::FetchFirstRecord($tables, $fields, $rfilters);
                if ($record && is_array($record)) {
                    return $record;
                }
            }
        }
        return null;
    }
    
    // device MUST *ONLINE
    static public function FetchDeviceNetworkBytes($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $tables = self::$DB_DEVICE_NETWORK_HISTORY_TABLE;
                $fields = array(
                    'ifname',
                    'rxbytes',
                    'txbytes',
                    'elapsed',
                    'ts'
                );
                $rfilters = array(
                    'devid' => $deviceQueryIdSafe
                );
                $record = self::FetchFirstRecord($tables, $fields, $rfilters);
                if ($record && is_array($record)) {
                    return $record;
                }
            }
        }
        return null;
    }
    
    // get last audit time stamp
    // since 2018.02.05
    static public function GetLastDeviceTs($ntype = 'audit', $deviceQueryId = null)
    {
        switch($ntype) {
            case 'syncts':
                $table = self::$DB_DEVICE_TABLE;
                $rfields = array(
                    'id',
                    'ts'
                );
                $rfilter = array(
                    'id' => (int) $deviceQueryId
                );
                $orderby = null;
                break;
            case 'auditts':
                $table = self::$DB_DEVICE_TABLE;
                $rfields = array(
                    'id',
                    'auditat'
                );
                $rfilter = array(
                    'id' => (int) $deviceQueryId
                );
                $orderby = null;
                break;
            case 'lock': // judge if audit just ran be other thread
            default:
                $table = self::$DB_DEVICE_TABLE;
                $rfields = array(
                    'id',
                    'auditat'
                );
                $rfilter = null;
                $orderby = 'auditat desc';
                break;
        }
        
        $record = self::FetchFirstRecord($table, $rfields, $rfilter, $orderby);
        return $record;
    }
    
}

?>
