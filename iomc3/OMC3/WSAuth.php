<?php


final class WSAuth
{
    // TODO: find "user", "passwd", verify by DAO
    // return "TOKEN"
    static public function Signin($data = NULL)
    {
        $reply = NULL;
        
        $user = BaseFilter::SearchKey($data, 'user');
        $passwd = BaseFilter::SearchKey($data, 'passwd');
        
        $token = self::TokenGenerate();
        if ($token) {
            $reply = array(
                'token' => $token,
                'timeout' => 3600
            );
        }
        
        return $reply;
    }
    
    static public function Signout($data = NULL)
    {
        $token = BaseFilter::FindValByKey($data, 'token');
        return NULL;
    }
    
    static public function IsTokenValid($data = NULL)
    {
        $token = BaseFilter::FindValByKey($data, 'token');
        // TODO: query token via DAO
        return NULL;
    }
    
    static private function TokenGenerate($key = ' ')
    {
        if (function_exists('md5')) {
            return md5($key);
        }
        return NULL;
    }
}