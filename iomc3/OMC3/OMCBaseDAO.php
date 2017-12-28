<?php
// by Qige <qigezhao@gmail.com> since 2017.11.20
// 2017.12.13/2017.12.21
// 2017.12.28 FetchInMultiTables() verified
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// single database connection
// verifed since 2017.12.28 16:55
abstract class OMCBaseDAO
{

    protected static $DB_MYSQLI = NULL;

    // verifed since 2017.12.12
    // verifed since 2017.12.21 16:55
    static public function Connect()
    {
        $conn = self::$DB_MYSQLI;
        if (! $conn) {
            $conn = @new mysqli(OMC_DB_HOST, OMC_DB_USER, OMC_DB_PASSWD, '', OMC_DB_PORT);
            self::$DB_MYSQLI = $conn;
            if (! $conn->connect_error) {
                $conn->select_db(OMC_DB_NAME);
                $conn->query('SET NAMES UTF8');
            }
        }
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:55
    static public function QueryBySql($sql = NULL, $from = NULL)
    {
        if (! self::$DB_MYSQLI) {
            self::Connect();
        }
        
        // TODO: remove line below in official release
        // echo($from . '(): ' . $sql . "\n");
        
        if ($sql && self::$DB_MYSQLI) {
            $conn = self::$DB_MYSQLI;
            return @$conn->query($sql);
        }
        return NULL;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static private function FetchArray($result = NULL)
    {
        if ($result) {
            $reply = array();
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $reply[] = $row;
            }
            return $reply;
        }
        return NULL;
    }

    // wrapper for fetch
    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function FetchArrayBySql($sql = NULL, $from = NULL)
    {
        if ($sql) {
            $result = self::QueryBySql($sql, $from);
            $records = self::FetchArray($result);
            return $records;
        }
        return NULL;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function Fetch($table = NULL, $rfields = NULL, $rfilter = NULL)
    {
        if ($table && $rfilter && is_array($rfilter)) {
            if ($rfields && is_array($rfields)) {
                $fields = implode(',', $rfields);
            } else {
                $fields = 'id';
            }
            
            $kv = array();
            foreach ($rfilter as $k => $v) {
                $kv[] = "{$k}='{$v}'";
            }
            $conditions = implode(' and ', $kv);
            
            $sql = "select {$fields} from {$table} where {$conditions}";
            return self::FetchArrayBySql($sql, __FUNCTION__);
        }
        return NULL;
    }

    // verifed since 2017.12.28 16:56
    static public function FetchInMultiTables($tables = NULL, $rfields = NULL, $joins = NULL, $rfilter = NULL, $rsearch = NULL)
    {
        if ($tables && $joins && is_array($tables) && is_array($joins)) {
            $table = implode(',', $tables);
            $join = implode(' and ', $joins);
            
            if ($rfields && is_array($rfields)) {
                $fields = implode(',', $rfields);
            } else {
                $fields = 'id';
            }
            
            $conditions = '';
            if ($rfilter && is_array($rfilter)) {
                $kv = array();
                foreach ($rfilter as $k => $v) {
                    $kv[] = "{$k}='{$v}'";
                }
                $conditions = implode(',', $kv);
            }
            
            $search = '';
            if ($rsearch && is_array($rsearch)) {
                $kv = array();
                foreach ($rsearch as $k => $v) {
                    $kv[] = "{$k} like '{$v}'";
                }
                $search = implode(' or ', $kv);
            }
            
            $sql = "select {$fields} from {$table} where {$join}";
            if ($conditions != '') {
                $sql .= " and {$conditions}";
            }
            
            if ($search != '') {
                $sql .= " and ({$search})";
            }
            
            return self::FetchArrayBySql($sql, __FUNCTION__);
        }
        return NULL;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function FetchFirstRecord($table = NULL, $rfields = NULL, $rfilter = NULL)
    {
        $records = self::Fetch($table, $rfields, $rfilter);
        if ($records && is_array($records)) {
            return current($records);
        }
        return NULL;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function FetchFieldsOfFirstRecord($table = NULL, $rfields = NULL, $rfilter = NULL)
    {
        $record = self::FetchFirstRecord($table, $rfields, $rfilter);
        if ($record && is_array($record)) {
            return current($record);
        }
        return NULL;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function Insert($table = NULL, $data = NULL, $from = NULL)
    {
        if ($table && $data && is_array($data)) {
            $keys = array();
            $vals = array();
            foreach ($data as $k => $v) {
                $keys[] = $k;
                $vals[] = "'{$v}'";
            }
            $fields = implode(',', $keys);
            $values = implode(',', $vals);
            $sql = "insert into {$table}({$fields}) values({$values})";
            return self::QueryBySql($sql, $from);
        }
        return NULL;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function Update($table = NULL, $data = NULL, $filter = NULL, $from = NULL)
    {
        if ($table && $data && is_array($data) && $filter && is_array($filter)) {
            $kv = array();
            foreach ($data as $k => $v) {
                $kv[] = "{$k}='{$v}'";
            }
            $updates = implode(',', $kv);
            
            $kv = array();
            foreach ($filter as $k => $v) {
                $kv[] = "{$k}='{$v}'";
            }
            $conditions = implode(',', $kv);
            
            $sql = "update {$table} set {$updates} where {$conditions}";
            return self::QueryBySql($sql, $from);
        }
        return NULL;
    }

    // TODO: if delete record needed
    static public function Delete($table = NULL, $filter = NULL, $from = NULL)
    {
        ;
    }

    // verifed since 2017.12.12
    // verifed since 2017.12.28 16:56
    static public function Disconnect()
    {
        $conn = self::$DB_MYSQLI;
        if ($conn) {
            $conn->close();
        }
        self::$DB_MYSQLI = NULL;
    }
}

?>
