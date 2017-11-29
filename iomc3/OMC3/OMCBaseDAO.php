<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

// single database connection
abstract class OMCBaseDAO
{
    static protected $DB_MYSQLI = NULL;
    
    static public function OMCDbConnect()
    {
        $conn = self::$DB_MYSQLI;
        if (! $conn) {
            $conn = new mysqli(OMC_DB_HOST, OMC_DB_USER, OMC_DB_PASSWD, '', OMC_DB_PORT);
            self::$DB_MYSQLI = $conn;
            if ($conn) {
                $conn->select_db(OMC_DB_NAME);
                $conn->query('set names "utf-8"');
            }
        }
    }
    
    static public function OMCDbQuery($sql = NULL, $from  = NULL)
    {        
        if (! self::$DB_MYSQLI) {
            self::OMCDbConnect();
        }
        
        // TODO: remove line below in official release
        //echo($from . '(): ' . $sql . "\n");
        
        if ($sql && self::$DB_MYSQLI) {
            $conn = self::$DB_MYSQLI;
            return $conn->query($sql);
        }
        return NULL;
    }
    
    static public function OMCDbFetch($result = NULL)
    {
        if ($result) {
            $reply = NULL;
            while($row = $result->fetch_array()) {
                $reply = $row;
            }
            return $reply;
        }
        return NULL;
    }

}

?>
