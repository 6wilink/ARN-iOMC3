<?php
// by Qige <qigezhao@gmail.com> since 2017.11.20
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

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
    private static $DB_DEVICE_PEER_TABLE = 'arn_device_abb_peers';
    private static $DB_DEVICE_RADIO_TABLE = 'arn_device_radio';
    private static $DB_DEVICE_NETWORK_TABLE = 'arn_device_nw';

    private static $DB_DEVICE_ABB_HISTORY_TABLE = 'arn_history_abb';
    private static $DB_DEVICE_RADIO_HISTORY_TABLE = 'arn_history_radio';
    private static $DB_DEVICE_NETWORK_HISTORY_TABLE = 'arn_history_nw';

    private static $DB_DEVICE_LIMIT = 50;

    // --------- --------- --------- Common Query --------- --------- ---------
    // warpper
    static private function firstRecord($table = NULL, $field = NULL, $value = NULL)
    {
        if ($table && $field && $value) {
            $limits = "limit 1";
            $sql = "select id from {$table} where {$field}='{$value}' {$limits}";
            $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
            if ($records && is_array($records)) {
                $firstRecord = current($records);
                return $firstRecord;
            }
        }
        return NULL;
    }

    // needed by: OMCDeviceMngr.findDeviceQueryId();
    // verified since 2017.12.04
    static public function DeviceQueryId($deviceId = NULL)
    {
        $deviceQueryId = NULL;
        if ($deviceId) {
            // find device query id
            $table = self::$DB_DEVICE_TABLE;
            $firstRecord = self::firstRecord($table, 'wmac', $deviceId);
            if ($firstRecord && is_array($firstRecord)) {
                $deviceQueryId = current($firstRecord);
            }
        }
        return $deviceQueryId;
    }

    // needed by: OMCDeviceMngr.findDeviceQueryId();
    // verified since 2017.12.04
    static public function DeviceStatusQueryId($table = NULL, $deviceQueryId = NULL)
    {
        $deviceStatusQueryId = NULL;
        if ($deviceQueryId && $table) {
            // find device query id
            $firstRecord = self::firstRecord($table, 'devid', $deviceQueryId);
            if ($firstRecord && is_array($firstRecord)) {
                $deviceStatusQueryId = current($firstRecord);
            }
        }
        return $deviceStatusQueryId;
    }

    // --------- --------- --------- Agent Mngr --------- --------- ---------
    // verified since 2017.11.04
    static public function NewDeviceFound($deviceId = NULL)
    {
        if ($deviceId && self::$DB_MYSQLI) {
            $table = self::$DB_DEVICE_TABLE;
            $sql = "insert into {$table}(wmac) values('{$deviceId}')";
            $result = self::OMCDbQuery($sql, __FUNCTION__);
        }
    }

    // verified since 2017.11.04
    static public function DeviceExists($deviceId = NULL)
    {
        $table = self::$DB_DEVICE_TABLE;
        return ($deviceId && self::firstRecord($table, 'wmac', $deviceId));
    }

    // called by:
    // 1. OMCDeviceMngr.deviceRadioUpdate()
    // 2. self::DeviceSaveTs
    static public function DeviceSave($deviceQueryId = NULL, $data = NULL)
    {
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
            $result = self::OMCDbQuery($sql, __FUNCTION__);
        }
    }

    static public function DeviceStatusSave($deviceQueryId = NULL, $where = NULL, $data = NULL)
    {
        $deviceStatusQueryId = NULL;
        
        $deviceStatusTable = NULL;
        // where to save
        switch ($where) {
            case 'abb':
                $deviceStatusTable = self::$DB_DEVICE_ABB_TABLE;
                break;
            case 'radio':
                $deviceStatusTable = self::$DB_DEVICE_RADIO_TABLE;
                break;
            case 'nw':
            default:
                $deviceStatusTable = self::$DB_DEVICE_NETWORK_TABLE;
                break;
        }
        
        if ($deviceQueryId && is_numeric($deviceQueryId) && $deviceQueryId > 0) {
            $deviceStatusQueryId = self::DeviceStatusQueryId($deviceStatusTable, $deviceQueryId);
        }
        
        // generate sql
        $kv = array();
        if ($deviceStatusQueryId && $deviceStatusQueryId > 0) {
            $now = date('Y-m-d H:i:s');
            $kv[] = "ts='{$now}'";
            // update record
            foreach ($data as $key => $val) {
                $kv[] = "{$key}='{$val}'";
            }
            $updates = implode(',', $kv);
            $conditions = "devid='{$deviceQueryId}'";
            $sql = "update {$deviceStatusTable} set {$updates} where {$conditions}";
        } else {
            // insert record
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
            $sql = "insert into {$deviceStatusTable}({$fields}) values({$values})";
        }
        
        // execute & save
        $result = self::OMCDbQuery($sql, __FUNCTION__);
    }

    // insert into abb history
    // TODO: prevent two or more agents running as daemon
    static public function DeviceStatusHistorySave($deviceQueryId = NULL, $table = NULL, $data = NULL)
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
            
            $result = self::OMCDbQuery($sql, __FUNCTION__);
        }
    }

    // --------- --------- Agent Cmds from Admin --------- --------- ---------
    // TODO: not verified since 2017.11.04
    static public function CmdsToExecute($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $tableDeviceCmd = self::$DB_DEVICE_CMD_TABLE;
            $qty = self::$DB_DEVICE_LIMIT;
            $limits = "limit {$qty}";
            $sql = "select cmd.cmd,cmd.ts from {$tableDeviceCmd} where devid='{$deviceQueryId}' {$limits}";
            $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
            $cmds = BaseFilter::SearchKey($records, 'cmd');
            return $cmds;
        }
        return NULL;
    }

    // --------- --------- --------- Device List --------- --------- ---------
    // fetch device list, support device id or keyword search
    // TODO: not verified since 2017.11.04
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
            return self::OMCDbFetchBySQL($sql);
        }
        return NULL;
    }
    
    // verified since 2017.11.04
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
                return self::OMCDbFetchBySQL($sql);
            }
        }
        
        return self::DeviceListFetchAll();
    }
    
    // TODO: not verified since 2017.11.04
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
        return self::OMCDbFetchBySQL($sql);
    }
    
    // --------- --------- --------- Device Details --------- --------- ---------
    // verified since 2017.11.04
    static public function FetchDeviceBasicDetail($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $table1 = self::$DB_DEVICE_TABLE;
            $table2 = self::$DB_DEVICE_NETWORK_TABLE;
            
            $tables = "{$table1} as dev, {$table2} as nw";
            $fields = 'dev.wmac,dev.name,dev.fw_ver,dev.hw_ver,nw.ipaddr,nw.netmask';
            $conditions = "dev.id=nw.devid and dev.id='{$deviceQueryId}'";
            $sql = "select {$fields} from {$tables} where {$conditions}";
            $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
            if ($records && is_array($records)) {
                return current($records); // = $records[0]
            }
        }
        return NULL;
    }
    
    // verified since 2017.11.04
    static public function FetchDeviceNetworkDetail($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $tables = self::$DB_DEVICE_NETWORK_TABLE;
            $fields = 'ipaddr,netmask,gw,ifname,vlan';
            $conditions = "devid='{$deviceQueryId}'";
            $sql = "select {$fields} from {$tables} where {$conditions}";
            $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
            if ($records && is_array($records)) {
                return current($records); // = $records[0]
            }
        }
        return NULL;
    }
    
    
    // wrapper for WSDeviceMngr: search device that match conditions
    // TODO: not verified since 2017.11.04
    static public function FetchDevicePeerQty($deviceQueryId = NULL, $ptype = 'online')
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_PEER_TABLE;
                $fields = 'count(id) as qty';
                $conditions = "devid='{$deviceQueryId}'";
                $sql = "select {$fields} from {$table} where {$conditions}";
                $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
                if ($records && is_array($records)) {
                    return current($records); // = $records[0]
                }
            }
        }
        return 0;
    }

    // TODO: not verified since 2017.11.04
    static public function FetchDevicePeers($deviceQueryId = NULL, $ptype = 'online')
    {
        if ($deviceQueryId) {
            $deviceQueryIdSafe = (int) $deviceQueryId;
            if ($deviceQueryIdSafe > 0) {
                $table = self::$DB_DEVICE_PEER_TABLE;
                $fields = 'wmac,ipaddr,signal,rx,tx';
                $conditions = "devid='{$deviceQueryId}'";
                $sql = "select {$fields} from {$table} where {$conditions}";
                $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
                if ($records && is_array($records)) {
                    return $records;
                }
            }
        }
        return NULL;
    }


}

?>
