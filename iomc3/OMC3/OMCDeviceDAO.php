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
    
    static public function DeviceFoundNew($deviceId= NULL)
    {
        if ($deviceId && self::$DB_MYSQLI) {
            $table = self::$DB_DEVICE_TABLE;
            $sql = "insert into {$table}(wmac) values('{$deviceId}')";
            $result = self::OMCDbQuery($sql, __FUNCTION__);
        }
    }
    
    static public function DeviceExists($deviceId= NULL)
    {
        if ($deviceId) {
            $table = self::$DB_DEVICE_TABLE;
            $sql = "select id from {$table} where wmac='{$deviceId}'";
            $result = self::OMCDbQuery($sql, __FUNCTION__);
            $records = self::OMCDbFetch($result);
            return (true && count($records));
        }
        return false;
    }
    
    static public function CmdsToExecute($deviceId = NULL)
    {
        if ($deviceId) {
            $tableDevice = self::$DB_DEVICE_TABLE;
            $tableDeviceCmd= self::$DB_DEVICE_CMD_TABLE;
            $sql = "select cmd.cmd,cmd.ts from {$tableDeviceCmd} as cmd,{$tableDevice} as dev" . 
                    " where dev.wmac='{$deviceId}' and dev.id=cmd.devid";
            $result = self::OMCDbQuery($sql, __FUNCTION__);
            $records = self::OMCDbFetch($result);
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
   
}

?>
