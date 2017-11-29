<?php
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

const ERROR_NONE = 0;
const ERROR_EMPTY_RESPONSE = - 1;

const ERROR_UNKNOWN_AR_DEVICEID= - 11;
const ERROR_UNKNOWN_AR_FORMAT = - 12;

//
final class OMCError
{

    static public function GetErrorInArray($eid = ERROR_NONE, $who = NULL)
    {
        $reply = array();
        $reply['errno'] = $eid;
        $reply['error'] = self::GetErroDesc($eid);
        $reply['who'] = $who;
        return $reply;
    }

    static public function GetErroDesc($eid = ERROR_NONE)
    {
        $err = '';
        
        switch ($eid) {
            case ERROR_UNKNOWN_AR_FORMAT:
                $err = 'unknown_agent_report_data_format';
                break;
            case ERROR_UNKNOWN_AR_DEVICEID:
                $err = 'unknown_agent_report_device_id';
                break;
            case ERROR_EMPTY_RESPONSE:
                $err = 'no_reply_with_input';
                break;
            case ERROR_NONE:
                $err = 'none';
                break;
            default:
                $err = 'unknown_error';
                break;
        }
        
        return $err;
    }
}

?>
