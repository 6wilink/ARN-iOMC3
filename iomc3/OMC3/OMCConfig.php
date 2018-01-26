<?php
// by Qige <qigezhao@gmail.com>
// 2017.11.15 v3.0.0
// 2017.11.16 v3.0.2
'use strict';
(! defined('CALLED_BY')) && exit('404: Page Not Found');

const FLAG_DAO_LOCAL = 1;
const FLAG_DAO_DISPATCH = 2;

const OMC_DB_TYPE = 1;

const OMC_DB_HOST = '192.168.1.4';
const OMC_DB_PORT = 3306;
const OMC_DB_USER = 'iomc3rw';
const OMC_DB_PASSWD = 'iomc3passwd';
const OMC_DB_NAME = 'arn_iomc3';

const OMC3_DEVICE_SYNC_INTERVAL = 5;
const OMC3_DEVICE_STATUS_ONLINE = 1;
const OMC3_DEVICE_STATUS_OFFLINE = 0;
const OMC3_DEVICE_STATUS_UNKNOWN = - 1;

?>
