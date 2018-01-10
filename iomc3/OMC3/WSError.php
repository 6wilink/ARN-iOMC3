<?php
// by Qige <qigezhao@gmail.com> since 2017.11.29
// 2017.12.21/2017.12.28

'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

const ERROR_NONE                = 0;
const ERROR_EMPTY_RESPONSE      = -1;

const ERROR_BAD_AUTH_USRPWD     = -5;
const ERROR_BAD_AUTH_ENV        = -6;
const ERROR_BAD_TOKEN_MAKER     = -7;
const ERROR_BAD_TOKEN           = -8;

const ERROR_UNKNOWN_AR_UA       = -11;
const ERROR_UNKNOWN_AR_DEVICEID = - 12;
const ERROR_EMPTY_AR_CONTENT    = - 13;

const ERROR_BAD_REQUEST_PARAM   = -21;


// handle all error, errno
// 2017.12.28 17:18
final class OMCError
{

    static public function GetErrorInArray($eid = ERROR_NONE, $who = NULL)
    {
        $reply = array();
        $reply['errno'] = $eid;
        $reply['error'] = self::GetErroDesc($eid);
        $reply['who'] = strtolower($who);
        return $reply;
    }

    static public function GetErroDesc($eid = ERROR_NONE)
    {
        $err = '';
        
        switch ($eid) {
            case ERROR_BAD_REQUEST_PARAM:
                $err = 'request_with_bad_input';
                break;
            case ERROR_EMPTY_AR_CONTENT:
                $err = 'empty_agent_report';
                break;
            case ERROR_UNKNOWN_AR_DEVICEID:
                $err = 'unknown_agent_id_in_report';
                break;
            case ERROR_BAD_TOKEN:
                $err = 'bad_auth_token';
                break;
            case ERROR_BAD_AUTH_USRPWD:
                $err = 'bad_auth_user_or_password';
                break;
            case ERROR_BAD_TOKEN_MAKER:
                $err = 'bad_auth_token_maker';
                break;
            case ERROR_BAD_AUTH_ENV:
                $err = 'bad_auth_env';
                break;
            case ERROR_UNKNOWN_AR_UA:
                $err = 'unknown_request_source';
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
