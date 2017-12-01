<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

require_once BPATH . '/Common/BaseInterface.php';
require_once BPATH . '/Common/BaseFilter.php';
require_once BPATH . '/OMC3/OMCConfig.php';
require_once BPATH . '/OMC3/OMCBaseDAO.php';

// query via OMCDatabaseConn
final class OMCDeviceDAO extends OMCBaseDAO
{
    
    static private $DB_DEVICE_TABLE = 'arn_device';
    static private $DB_DEVICE_CMD_TABLE = 'arn_device_cmd';
    static private $DB_DEVICE_ABB_TABLE = 'arn_kpi_abb';
    static private $DB_DEVICE_RADIO_TABLE = 'arn_kpi_radio';
    static private $DB_DEVICE_PEER_TABLE = 'arn_peers';
    
    static private $DB_DEVICE_LIMIT = 50;
    
    static public function DeviceFoundNew($uniqId = NULL)
    {
        if ($uniqId&& self::$DB_MYSQLI) {
            $table = self::$DB_DEVICE_TABLE;
            $sql = "insert into {$table}(wmac) values('{$uniqId}')";
            $result = self::OMCDbQuery($sql, __FUNCTION__);
        }
    }
    
    static public function DeviceExists($uniqId= NULL)
    {
        if ($uniqId) {
            $table = self::$DB_DEVICE_TABLE;
            $qty = self::$DB_DEVICE_LIMIT;
            $limits = "limit {$qty}";
            $sql = "select id from {$table} where wmac='{$uniqId}' {$limits}";
            $records= self::OMCDbFetchBySQL($sql, __FUNCTION__);
            return (true && count($records));
        }
        return false;
    }
    
    static public function CmdsToExecute($deviceId = NULL)
    {
        if ($deviceId) {
            $tableDevice = self::$DB_DEVICE_TABLE;
            $tableDeviceCmd= self::$DB_DEVICE_CMD_TABLE;
            $qty = self::$DB_DEVICE_LIMIT;
            $limits = "limit {$qty}";
            $sql = "select cmd.cmd,cmd.ts from {$tableDeviceCmd} as cmd,{$tableDevice} as dev" . 
                    " where dev.wmac='{$deviceId}' and dev.id=cmd.devid {$limits}";
            $records= self::OMCDbFetchBySQL($sql, __FUNCTION__);
            $cmds = BaseFilter::SearchKey($records, 'cmd');
            return $cmds;
        }
        return NULL;
    }
    
  
    static public function DeviceUpdateTs($deviceId = NULL, $host = NULL)
    {
        if ($deviceId) {
            $now = date('Y-m-d H:i:s');
            $updates = "ts='{$now}'";
            if ($host) {
                $updates .=",ipaddr='{$host}'";
            }
            $table = self::$DB_DEVICE_TABLE;
            $sql = "update {$table} set {$updates} where wmac='{$deviceId}'";
            $result = self::OMCDbQuery($sql, __FUNCTION__);
        }
        return NULL;
    }
    
    
    static public function DeviceRadioRecordInsert($deviceId = NULL, $data = NULL)
    {
        if ($deviceId && $data && is_array($data)) {
            $update = key_exists('update', $data) ? $data['update'] : NULL;
            if ($update && is_array($update)) {
                $keys = array(); $vals = array();
                foreach($update as $key => $val) {
                    $keys[] = "{$key}";
                    $vals[] = "'{$val}'";
                }
                $k = implode(',', $keys);
                $v = implode(',', $vals);
                $tableKpi= self::$DB_DEVICE_RADIO_TABLE;
                $tableDevice = self::$DB_DEVICE_TABLE;
                $sql = "insert into {$tableKpi}(devid,{$k}) values((select id from {$tableDevice} where wmac='{$deviceId}'),{$v})";
                $result = self::OMCDbQuery($sql, __FUNCTION__);
            }
        }
    }
    
    static public function DeviceNetworkRecordInsert($deviceId = NULL, $data = NULL)
    {
        if ($deviceId && $data && is_array($data)) {
            $update = key_exists('update', $data) ? $data['update'] : NULL;
            if ($update && is_array($update)) {
                $keys = array(); $vals = array();
                foreach($update as $key => $val) {
                    $keys[] = "{$key}";
                    $vals[] = "'{$val}'";
                }
                $k = implode(',', $keys);
                $v = implode(',', $vals);
                $tableKpi= self::$DB_DEVICE_RADIO_TABLE;
                $tableDevice = self::$DB_DEVICE_TABLE;
                $sql = "insert into {$tableKpi}(devid,{$k}) values((select id from {$tableDevice} where wmac='{$deviceId}'),{$v})";
                $result = self::OMCDbQuery($sql, __FUNCTION__);
            }
        }
    }
    
