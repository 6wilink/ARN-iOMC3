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

    protected static $DB_MYSQLI = null;

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
    static public function QueryBySql($sql = null, $from = null)
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
        return null;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static private function FetchArray($result = null)
    {
        if ($result) {
            $reply = array();
            while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $reply[] = $row;
            }
            return $reply;
        }
        return null;
    }

    // wrapper for fetch
    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function FetchArrayBySql($sql = null, $from = null)
    {
        if ($sql) {
            $result = self::QueryBySql($sql, $from);
            $records = self::FetchArray($result);
            return $records;
        }
        return null;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function Fetch($table = null, $rfields = null, $rfilter = null, $limit = null, $orderby = null)
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
            if ($orderby) {
                $sql .= " order by {$orderby}";
            } else {
                $sql .= " order by id desc";
            }
            if ($limit) {
                $sql .= " limit {$limit}";
            }
            return self::FetchArrayBySql($sql, __FUNCTION__);
        }
        return null;
    }

    // verifed since 2017.12.28 16:56
    static public function FetchInMultiTables($tables = null, $rfields = null, $joins = null, $rfilter = null, $rsearch = null)
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
        return null;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function FetchFirstRecord($table = null, $rfields = null, $rfilter = null, $order = 'id desc')
    {
        $limit = 1;
        $records = self::Fetch($table, $rfields, $rfilter, $limit, $order);
        if ($records && is_array($records)) {
            return current($records);
        }
        return null;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function FetchFieldsOfFirstRecord($table = null, $rfields = null, $rfilter = null)
    {
        $record = self::FetchFirstRecord($table, $rfields, $rfilter);
        if ($record && is_array($record)) {
            return current($record);
        }
        return null;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function Insert($table = null, $data = null, $from = null)
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
        return null;
    }

    // verifed since 2017.12.12|2017.12.21
    // verifed since 2017.12.28 16:56
    static public function Update($table = null, $data = null, $filter = null, $from = null)
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
        return null;
    }

    // TODO: if delete record needed
    static public function Delete($table = null, $filter = null, $from = null)
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
        self::$DB_MYSQLI = null;
    }
}

?>
