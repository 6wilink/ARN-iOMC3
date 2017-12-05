<?php
// by Qige <qigezhao@gmail.com> since 2017.11.20
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// single database connection
abstract class OMCBaseDAO
{

    protected static $DB_MYSQLI = NULL;

    static public function OMCDbConnect()
    {
        $conn = self::$DB_MYSQLI;
        if (! $conn) {
            $conn = new mysqli(OMC_DB_HOST, OMC_DB_USER, OMC_DB_PASSWD, '', OMC_DB_PORT);
            self::$DB_MYSQLI = $conn;
            if ($conn) {
                $conn->select_db(OMC_DB_NAME);
                $conn->query('SET NAMES UTF8');
            }
        }
    }

    static public function OMCDbQuery($sql = NULL, $from = NULL)
    {
        if (! self::$DB_MYSQLI) {
            self::OMCDbConnect();
        }
        
        // TODO: remove line below in official release
        // echo($from . '(): ' . $sql . "\n");
        
        if ($sql && self::$DB_MYSQLI) {
            $conn = self::$DB_MYSQLI;
            return $conn->query($sql);
        }
        return NULL;
    }

    static private function OMCDbFetch($result = NULL)
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
    static public function OMCDbFetchBySQL($sql = NULL, $from = NULL)
    {
        if ($sql) {
            $result = self::OMCDbQuery($sql, $from);
            $records = self::OMCDbFetch($result);
            return $records;
        }
        return NULL;
    }

    static public function OMCDbDisconnect()
    {
        $conn = self::$DB_MYSQLI;
        $conn->close();
        self::$DB_MYSQLI = NULL;
    }
}

?>
