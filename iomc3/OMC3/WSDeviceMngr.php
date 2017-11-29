<?php



final class WSDeviceMngr
{
    static public function DeviceSearch($keyword = NULL, $deviceQueryId = NULL)
    {
        $reply = array();
        $devices = array(
            'qty' => self::DeviceStatistics(),
            'qqty' => 2,
            'list' => array(
                array(
                    'id' => 1,
                    'name' => '山西现网#1',
                    'msg_qty' => self::DeviceMsgs(0)
                ),
                array(
                    'id' => 2,
                    'name' => 'ShanXi山西现网#2',
                    'msg_qty' => self::DeviceMsgs(2)
                )
            )
        );
        $reply['data'] = $devices;
        return $reply;
    }
    
    static private function DeviceStatistics()
    {
        return array(
            'total' => 2,
            'online' => 1,
            'offline' => 1
        );
    }
    
    static public function DeviceMsgs($deviceId = NULL)
    {
        return $deviceId ? $deviceId : 0;
    }
}

?>