    static public function DeviceAbbRecordInsert($deviceId = NULL, $data = NULL)
    {
        if ($deviceId && $data && is_array($data)) {
            $update = key_exists('update', $data) ? $data['update'] : NULL;
            if ($update && is_array($update)) {
                $keys = array(); $vals = array();
                foreach($update as $key => $val) {
                    $keys[] = "{$key}";
                    $vals[] = "'{$val}'";
                }
                $k = implode(',', $keys);
                $v = implode(',', $vals);
                $tableKpi= self::$DB_DEVICE_ABB_TABLE;
                $tableDevice = self::$DB_DEVICE_TABLE;
                $sql = "insert into {$tableKpi}(devid,{$k}) values((select id from {$tableDevice} where wmac='{$deviceId}'),{$v})";
                $result = self::OMCDbQuery($sql, __FUNCTION__);
            }
        }
    }
    
    // fetch device list, support device id or keyword search
    static public function DeviceListSearchById($deviceQueryId = NULL)
    {
        if ($deviceQueryId) {
            $safeQid = (int) $deviceQueryId;
            if ($safeQid) {
                $table = self::$DB_DEVICE_TABLE;
                $qty = self::$DB_DEVICE_LIMIT;
                $limits = "limit {$qty}";
                $fields = 'id,name,ipaddr';
                $sql = "select {$fields} from {$table} where id={$safeQid} {$limits}";
                return self::fetchDeviceListBySQL($sql);
            }
        }
        return NULL;
    }
    
    static public function DeviceListSearchByKeyword($keyword = NULL)
    {
        if ($keyword) {
            $safeKw = BaseFilter::FilterAll($keyword);
            $safeQid = (int) $safeKw;
            if ($safeQid > 0) {
                return self::DeviceListSearchById($safeQid);
            } else if ($safeKw) {
                $table = self::$DB_DEVICE_TABLE;
                $qty = self::$DB_DEVICE_LIMIT;
                $limits = "limit {$qty}";
                $fields = 'id,name,ipaddr';
                $conditions = "id={$safeQid} or name like '%{$safeKw}%' or ipaddr like '%{$safeKw}%'";
                $sql = "select {$fields} from {$table} where {$conditions} {$limits}";
                return self::fetchDeviceListBySQL($sql);
            }
        }
        return NULL;
    }
    
    static public function DeviceListFetchAll($filterStatus = NULL)
    {
        $table = self::$DB_DEVICE_TABLE;
        $qty = self::$DB_DEVICE_LIMIT;
        $limits = "limit {$qty}";
        $fields = 'id,name,ipaddr';
        switch($filterStatus) {
            case 'offline':
                $conditions = "where reachable='offline'";
                break;
            case 'online':
                $conditions = "where reachable='online'";
                break;
            case 'all':
            default:
                $conditions = '';
                break;
        }
        $sql = "select {$fields} from {$table} {$conditions} {$limits}";
        return self::fetchDeviceListBySQL($sql);
    }
    
    static private function fetchDeviceListBySQL($sql = NULL)
    {
        if ($sql) {
            $records = self::OMCDbFetchBySQL($sql, __FUNCTION__);
            if ($records && is_array($records)) {
                $reply = array();
                foreach($records as $record) {
                    $did = BaseFilter::SearchKey($record, 'id');
                    $name = BaseFilter::SearchKey($record, 'name');
                    $ipaddr = BaseFilter::SearchKey($record, 'ipaddr');
                    $r = array(
                        'id' => $did,
                        'name' => $name,
                        'ipaddr' => $ipaddr,
                        'peer_qty' => self::FetchDevicePeerQty($did)
                    );
                    $reply[] = $r;
                }
                return $reply;
            }
        }
        return NULL;
    }
    
    static public function FetchDevicePeerQty($deviceQueryId = NULL)
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
                    return BaseFilter::SearchKey($records, 'qty');
                }
            }
        }
        return 0;
    }
    
}

?>
