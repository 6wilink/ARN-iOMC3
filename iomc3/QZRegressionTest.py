#!/usr/bin/env python
# charset: utf-8
# by Qige <qigezhao@gmail.com> since 2018.03.02

import time
import random

from optparse import OptionParser

import json
import requests

'''
Simulate ARN Device Agent
1. post "sync"
2. post "report" but abb is idle
3. post "report" with abb connected
'''
class ARNDeviceSimulator(object):
    wmac = '86:02:11:89:04:29'
    server = 'localhost'
    def SimReportSync(self):
        data = self.ARNDeviceCommon('sync')
        self.SimHttpReport(data)
        
    def SimReportIdle(self):
        data = self.ARNDeviceCommon('report')
        data['abb_safe'] = self.ARNDeviceABB(0)
        data['nw_thrpt'] = self.ARNDeviceNwThrpt()
        data['radio_safe'] = self.ARNDeviceRadio()
        self.SimHttpReport(data)
        
    def SimReportPeers(self):
        data = self.ARNDeviceCommon('report')
        data['abb_safe'] = self.ARNDeviceABB(2)
        data['nw_thrpt'] = self.ARNDeviceNwThrpt()
        data['radio_safe'] = self.ARNDeviceRadio()
        self.SimHttpReport(data)
        
    def SimHttpReport(self, data):
        payload = {}
        payload['data'] = json.dumps(data, ensure_ascii=True)
        #print(payload)
        headers = { 'user-agent': 'OMC3Agent' }
        url = ('http://%s/iomc3/ws.php?do=report'
            % (self.server or 'localhost'))

        # POST with header, data
        response = requests.post(url, headers = headers, data = payload)
        cmds = response.text
        print(cmds)
    
    def ARNDeviceCommon(self, ops):
        data = {}
        data['ops'] = ops or 'sync'
        data['wmac'] = self.wmac
        data['ts'] = int(time.time())
        return data
        
    def ARNDeviceABB(self, peer_qty):
        data = {}
        data['noise'] = -105
        data['ssid'] = 'QZRTest'
        data['bssid'] = self.wmac
        data['chanbw'] = 8
        data['wmac'] = self.wmac
        data['mode'] = 'Ad-Hoc'
        data['signal'] = -88
        if (peer_qty > 0):
            data['peers'] = []
            for i in range(0, peer_qty):
                peer = self.ARNDeviceABBPeer(i)
                data['peers'].append(peer)
        else:
            data['peer_qty'] = 0
            data['peers'] = None
        
        return data
        
    def ARNDeviceABBPeer(self, idx):
        data = {}
        data['bssid'] = self.wmac
        data['noise'] = -101
        data['inactive'] = 2999
        data['wmac'] = self.wmac
        data['signal'] = -66
        data['rx_short_gi'] = 1
        data['rx_mcs'] = 99
        data['rx_br'] = 54
        data['tx_br'] = 150
        data['tx_mcs'] = 99
        data['tx_short_gi'] = 0
        return data
    
    def ARNDeviceRadio(self):
        data = {}
        data['timeout'] = 60
        data['region'] = 1
        data['elapsed'] = random.randint(0, 60)
        data['freq'] = 666
        data['chanbw'] = random.randint(5, 24)
        data['channo'] = 45
        data['txpwr'] = random.randint(9, 33)
        data['hw_ver'] = 'QZRTest'
        data['rxgain'] = random.randint(0, 20) - 10
        return data
        
    def ARNDeviceNwThrpt(self):
        data = {}
        data['tx'] = random.randint(0, 260) / 10
        data['rx'] = random.randint(0, 260) / 10
        return data


'''
Simulate WebApp:
1. signin
2. device(s) list, +search by id/keyword/status
3. device detail
4. config
5. save config
6. kpi
7. msg(s)
8. maps view
'''
class ARNWebApp(object):
    token = None
    server = None
    def AjaxLogin(self, user, password):
        payloads = { 'user': user, 'passwd': password }
        url = ('http://%s/iomc3/ws.php?do=signin'
            % (self.server or 'localhost'))
        payloads = { 'user': user, 'passwd': password }
        response = requests.post(url, data = payloads)
        result = response.text
        return result
        
    def CBFindToken(self, result):
        try:
            r = json.loads(result)
            return r['data']['auth']['token']
        except:
            pass
        return None
    
    def GetDevices(self):
        try:
            if (self.token):
                url = ('http://%s/iomc3/ws.php?do=devices&token=%s' 
                    % (self.server or 'localhost', self.token))
                response = requests.get(url)
                result = response.text
                return result
        except:
            pass
        return None
        
    def CBFindDevices(self, result):
        try:
            r = json.loads(result)
            return r['data']['devices']
        except:
            pass
        return None

    def GetDeviceDetail(self, deviceid):
        try:
            if (self.token):
                url = ('http://%s/iomc3/ws.php?do=detail&did=%s&token=%s' 
                    % (self.server or 'localhost', deviceid, self.token))
                response = requests.get(url)
                result = response.text
                return result
        except:
            pass
        return None
        
    def CBPrintDeviceDetail(self, result):
        try:
            r = json.loads(result)
            ip = r['data']['device']['ipaddr']
            wmac = r['data']['device']['wmac']
            print('-> device %s + %s' %(ip, wmac))
        except:
            pass
        return

'''
1. ARNDeviceSimulator;
    - report (sync)
    - report (abb idle)
    - report (abb connected)
2. ARNWebAppSimulator.
    - signin
    - fetch devices
    - fetch device detail
'''
def main():
    usage= 'Usage: %prog -s <server> [-u <user>] [-p <password>]'
    parser = OptionParser(usage = usage)
    parser.add_option('-s', '--server', type = 'string', dest = 'server', help = 'which server, default "localhost"')
    parser.add_option('-u', '--user', type = 'string', dest = 'user', help = 'as who, default "admin"')
    parser.add_option('-p', '--password', type = 'string', dest = 'password', help = 'key, default "6harmonics"')
    
    (options, args) = parser.parse_args()

    print('- [init] checking settings ...')
    if (not options.server):
        options.server = 'localhost'
    if (not options.user):
        options.user = 'admin'
    if (not options.password):
        options.password = '6harmonics'

    print('- [Device] simulating arn device ...')
    device = ARNDeviceSimulator()
    device.server = options.server
    print('- [Device] [SYNC] posted ...')
    device.SimReportSync()
    print('- [Device] [ABB idle] posted ...')
    device.SimReportIdle()
    print('- [Device] [ABB good] posted ...')
    device.SimReportPeers()

    print('- [WebApp] trying [SIGNIN] %s ...' % (options.server))
    App = ARNWebApp()
    App.server = options.server
    auth = App.AjaxLogin(options.user, options.password)
    print(auth or '-')
    App.token = App.CBFindToken(auth)
    if (App.token):
        print('- [WebApp] got token [%s]' % (App.token))
    else:
        print('- [WebApp] *** INVALID token [%s] ***' % (App.token or ''))
    
    print('- [WebApp] getting [DEVICES] [%s:%s] ...' % (options.server, App.token or ''))
    devices = App.GetDevices()
    print(devices or '*** INVALID response ***')
    
    devicelist = App.CBFindDevices(devices)
    print('- [WebApp] %dx [DEVICES] found' % (len(devicelist)))
    
    for device in devicelist:
        id = device['id']
        detail = App.GetDeviceDetail(id)
        App.CBPrintDeviceDetail(detail)


if __name__ == '__main__':
    main()
