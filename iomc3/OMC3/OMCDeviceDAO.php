<?php
// by Qige <qigezhao@gmail.com> since 2017.11.20/2017.12.13/2017.12.25
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
    // verified since 2017.12.25
    // 1. verified if record exists;
    // 2. find device abb/radio/nw/peers record id;
    // 3. fetch qty of record(s).
    static public function FindRecordId($rets = NULL, $rtype = NULL, $filter = NULL)
    {
        $deviceQueryId = NULL;

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
    // verified since 2017.11.04|2017.12.21
    static public function NewDeviceFound($data = NULL)
    {
        $table = self::$DB_DEVICE_TABLE;
        $result = self::Insert($table, $data, __FUNCTION__);
    }

    // update device last time stamp by device record id
    // verified since 2017.12.21
    static public function DeviceSaveByRecordId($deviceQueryId = NULL, $data = NULL)
    {
        $result = NULL;
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

    // verified since 2017.12.25
    static public function DeviceStatusSaveByRecordId($deviceQueryId = NULL, $ntype = NULL, $data = NULL, $flagInsertIfNoRecordFound = true)
    {
        if ($deviceQueryId) {
            $deviceStatusQueryId = NULL;
            
            $rtable = NULL;
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
                    $rfilter['pwmac'] = BaseFilter::SearchKey('pwmac');
                    $rtable = self::$DB_DEVICE_ABB_PEER_TABLE;
                    break;
                case 'radio':
                    $rtable = self::$DB_DEVICE_RADIO_TABLE;
                    break;
                case 'nw':
                default:
                    // insert record
                    $data['reachable'] = 'online';
                    $rtable = self::$DB_DEVICE_NETWORK_TABLE;
                    break;
            }
            
            // record id, or doesn't exist
            if ($deviceQueryId && is_numeric($deviceQueryId) && $deviceQueryId > 0) {
                $deviceStatusQueryId = self::FetchFieldsOfFirstRecord($rtable, $rfields, $rfilter);
            }
            
            // $flagInsertIfNoRecordFound: update [or insert]
            $kv = array();
            $sql = NULL;
            if ($deviceStatusQueryId && $deviceStatusQueryId > 0) {
                $data['reachable'] = 'online';
                $rfilter = array(
                    'id' => $deviceStatusQueryId
                );
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
    static public function DeviceStatusHistorySaveByRecordId($deviceQueryId = NULL, $table = NULL, $data = NULL)
    {
        $tableHistory = NULL;
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
    // TODO: not verified since 2017.11.04
    // TODO: not verified since 2017.12.13
    static public function CmdsToExecute($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $tableDeviceCmd = self::$DB_DEVICE_CMD_TABLE;
            $qty = self::$DB_DEVICE_LIMIT;
            $limits = "limit {$qty}";
            $sql = "select cmd.cmd,cmd.ts from {$tableDeviceCmd} where devid='{$deviceQueryId}' {$limits}";
            $records = self::FetchArrayBySql($sql, __FUNCTION__);
            $cmds = BaseFilter::SearchKey($records, 'cmd');
            return $cmds;
        }
        return NULL;
    }

    // --------- --------- --------- Device List --------- --------- ---------
    // verified since 2017.12.25
    static public function DeviceStatistics()
    {
        $tables = array(
            'arn_device as dev',
            'arn_device_nw as nw'
        );
        $rfields = array(
            'count(dev.id) as qty'
        );
        $joins = array(
            'dev.id=nw.devid'
        );
        
        // total, online, offline
        $rfilters = array();
        $qty = self::FetchInMultiTables($tables, $rfields, $joins, $rfilters);
        $total = BaseFilter::SearchKey($qty, 'qty');
        
        $rfilters['reachable'] = 'online';
        $qty = self::FetchInMultiTables($tables, $rfields, $joins, $rfilters);
        $online = BaseFilter::SearchKey($qty, 'qty');
        
        $rfilters['reachable'] = 'offline';
        $qty = self::FetchInMultiTables($tables, $rfields, $joins, $rfilters);
        $offline = BaseFilter::SearchKey($qty, 'qty');
        return array(
            'total' => $total ? $total : 0,
            'online' => $online ? $online : 0,
            'offline' => $offline ? offline : 0
        );
    }
    
    // fetch device list, support device id or keyword search
    // TODO: not verified since 2017.11.04
    // TODO: not verified since 2017.12.13
    static public function DeviceListSearchById($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $table1 = self::$DB_DEVICE_TABLE;
            $table2 = self::$DB_DEVICE_NETWORK_TABLE;
            
            $tables = "{$table1} as dev, {$table2} as nw";
            $fields = 'dev.id,dev.name,nw.ipaddr';
            
            $orderby = ' order by dev.id desc';
            
            $qty = self::$DB_DEVICE_LIMIT;
            $limits = "limit {$qty}";
            $conditions = "where dev.id=nw.devid and dev.id='{$deviceQueryId}'";
            $sql = "select {$fields} from {$tables} {$conditions} {$orderby} {$limits}";
            return self::FetchArrayBySql($sql);
        }
        return NULL;
    }

    // verified since 2017.11.04
    // TODO: not verified since 2017.12.13
    static public function DeviceListSearchByKeyword($keyword = NULL)
    {
        if ($keyword) {
            $safeKw = BaseFilter::FilterAll($keyword);
            $safeQid = (int) $safeKw;
            if ($safeQid > 0) {
                return self::DeviceListSearchById($safeQid);
            } else if ($safeKw) {
                $table1 = self::$DB_DEVICE_TABLE;
                $table2 = self::$DB_DEVICE_NETWORK_TABLE;
                
                $tables = "{$table1} as dev, {$table2} as nw";
                $fields = 'dev.id,dev.name,nw.ipaddr';
                
                $orderby = ' order by dev.id desc';
                
                $qty = self::$DB_DEVICE_LIMIT;
                $limits = "limit {$qty}";
                $conditions = "where dev.id=nw.devid and (dev.name like '%{$safeKw}%' or nw.ipaddr like '%{$safeKw}%')";
                $sql = "select {$fields} from {$tables} {$conditions} {$orderby} {$limits}";
                return self::FetchArrayBySql($sql);
            }
        }
        
        return self::DeviceListFetchAll();
    }

    // TODO: not verified since 2017.11.04
    // TODO: not verified since 2017.12.13
    static public function DeviceListFetchByStatus($filterStatus = NULL)
    {
        $table1 = self::$DB_DEVICE_TABLE;
        $table2 = self::$DB_DEVICE_NETWORK_TABLE;
        
        $tables = "{$table1} as dev, {$table2} as nw";
        $fields = 'dev.id,dev.name,nw.ipaddr';
        
        $orderby = ' order by dev.id desc';
        
        $qty = self::$DB_DEVICE_LIMIT;
        $limits = "limit {$qty}";
        switch ($filterStatus) {
            case 'offline':
                $conditions = "where dev.id=nw.devid and nw.reachable='offline'";
                break;
            case 'online':
                $conditions = "where dev.id=nw.devid and nw.reachable='online'";
                break;
            case 'all':
            default:
                $conditions = "where dev.id=nw.devid";
                break;
        }
        $sql = "select {$fields} from {$tables} {$conditions} {$orderby} {$limits}";
        return self::FetchArrayBySql($sql);
    }

    // --------- --------- --------- Device Details --------- --------- ---------
    // verified since 2017.11.04
    // TODO: not verified since 2017.12.13
    static public function FetchDeviceBasicDetail($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $table1 = self::$DB_DEVICE_TABLE;
            $table2 = self::$DB_DEVICE_NETWORK_TABLE;
            
            $tables = "{$table1} as dev, {$table2} as nw";
            $fields = 'dev.wmac,dev.name,dev.fw_ver,dev.hw_ver,nw.ipaddr,nw.netmask';
            $conditions = "dev.id=nw.devid and dev.id='{$deviceQueryId}'";
            $sql = "select {$fields} from {$tables} where {$conditions}";
            $records = self::FetchArrayBySql($sql, __FUNCTION__);
            if ($records && is_array($records)) {
                return current($records); // = $records[0]
            }
        }
        return NULL;
    }

    // verified since 2017.11.04
    // TODO: not verified since 2017.12.13
    static public function FetchDeviceNetworkDetail($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $tables = self::$DB_DEVICE_NETWORK_TABLE;
            $fields = 'ipaddr,netmask,gw,ifname,vlan';
            $conditions = "devid='{$deviceQueryId}'";
            $sql = "select {$fields} from {$tables} where {$conditions}";
            $records = self::FetchArrayBySql($sql, __FUNCTION__);
            if ($records && is_array($records)) {
                return current($records); // = $records[0]
            }
        }
        return NULL;
    }

    // wrapper for WSDeviceMngr: search device that match conditions
    // TODO: not verified since 2017.11.04
    // TODO: not verified since 2017.12.13
    static public function FetchDevicePeerQty($deviceQueryId = NULL, $ptype = 'online')
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_ABB_PEER_TABLE;
                $fields = 'count(id) as qty';
                $conditions = "devid='{$deviceQueryId}'";
                $sql = "select {$fields} from {$table} where {$conditions}";
                $records = self::FetchArrayBySql($sql, __FUNCTION__);
                if ($records && is_array($records)) {
                    return current($records); // = $records[0]
                }
            }
        }
        return 0;
    }

    // TODO: not verified since 2017.11.04
    // TODO: not verified since 2017.12.13
    static public function FetchDevicePeers($deviceQueryId = NULL, $ptype = 'online')
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_PEER_TABLE;
                $fields = 'wmac,ipaddr,signal,rx,tx';
                $conditions = "devid='{$deviceQueryId}'";
                $sql = "select {$fields} from {$table} where {$conditions}";
                $records = self::FetchArrayBySql($sql, __FUNCTION__);
                if ($records && is_array($records)) {
                    return $records;
                }
            }
        }
        return NULL;
    }
}

?>
