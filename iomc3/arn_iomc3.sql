# Host: 192.168.1.4  (Version 5.1.73)
# Date: 2018-02-26 12:13:11
# Generator: MySQL-Front 6.0  (Build 2.20)


#
# Structure for table "arn_auth"
#

CREATE TABLE `arn_auth` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `nologin` binary(1) NOT NULL DEFAULT '0',
  `admin` binary(1) NOT NULL DEFAULT '0',
  `gid` tinyint(3) unsigned DEFAULT NULL,
  `nickname` varchar(32) CHARACTER SET latin1 DEFAULT NULL,
  `user` varchar(16) CHARACTER SET latin1 NOT NULL DEFAULT '-',
  `passwd` varchar(42) CHARACTER SET latin1 NOT NULL DEFAULT '-',
  `token` varchar(32) DEFAULT NULL,
  `host` varchar(16) CHARACTER SET latin1 DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user` (`user`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

#
# Data for table "arn_auth"
#

INSERT INTO `arn_auth` VALUES (1,X'30',X'30',NULL,NULL,'admin','*D6FEE54B40F5654D433868F7073C537ACB6B0C98',NULL,NULL,'2018-02-26 12:10:54'),(2,X'30',X'30',NULL,NULL,'qigez','*D6FEE54B40F5654D433868F7073C537ACB6B0C98',NULL,NULL,'2018-02-26 12:10:54');

#
# Structure for table "arn_auth_group"
#

CREATE TABLE `arn_auth_group` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) DEFAULT NULL,
  `contact` varchar(64) DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

#
# Data for table "arn_auth_group"
#


#
# Structure for table "arn_device"
#

CREATE TABLE `arn_device` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `gid` tinyint(3) unsigned DEFAULT NULL,
  `name` varchar(32) DEFAULT NULL,
  `mac` varchar(18) NOT NULL DEFAULT '-',
  `wmac` varchar(18) DEFAULT NULL,
  `hw_ver` varchar(64) DEFAULT NULL,
  `fw_ver` varchar(64) DEFAULT NULL,
  `latlng` varchar(32) DEFAULT NULL,
  `lat` double(10,8) DEFAULT NULL,
  `lng` double(11,8) DEFAULT NULL,
  `addat` datetime DEFAULT NULL,
  `auditat` datetime DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_wmac` (`wmac`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

#
# Data for table "arn_device"
#


#
# Structure for table "arn_device_abb"
#

CREATE TABLE `arn_device_abb` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `devid` int(11) NOT NULL DEFAULT '0',
  `emode` enum('unknown','mesh','sta','ap','adhoc') COLLATE latin1_general_ci DEFAULT NULL,
  `ssid` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `bssid` varchar(18) COLLATE latin1_general_ci DEFAULT NULL,
  `noise` tinyint(3) DEFAULT NULL,
  `chanbw` tinyint(3) unsigned DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_devid` (`devid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci ROW_FORMAT=FIXED;

#
# Data for table "arn_device_abb"
#


#
# Structure for table "arn_device_abb_peers"
#

CREATE TABLE `arn_device_abb_peers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `devid` int(11) unsigned DEFAULT '0',
  `realtime` enum('connected','unreachable') COLLATE latin1_general_ci DEFAULT NULL,
  `pwmac` varchar(18) COLLATE latin1_general_ci DEFAULT NULL,
  `pipaddr` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `psignal` tinyint(3) DEFAULT NULL,
  `prx` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `ptx` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_peer` (`pwmac`,`devid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

#
# Data for table "arn_device_abb_peers"
#


#
# Structure for table "arn_device_cmd"
#

CREATE TABLE `arn_device_cmd` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `done` enum('new','done') COLLATE latin1_general_ci DEFAULT 'done',
  `ttl` tinyint(3) unsigned NOT NULL DEFAULT '3',
  `devid` int(11) unsigned DEFAULT NULL,
  `cmd` varchar(64) COLLATE latin1_general_ci DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

#
# Data for table "arn_device_cmd"
#


#
# Structure for table "arn_device_nw"
#

CREATE TABLE `arn_device_nw` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `devid` int(11) unsigned DEFAULT NULL,
  `reachable` enum('unknown','online','offline') COLLATE latin1_general_ci DEFAULT NULL,
  `ipaddr` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `netmask` varchar(16) COLLATE latin1_general_ci DEFAULT NULL COMMENT '255.255.255.0',
  `gateway` varchar(32) COLLATE latin1_general_ci DEFAULT NULL,
  `ifname` varchar(32) COLLATE latin1_general_ci DEFAULT NULL COMMENT 'lo,br-lan,eth0,wlan0,wlan0.sta1,bat0',
  `vlan` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uniq_devid` (`devid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci ROW_FORMAT=DYNAMIC;

#
# Data for table "arn_device_nw"
#


#
# Structure for table "arn_device_radio"
#

CREATE TABLE `arn_device_radio` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `devid` int(11) NOT NULL DEFAULT '0',
  `region` bit(1) NOT NULL DEFAULT b'1' COMMENT '1: 8M, CN; 0: 6M, US',
  `channel` tinyint(3) unsigned DEFAULT NULL,
  `freq` smallint(4) unsigned DEFAULT NULL,
  `chanbw` tinyint(3) unsigned DEFAULT NULL,
  `txpwr` tinyint(3) DEFAULT NULL,
  `rxgain` tinyint(3) DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci ROW_FORMAT=FIXED;

#
# Data for table "arn_device_radio"
#


#
# Structure for table "arn_history_abb"
#

CREATE TABLE `arn_history_abb` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `devid` int(11) NOT NULL DEFAULT '0',
  `emode` enum('mesh','sta','ap','adhoc') COLLATE latin1_general_ci DEFAULT NULL,
  `chanbw` tinyint(3) unsigned DEFAULT NULL,
  `ssid` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `bssid` varchar(18) COLLATE latin1_general_ci DEFAULT NULL,
  `noise` tinyint(3) DEFAULT NULL,
  `signal` tinyint(3) NOT NULL DEFAULT '0',
  `rx` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `tx` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci ROW_FORMAT=FIXED;

#
# Data for table "arn_history_abb"
#


#
# Structure for table "arn_history_nw"
#

CREATE TABLE `arn_history_nw` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `devid` int(11) NOT NULL DEFAULT '0',
  `ifname` varchar(16) COLLATE latin1_general_ci DEFAULT NULL,
  `rxbytes` int(11) unsigned DEFAULT NULL,
  `txbytes` int(11) unsigned DEFAULT NULL,
  `elapsed` int(11) unsigned NOT NULL DEFAULT '1',
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci ROW_FORMAT=FIXED;

#
# Data for table "arn_history_nw"
#


#
# Structure for table "arn_history_radio"
#

CREATE TABLE `arn_history_radio` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `devid` int(11) NOT NULL DEFAULT '0',
  `region` bit(1) NOT NULL DEFAULT b'1' COMMENT '1: 8M, CN; 0: 6M, US',
  `channel` tinyint(3) unsigned DEFAULT NULL,
  `freq` smallint(4) unsigned DEFAULT NULL,
  `chanbw` tinyint(3) unsigned DEFAULT NULL,
  `txpwr` tinyint(3) unsigned DEFAULT NULL,
  `rxgain` tinyint(3) DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

#
# Data for table "arn_history_radio"
#


#
# Structure for table "arn_msg"
#

CREATE TABLE `arn_msg` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mtype` enum('NOTE',' ALARM',' ERROR') COLLATE latin1_general_ci DEFAULT NULL,
  `comid` int(11) unsigned DEFAULT NULL,
  `desc` varchar(64) CHARACTER SET utf8 DEFAULT NULL,
  `done` enum('unread','read') COLLATE latin1_general_ci NOT NULL DEFAULT 'unread',
  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

#
# Data for table "arn_msg"
#

